const pool = require('../config/db');
const { io } = require('../server'); // adjust path if needed

// Get all pending flight requests
const getFlightRequests = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT fr.*, 
                   u.name AS student_name, 
                   i.name AS instructor_name,
                   l.title AS lesson_title
            FROM flight_requests fr
            JOIN users u ON fr.student_id = u.id
            JOIN users i ON fr.instructor_id = i.id
            JOIN lessons l ON fr.lesson_id = l.id
            ORDER BY fr.created_at
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch flight requests' });
    }
};



//  Get pending Requests for an instructor
const getInstructorRequests = async (req, res) => {
    try {
        const { instructorId } = req.params;

        const result = await pool.query(
            `
            SELECT
                fr.id AS request_id,
                fr.student_id,
                fr.status,
                fr.created_at,
                fr.fsi_score,

                ia.id AS availability_id,
                ia.available_start,
                ia.available_end,

                u.name AS student_name,
                l.lesson_type
            FROM flight_requests fr
            JOIN instructor_availability ia
                ON fr.availability_id = ia.id
            JOIN users u
                ON u.id = fr.student_id
            JOIN lessons l
                ON l.id = fr.lesson_id
            WHERE ia.instructor_id = $1
              AND fr.status = 'pending'
            ORDER BY ia.available_start ASC, fr.created_at ASC
            `,
            [instructorId]
        );

        res.json({ requests: result.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch instructor requests' });
    }
};

// Create flight request
const createFlightRequest = async (req, res) => {
    try {
        const { student_id, instructorId, availability_id, lesson_id } = req.body;

        if (!student_id || !instructorId || !availability_id || !lesson_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
            `
            INSERT INTO flight_requests (
                student_id,
                instructor_id,
                availability_id,
                lesson_id,
                requested_start,
                requested_end,
                status
            )
            SELECT
                $1,
                $2,
                ia.id,
                $4,
                ia.available_start,
                ia.available_end,
                'pending'
            FROM instructor_availability ia
            WHERE ia.id = $3
            RETURNING *
            `,
            [student_id, instructorId, availability_id, lesson_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create flight request' });
    }
};



const { rankRequestsForAvailability } = require('../../services/fsiService');

// GET /availability/:id/ranked-requests
const getRankedRequests = async (req, res) => {
    const { availability_id } = req.params;

    const ranked = await rankRequestsForAvailability(availability_id);

    res.json({
        system_recommendation: ranked[0] || null,
        ranked_requests: ranked
    });
};

//Approve Flight

const approveFlightRequest = async (req, res) => {
    const { flight_request_id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get the availability ID
        const frRes = await client.query(`
          SELECT availability_id, instructor_id
          FROM flight_requests
          WHERE id = $1
        `, [flight_request_id]);

        if (!frRes.rowCount) {
            throw new Error('Flight request not found');
        }

        const { availability_id, instructor_id } = frRes.rows[0];

        // Approve selected request
        await client.query(`
          UPDATE flight_requests
          SET status = 'approved'
          WHERE id = $1
        `, [flight_request_id]);

        // Reject all other requests for the same availability
        await client.query(`
          UPDATE flight_requests
          SET status = 'rejected'
          WHERE availability_id = $1
            AND id <> $2
        `, [availability_id, flight_request_id]);

        // Lock the availability
        await client.query(`
          UPDATE instructor_availability
          SET is_booked = true
          WHERE id = $1
        `, [availability_id]);

        await client.query('COMMIT');

        // ✅ Respond to frontend BEFORE emitting (so frontend gets 200)
        res.json({ success: true });

        // Emit the updated list to frontend (outside try/catch so it won’t affect response)
        try {
            io.to(`availability-${availability_id}`).emit('requests-updated', {
                availabilityId,
                requests: [] // no pending requests remain
            });
        } catch (emitErr) {
            console.error('Socket emit failed:', emitErr);
        }

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
};



module.exports = { getFlightRequests, getInstructorRequests, createFlightRequest, getRankedRequests, approveFlightRequest };
