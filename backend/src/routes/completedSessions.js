const express = require('express');
const router = express.Router();
const {
    getCompletedSessions,
    createCompletedSessions
} = require('../controllers/completedSessionsController');

router.get('/', getCompletedSessions);
router.post('/', createCompletedSessions);

module.exports = router;