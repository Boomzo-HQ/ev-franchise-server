const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email address"],
    },
    phone: { type: String, required: true, unique: true },
    tempPassword: { type: String },
    password: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    franchiseName: {
        type: String,
        required: true,
    },
    investmentRange: {
        type: String,
        enum: ['1 Lakh – 15 Lakh', '15 Lakh – 30 Lakh', 'Above 30 Lakh'],
        required: true
    },
    onBoardingAs: {
        type: String,
        enum: ["Franchise Distributor", "Charging Station"],
        required: true,
    },
    locationImage: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["UNDER_PROCESSING", "PROCESS_STARTED", "COMPLETED"],
        default: "UNDER_PROCESSING"
    },
    message: { type: String },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
}, {
    timestamps: true
});

UserSchema.pre("save", async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified("password")) return next();

    // Hashing the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

UserSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

UserSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // NOT changed
    return false;
};

// create password reset token func
UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    console.log({ resetToken }, this.passwordResetToken);

    // date + 10 mins
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const UserModel = mongoose.model("UserModel", UserSchema);

module.exports = UserModel;
