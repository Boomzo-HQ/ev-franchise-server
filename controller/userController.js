const UserModel = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getUserProfile = catchAsync(async (req, res, next) => {
    const userID = req.user._id;

    if (!userID) {
        return next(new AppError("There isn't any account with this ID.", 400));
    }

    const user = await UserModel.findById(userID);

    if (!user) {
        return next(new AppError("No user found with that ID", 404));
    }

    res.status(200).json({
        status: 'success',
        user
    });
})