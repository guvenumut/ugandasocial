const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/:username', isAuthenticated, userController.getUserProfile);

module.exports = router; 