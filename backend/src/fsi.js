// src/fsi.js
const pool = require('./config/db');

// Typical total flight hours for PPL / CPL
const TOTAL_HOURS = {
    ppl: 50,   // average PPL
    cpl: 200   // average CPL including PPL
};

// Lesson type weights
const LESSON_TYPE_WEIGHTS = {
    CHECKRIDE: 1.5,
    DUAL: 1.2,
    SOLO: 1.0,
    GROUND: 0.6
};

// FSI weights (tunable)
const w1 = 0.5;  // lessons remaining
const w2 = 0.3;  // flights per week
const w3 = 0.2;  // lesson type priority

async function calculateFSI(studentId, instructorId, lessonType) {
    try {
        // 1️⃣ Get student's training stage
        const studentRes = await pool.query(
            'SELECT training_stage FROM users WHERE id = $1',
            [studentId]
        );
        if (!studentRes.rows[0]) return 0;
        const trainingStage = studentRes.rows[0].training_stage;

        // 2️⃣ Calculate total flight hours completed
        const flightsRes = await pool.query(
            `SELECT COALESCE(SUM(actual_duration_minutes),0) as minutes
             FROM completed_sessions
             WHERE student_id = $1`,
            [studentId]
        );
        const totalMinutes = flightsRes.rows[0].minutes;
        const totalHoursCompleted = totalMinutes / 60;

        // 3️⃣ Lessons remaining (hours)
        const totalExpectedHours = TOTAL_HOURS[trainingStage];
        const lessonsRemaining = Math.max(totalExpectedHours - totalHoursCompleted, 0);
        const lessonsRemainingNorm = lessonsRemaining / totalExpectedHours; // normalize 0-1

        // 4️⃣ Flights per week
        const weekRes = await pool.query(
            `SELECT COUNT(*) as flights_this_week
             FROM completed_sessions
             WHERE student_id = $1
             AND scheduled_start >= date_trunc('week', now())`,
            [studentId]
        );
        const flightsThisWeek = weekRes.rows[0].flights_this_week;
        const flightsThisWeekNorm = 1 / (1 + flightsThisWeek); // fewer flights = higher priority

        // 5️⃣ Lesson type weight
        const lessonWeight = LESSON_TYPE_WEIGHTS[lessonType] || 1.0;

        // 6️⃣ Compute FSI
        const fsiScore = w1 * lessonsRemainingNorm + w2 * flightsThisWeekNorm + w3 * lessonWeight;

        return fsiScore;

    } catch (err) {
        console.error('FSI calculation error:', err);
        return 0;
    }
}

module.exports = { calculateFSI };
