const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// /api/auth/register ve /api/auth/login endpointleri
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;