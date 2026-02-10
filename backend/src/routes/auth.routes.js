const express = require('express');
const { register, login, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, me)
router.post('/register', register);
router.post('/login', login);


module.exports = router;