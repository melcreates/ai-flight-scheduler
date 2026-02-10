const pool = require('../src/config/db');
const { calculateFSI } = require('../src/fsi');

async function rankRequestsForAvailability(availabilityId) {
    const res = await pool.query(`
        SELECT
            fr.id AS request_id,
            fr.student_id,
            u.name AS student_name,
            l.lesson_type
        FROM flight_requests fr
        JOIN users u ON u.id = fr.student_id
        JOIN lessons l ON l.id = fr.lesson_id
        WHERE fr.availability_id = $1
          AND fr.status = 'pending'
    `, [availabilityId]);

    const ranked = [];

    for (const r of res.rows) {
        const fsi = await calculateFSI(
            r.student_id,
            null,
            r.lesson_type
        );

        ranked.push({ ...r, fsi });
    }

    ranked.sort((a, b) => b.fsi - a.fsi);
    return ranked;
}

module.exports = { rankRequestsForAvailability };
