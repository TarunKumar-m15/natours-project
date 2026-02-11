const express = require('express');
const userController = require('./../Controllers/userControllers');
const authController = require('./../Controllers/authController');


const Router = express.Router();

Router.post('/signup',authController.signup);
Router.post('/login',authController.login);

Router.route('/').get(userController.getUsers).post(userController.postUsers);

Router.route('/:id').patch(userController.patchUsers).delete(userController.deleteUsers);


module.exports = Router;