const express = require("express");
const authController = require('../controller/authController');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/signup', authController.userSignup);
router.post('/login', authController.login);
router.patch('/reset-password', authController.protect, authController.resetPassword);

router.get('/', authController.protect, userController.getUserProfile);

module.exports = router;