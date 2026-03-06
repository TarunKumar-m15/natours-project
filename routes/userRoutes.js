const express = require('express');
const userController = require('./../Controllers/userControllers');
const authController = require('./../Controllers/authController');


const Router = express.Router();


Router.post('/signup',authController.signup);
Router.post('/login',authController.login);
Router.post('/forgotPassword',authController.forgotPassword);
Router.patch('/resetPassword/:token',authController.resetPassword);

Router.use(authController.protect);

Router.get('/me',userController.getMe,userController.getOneUser);

Router.patch('/updateMyPassword',authController.updatePassword);

Router.patch('/updateMe',userController.updateMe);

Router.delete('/deleteMe',userController.deleteMe);



Router.route('/').get(authController.restrictTo('admin'),userController.getUsers).post(userController.postUsers);


Router.route('/:id').patch(authController.restrictTo('admin'),userController.patchUsers)
      .delete(authController.restrictTo('admin'),userController.deleteUsers)
      .get(userController.getOneUser);


module.exports = Router;