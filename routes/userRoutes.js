const express = require('express');
const userController = require('./../Controllers/userControllers');
const authController = require('./../Controllers/authController');


const Router = express.Router();

Router.post('/signup',authController.signup);
Router.post('/login',authController.login);

Router.post('/forgotPassword',authController.forgotPassword);
Router.patch('/resetPassword/:token',authController.resetPassword);

Router.patch('/updateMyPassword',authController.protect,authController.updatePassword);

Router.patch('/updateMe',authController.protect,userController.updateMe);

Router.route('/').get(userController.getUsers).post(userController.postUsers);

Router.route('/:id').patch(userController.patchUsers).delete(userController.deleteUsers);


module.exports = Router;