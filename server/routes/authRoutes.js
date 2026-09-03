const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/signup
// @desc    Register a user
router.post('/signup', authController.signup);

// @route   POST /api/auth/login
// @desc    Login a user
router.post('/login', authController.login);

module.exports = router;
