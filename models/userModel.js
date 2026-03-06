const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { type } = require('os');
const catchAsync = require('../utils/catchAsync');

//name,email,photo,password,passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name must require'],
        maxlength: [40, 'name must less than or equal to 40'],
        minlength: [10, 'name must greater than or equal to 10']
    },
    email: {
        type: String,
        required: [true, 'email must require'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'provide valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'a user must set password'],
        trim: true,
        minlength: [8, 'password must greater than or equal to 8'],
        select: false

    },
    passwordConfirm: {
        type: String,
        required: [true, 'verify your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'passwords are not same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    }

});


userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
})

userSchema.pre('save', async function () {
    // it runs only if password was created or modified
    if (!this.isModified('password')) return ;

    //hash the password with cost of 12
    this.password =await bcrypt.hash(this.password, 12);

    //delete the passwordConfirm
    this.passwordConfirm = undefined;

});

userSchema.pre('save', function () {
    if (!this.isModified('password') || this.isNew) return;

    this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre(/^find/, function () {
    this.find({ active: { $ne: false } });
})

userSchema.methods.correctPassword = async function (candidatePassword, userpassword) {
    return await bcrypt.compare(candidatePassword, userpassword);
}

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimeStamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.
        createHash('sha256').
        update(resetToken).
        digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

userSchema.methods.incrementLoginAttempts = async function () {
    //if lock expired reset attempts
    if (this.lockUntil && this.lockUntil < Date.now()) {
        this.loginAttempts = 1;
        this.lockUntil = undefined;
        return await this.save({ validateBeforeSave: false });
    }

    this.loginAttempts += 1;

    //lock after 5 failed attempts
    if (this.loginAttempts >= 5 ) {
        this.lockUntil = Date.now() + 10 * 60 * 1000;
    }

    return this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts =async function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return await this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);

module.exports = User;