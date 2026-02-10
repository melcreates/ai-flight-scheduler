const pool = require('../config/db');

// GET all lessons
const getLessons = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM lessons ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
};

// GET lesson by ID
const getLessonById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM lessons WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Lesson not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch lesson' });
    }
};

// CREATE LESSONS 
const ALLOWED_LESSON_TYPES = ['GROUND', 'DUAL', 'SOLO', 'CHECKRIDE'];

function isValidLessonType(type) {
    return ALLOWED_LESSON_TYPES.includes(type.toUpperCase());
}

const createLesson = async (req, res) => {
    try {
        const { title, lesson_type, duration_minutes, priority_weight, training_stage } = req.body;

        if (!title || !lesson_type || !duration_minutes) {
            return res.status(400).json({
                error: 'title, lesson_type and duration_minutes are required'
            });
        }

        // Use the case-insensitive helper
        if (!isValidLessonType(lesson_type)) {
            return res.status(400).json({
                error: `lesson_type must be one of: ${ALLOWED_LESSON_TYPES.join(', ')}`
            });
        }

        // Normalize the lesson_type to lowercase before storing
        const capitalizedLessonType = lesson_type.toUpperCase();

        const result = await pool.query(
            `INSERT INTO lessons (title, lesson_type, duration_minutes, priority_weight, training_stage)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [title, capitalizedLessonType, duration_minutes, priority_weight, training_stage || 'ppl']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create lesson' });
    }
};



module.exports = { getLessons, getLessonById, createLesson };
