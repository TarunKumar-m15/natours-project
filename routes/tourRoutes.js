const express = require('express');
const tourController = require('./../Controllers/tourControllers');
const authController = require('./../Controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const Router = express.Router();


//Router.param('id',tourController.checkId);

Router.use('/:tourId/reviews',reviewRouter);

Router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours);

Router.route('/tour-stats').get(tourController.getTourStats);

Router.route('/monthly-plan/:year').get(authController.restrictTo('lead-guide','guide','admin'),tourController.getMonthlyPlan);

Router.use(authController.protect);

Router.route('/').get(tourController.getAllTours).post(tourController.postTours);

Router.route('/:id').patch(tourController.patchTours).delete(authController.restrictTo('admin','lead-guide'),tourController.deleteTours).get(tourController.getTour);

//Router.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReview);

module.exports = Router;

