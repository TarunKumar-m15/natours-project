const express = require('express');
const tourController = require('./../Controllers/tourControllers');
const authController = require('./../Controllers/authController');

const Router = express.Router();


//Router.param('id',tourController.checkId);

Router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getTours);

Router.route('/tour-stats').get(tourController.getTourStats);

Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

Router.route('/').get(authController.protect,tourController.getTours).post(tourController.postTours);

Router.route('/:id').patch(tourController.patchTours).delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTours);

module.exports = Router;

