const StaffModel = require("../models/staffModel");
const UserModel = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getBookingsAccToStatus = catchAsync(async (req, res, next) => {
    const { status } = req.query;

    // Validate status
    if (!status) {
        return next(new AppError("Status parameter is required", 400))
    }

    // Check if the provided status is valid
    const validStatuses = ["UNDER_PROCESSING", "PROCESS_STARTED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
        return next(new AppError("Invalid status provided", 400))
    }

    // Find all users with the specified status
    const bookings = await UserModel.find({ status: status }).sort("-createdAt");
    
    res.status(200).json({
        status: 'success',
        results: bookings.length,
        bookings
    });
});

exports.getAllStaff = catchAsync(async (req, res, next) => {
    const members = await StaffModel.find();

    res.status(200).json({
        status: "success",
        members
    })
});

exports.updateBooking = catchAsync(async (req, res, next) => {
    const { status, locationImage } = req.body;
    const bookingID = req.params.bookingid;

    if (!status && !locationImage) {
        return next(new AppError("Provide sufficient information!", 400))
    }

    if (!bookingID) {
        return next(new AppError("Provide Booking ID!", 400))
    }

    const booking = await UserModel.findByIdAndUpdate(bookingID, {
        status, locationImage
    }, {
        new: true,
        runValidators: true,
    })

    if (!booking) {
        return next(new AppError("Couldn't update booking!", 400))
    }

    res.status(201).json({
        status: "success",
        booking
    })
});

exports.getOneBooking = catchAsync(async (req, res, next) => {
    const bookingID = req.params.bookingid;

    // console.log(bookingID);
    if (!bookingID) {
        return next(new AppError("Provide Booking ID!", 400))
    }

    const booking = await UserModel.findById(bookingID);

    if (!booking) {
        return next(new AppError("Couldn't update booking!", 400))
    }

    res.status(201).json({
        status: "success",
        booking
    })
})