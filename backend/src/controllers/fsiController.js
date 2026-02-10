// src/controllers/fsiController.js
const pool = require('../config/db');
const { calculateFSI } = require('../fsi');

// Get ranked FSI for a specific availability block
async function getFSIForAvailability(req, res) {
    const { availabilityId } = req.params;

    if (!availabilityId) {
        return res.status(400).json({ error: 'availabilityId is required' });
    }

    try {
        // 1️⃣ Fetch pending requests for this block
        const requestsRes = await pool.query(
            `SELECT fr.id as request_id,
          fr.student_id,
          u.name as student_name,
          l.lesson_type
   FROM flight_requests fr
   JOIN users u ON fr.student_id = u.id
   JOIN lessons l ON fr.lesson_id = l.id
   WHERE fr.availability_id = $1
     AND fr.status = 'pending'`,
            [availabilityId]
        );

        const requests = requestsRes.rows;

        // 2️⃣ Compute FSI for each request
        const ranked = [];
        for (let r of requestsRes.rows) {
            const fsiScore = await calculateFSI(r.student_id, null, r.lesson_type);
            ranked.push({
                request_id: r.request_id,
                student_id: r.student_id,
                student_name: r.student_name,
                lesson_type: r.lesson_type,
                fsi: fsiScore
            });
        }

        // Sort descending
        ranked.sort((a, b) => b.fsi - a.fsi);
        res.json(ranked);

    } catch (err) {
        console.error('FSI Controller error:', err);
        res.status(500).json({ error: 'Failed to fetch FSI rankings' });
    }
}

module.exports = { getFSIForAvailability };
