const express = require('express');
const router = express.Router();
const {
    getFlightRequests,
    getInstructorRequests,
    createFlightRequest,
    approveFlightRequest,
    getRankedRequests
} = require('../controllers/flightRequestsController');
const {
    requireAuth,
    requireRole
} = require('../../middleware/auth')


router.get('/', getFlightRequests);
router.get('/instructor-requests/:instructor_id', getInstructorRequests);
router.get('/:availability_id/rank-requests', getRankedRequests);
router.post('/', createFlightRequest);
router.patch(
    '/:flight_request_id/approve',
    requireAuth,
    requireRole('instructor'),
    approveFlightRequest
);

module.exports = router;