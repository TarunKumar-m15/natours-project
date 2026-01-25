const express = require('express');


const Router = express.Router();

const userController = require('./../Controllers/userControllers');



Router.route('/').get(userController.getUsers).post(userController.postUsers);

Router.route('/:id').patch(userController.patchUsers).delete(userController.deleteUsers);


module.exports = Router;