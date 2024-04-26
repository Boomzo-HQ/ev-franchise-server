const Contact = require("../models/contactModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getContactRequests = catchAsync(async (req, res, next) => {
    const contacts = await Contact.find().sort("-createdAt");

    res.status(200).json({
        status: "success",
        contacts
    })
})

exports.postContactRequest = catchAsync(async (req, res, next) => {
    const { name, email, message, phone } = req.body;
    // console.log(req.body);

    if (!name && !email && !phone && !message) {
        return next(new AppError("Provide sufficient Information"));
    }

    const contact = await Contact.create({
        name, email, phone, message
    });

    if (!contact) {
        return next(new AppError("Couldn't send request", 400))
    }

    res.status(200).json({
        status: "success",
        contact
    });
})