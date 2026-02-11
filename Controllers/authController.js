const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


const signToken = id =>{
   return jwt.sign({ id  },process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});


exports.login= catchAsync(async(req,res,next)=>{
    const {email,password} = req.body;

    //check both are exist pr not
    if(!email || !password) {
       return next(new AppError('please provide email and passsword',400));
    }

    //check if user exist and password correct
    const user = await User.findOne({email}).select('+password');
     
    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect password or email',401))
    }

    //if all ok send success response with token
    const token = signToken(user._id);
    res.status(200).json({
        status:"success",
        token
    })
});

exports.protect = catchAsync(async(req,res,next)=>{
    //getting token and check if its there
    let token;
     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
     }
     if(!token){
        return next(new AppError('you are not logged in ,please login',401))
     }

    //verification token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    console.log(decoded);
    //check if user still exist
     const currentUser = await User.findById(decoded.id);
     if(!currentUser){
        return next(new AppError('The user belong to this token does no longer exist',401));
     }
    //check if user changed the passoed after token issued
     if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password,please login again',401));
     }


    req.user = currentUser; 
    next();
})