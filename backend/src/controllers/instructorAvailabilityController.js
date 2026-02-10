const pool = require('../config/db');

// Get instructor availability
const getAvailability = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ia.*, u.name AS instructor_name
            FROM instructor_availability ia
            JOIN users u ON ia.instructor_id = u.id
            ORDER BY ia.available_start
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
};

// Get all pending flight requests
const getInstructorAvailability = async (req, res) => {
    try {
        const { instructorId } = req.params;
        console.log('Instructor ID from request:', instructorId);
        console.log(req.user)
        const result = await pool.query(
            `SELECT * 
             FROM instructor_availability
             WHERE instructor_id = $1
             ORDER BY available_start ASC`,
            [instructorId]
        );
        console.log('Query result:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch availabilities' });
    }
};

// Create availability block
const createAvailability = async (req, res) => {
    try {
        const { instructor_id, available_start, available_end } = req.body;
        if (!instructor_id || !available_start || !available_end) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
            `INSERT INTO instructor_availability
            (instructor_id, available_start, available_end)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [instructor_id, available_start, available_end]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create availability' });
    }
};

module.exports = { getAvailability, createAvailability, getInstructorAvailability, };
