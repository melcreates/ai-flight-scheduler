const express = require('express');
const router = express.Router();
const {
    getLessons,
    getLessonById,
    createLesson
} = require('../controllers/lessonsController');

router.get('/', getLessons);
router.get('/:id', getLessonById);
router.post('/', createLesson);

module.exports = router;
