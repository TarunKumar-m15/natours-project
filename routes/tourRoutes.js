const express = require('express');
const fs = require('fs'); 

const Router = express.Router();

const tourController = require('./../Controllers/tourControllers');

//Router.param('id',tourController.checkId);

Router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getTours);

Router.route('/tour-stats').get(tourController.getTourStats);

Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

Router.route('/').get(tourController.getTours).post(tourController.postTours);

Router.route('/:id').patch(tourController.patchTours).delete(tourController.deleteTours);

module.exports = Router;

