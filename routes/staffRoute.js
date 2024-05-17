const express = require("express");
const authController = require('../controller/authController');
const staffController = require('../controller/staffController');

const router = express.Router();

router.post('/signup', authController.staffSignup);
router.post('/login', authController.staffLogin);
router.post('/forgotPassword', authController.staffForgotPassword);
router.patch('/resetPassword/:token', authController.staffResetPassword);

router.use(authController.protectStaff);

router.get('/', staffController.getAllStaff);
router.get('/bookings', staffController.getBookingsAccToStatus);
router.get('/bookings/:bookingid', staffController.getOneBooking);
router.patch('/bookings/:bookingid', staffController.updateBooking);

module.exports = router;