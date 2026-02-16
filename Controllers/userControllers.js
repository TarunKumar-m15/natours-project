const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');


const filterObj = (obj, ...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.updateMe =catchAsync(async (req,res,next)=>{
    //1)show error if posted body contains password or passwordConfirm fields
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword',400))
    };
    //2)filter unwanted fields from user patch request,and only update name & email fields if contains
    const filteredBody = filterObj(req.body,'name','email');

    //2)Update user Document
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    })

    res.status('200').json({
        status:'success',
        data:{
            user:updatedUser
        }
    })
});

exports.getUsers = async (req, res) => {
    const tours = await User.find();

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        requestedat: req.requestTime,
        results: tours.length,
        data: {
            tours,
        },
    });
};

exports.postUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    })
};

exports.patchUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    })
};

exports.deleteUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    })
};