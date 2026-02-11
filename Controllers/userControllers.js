const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync')

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