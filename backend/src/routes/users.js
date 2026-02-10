const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser } = require('../controllers/usersController');

// Routes
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

module.exports = router;