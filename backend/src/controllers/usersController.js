const pool = require('../config/db');

// GET all users
const getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// GET single user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// POST create new user
const createUser = async (req, res) => {
    try {
        const { name, role, training_stage } = req.body;

        // Validation
        if (!name || !role) {
            return res.status(400).json({ error: 'name, and role are required' });
        }

        if (role === 'student') {
            if (!training_stage || !['ppl', 'cpl'].includes(training_stage.toLowerCase())) {
                return res.status(400).json({ error: "Student must have training_stage: 'ppl' or 'cpl'" });
            }
        }

        // Insert into DB
        const result = await pool.query(
            'INSERT INTO users (name, role, training_stage) VALUES ($1, $2, $3) RETURNING *',
            [name, role, training_stage || null] // instructors can have null
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};


module.exports = { getUsers, getUserById, createUser };
