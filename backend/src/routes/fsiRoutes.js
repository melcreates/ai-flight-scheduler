const express = require('express');
const router = express.Router();
const { getFSIForAvailability } = require('../controllers/fsiController');

router.get('/:availabilityId', getFSIForAvailability);

module.exports = router;