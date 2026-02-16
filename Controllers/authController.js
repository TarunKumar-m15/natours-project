const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id)
     res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser,201,res);
});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //check both are exist pr not
    if (!email || !password) {
        return next(new AppError('please provide email and passsword', 400));
    }

    //check if user exist and password correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect password or email', 401))
    }

    //if all ok send success response with token
    createSendToken(user,200,res);
});

exports.protect = catchAsync(async (req, res, next) => {
    //getting token and check if its there
    let token;
    //console.log("Authorization Header:", req.headers.authorization);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('you are not logged in ,please login', 401))
    }

    //verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belong to this token does no longer exist', 401));
    }
    //check if user changed the passoed after token issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        new AppError('User recently changed password,please login again', 401);
    }


    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // get user based on posted email 
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404))
    }
    //generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    //send token to through email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to:${resetURL}.\nif you didn't forget your password,please ignore this mail!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset Token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: "success",
            message: "Token sent to Email!"
        });
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again Later!', 500))
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1)get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    //2)if token has not expired,and there is user then update the password
    if (!user) {
        return next(new AppError('Token is Invalid or has Expired'));
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    //3)update changed password for the user

    //4)Log the user in, send JWT
    createSendToken(user,200,res);
});

exports.updatePassword =catchAsync(async (req,res,next)=>{
    //1)get user from collection
      const user = await User.findById(req.user.id).select('+password');

    //2)check if POSTed current password is correct
    if(!(user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('Your current password is wrong',401))
    }
     
    //3)if so,then update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save()
    //4)Log user in,send JWT
    createSendToken(user,200,res);
});