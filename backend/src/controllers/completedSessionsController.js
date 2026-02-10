const pool = require('../config/db');

const getCompletedSessions = async (req, res) => {
    const result = await pool.query(`
    SELECT cs.*, 
            s.name AS student_name,
            i.name AS instructor_name,
            l.title AS lesson_title
    FROM completed_sessions cs
    JOIN users s 
        ON cs.student_id = s.id 
        AND s.role = 'student'
    JOIN users i 
        ON cs.instructor_id = i.id 
        AND i.role = 'instructor'
    JOIN lessons l 
        ON cs.lesson_id = l.id
    ORDER BY cs.scheduled_start;
  `);

    res.json(result.rows);
};

const createCompletedSessions = async (req, res) => {
    try {
        const { student_id, instructor_id, lesson_id, scheduled_start, scheduled_end } = req.body;

        if (!student_id || !instructor_id || !lesson_id || !scheduled_start || !scheduled_end) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
            `INSERT INTO completed_sessions (student_id, instructor_id, lesson_id, scheduled_start, scheduled_end)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *`,
            [student_id, instructor_id, lesson_id, scheduled_start, scheduled_end]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create flight session' });
    }
};


module.exports = { getCompletedSessions, createCompletedSessions };