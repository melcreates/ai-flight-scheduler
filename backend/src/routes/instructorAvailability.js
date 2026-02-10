const express = require('express');
const router = express.Router();
const {
    getAvailability,
    getInstructorAvailability,
    createAvailability
} = require('../controllers/instructorAvailabilityController');
const { requireAuth } = require('../../middleware/auth');

router.get('/', getAvailability);
router.get(
    '/instructor/:instructorId',
    requireAuth,
    getInstructorAvailability
);
router.post('/', createAvailability);

module.exports = router;