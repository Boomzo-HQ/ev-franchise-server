const express = require("express");
const authController = require('../controller/authController');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/signup', authController.userSignup);
router.post('/login', authController.login);
router.patch('/forgotPassword', authController.userForgotPassword);
router.patch('/reset-password/:token', authController.userResetPassword);

router.get('/', authController.protect, userController.getUserProfile);

module.exports = router;