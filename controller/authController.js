const UserModel = require("../models/userModel");
const StaffModel = require("../models/staffModel");
const AppError = require("../utils/appError");
const generator = require('generate-password');
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        // 2 days
        expires: new Date(Date.now() + 2592000000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        user,
    });
};

// <--------------------- USER ---------------------->

// send email regarding booking req received
exports.userSignup = catchAsync(async (req, res, next) => {
    const { name, email, phone, city, state, franchiseName, investmentRange, onBoardingAs, message } = req.body;

    if (!name && !email && !phone && !city && !state && !franchiseName && !investmentRange && !onBoardingAs) {
        return next(
            new AppError("Please provide all information for creating an account!!")
        );
    }

    const generatedPassword = generator.generate({
        length: 12,
        numbers: true,
        symbols: true,
        lowercase: true,
        uppercase: true,
        strict: true
    });

    // console.log(generatedPassword);

    const newUser = await UserModel.create({
        name,
        email,
        phone,
        tempPassword: generatedPassword,
        password: generatedPassword,
        city,
        state,
        franchiseName,
        investmentRange,
        onBoardingAs,
        message
    });

    if (!newUser) {
        return next(new AppError("Couldnt create user!!"))
    }

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }
    const user = await UserModel.findOne({ email }).select("+password");

    console.log(user);

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) fetch token
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    console.log(token);

    if (!token) {
        return next(
            new AppError("You are not logged in! Please log in to get access.", 401)
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded.id);

    // 3) Check if user still exists
    const currentUser = await UserModel.findById(decoded.id);
    console.log(currentUser);
    if (!currentUser) {
        return next(
            new AppError(
                "The user belonging to this token does no longer exist.",
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError("User recently changed password! Please log in again.", 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
    const { tempPassword, password } = req.body;

    const user = await UserModel.findOne({
        tempPassword
    });

    if (!user) {
        return next(new AppError("There isnt any account with this password", 400));
    }

    user.password = password;
    // user.tempPassword = te;

    await user.save();

    createSendToken(user, 200, res);
});


// <--------------------- STAFF ---------------------->
// make condn for only admin to create staff
exports.staffSignup = catchAsync(async (req, res, next) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return next(
            new AppError("Please provide all information for creating an account!!", 400)
        );
    }

    // console.log(req.body);

    const newStaff = await StaffModel.create({
        name,
        email,
        phone,
        password
    });

    if (!newStaff) {
        return next(new AppError("Couldnt create staff!!"))
    }

    createSendToken(newStaff, 201, res);
});

exports.staffLogin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }
    const staff = await StaffModel.findOne({ email }).select("+password");

    if (!staff || !(await staff.correctPassword(password, staff.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    mg.messages.create('sandbox-123.mailgun.org', {
        from: "Excited User <mailgun@sandbox-123.mailgun.org>",
        to: [email],
        subject: "Hello",
        text: "Testing some Mailgun awesomeness!",
        html: "<h1>Testing some Mailgun awesomeness!</h1>"
    })
        .then(msg => console.log(msg)) // logs response data
        .catch(err => console.log(err));

    createSendToken(staff, 200, res);
});


exports.protectStaff = catchAsync(async (req, res, next) => {
    // 1) fetch token
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // console.log(token);
    if (!token) {
        return next(
            new AppError("You are not logged in! Please log in to get access.", 401)
        );
    }

    // console.log(process.env.JWT_SECRET);

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    // 3) Check if user still exists
    const currentUser = await StaffModel.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                "The user belonging to this token does no longer exist.",
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError("User recently changed password! Please log in again.", 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});


exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await StaffModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("There is no user with email address.", 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    console.log(process.env.NODE_ENV);

    // 3) Send it to user's email
    try {
        const resetURL = `https://portal.boomzo.in/reset-password/${resetToken}`

        console.log(resetURL);
        console.log(user);
        await new Email(user.name, user.email, user.phone, resetURL).sendPasswordReset();

        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError("There was an error sending the email. Try again later!"),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await StaffModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});