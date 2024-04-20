const Contact = require("../models/contactModel");
const catchAsync = require("../utils/catchAsync");

exports.getContactRequests = catchAsync(async (req, res, next) => {
    const contacts = await Contact.find();

    res.status(200).json({
        status: "success",
        contacts
    })
})

exports.postContactRequest = catchAsync(async (req, res, next) => {
    const { name, email, message } = req.body;
    console.log(req.body);

    const contact = await Contact.create({
        name, email, message
    });

    if (!contact) {
        return next(new AppError("Couldn't send request", 400))
    }

    res.status(200).json({
        status: "success",
        contact
    });
})