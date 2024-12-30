const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { blockPath } = require('../middleware/auth');
router.get('/login', blockPath, authController.showLoginForm);
router.post('/login', authController.login);
router.get('/register', blockPath,  authController.showRegisterForm);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

module.exports = router; 