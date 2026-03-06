const express = require('express');
const reviewController = require('./../Controllers/reviewController');
const authController = require('./../Controllers/authController')

const Router = express.Router({mergeParams:true});


Router.use(authController.protect);

Router
    .route('/')
    .get(reviewController.getAllReviews)
    .post( authController.restrictTo('user','admin'),
        reviewController.TourUserIds,
        reviewController.createReview);


Router.route('/:id').delete(authController.restrictTo('user','admin'),reviewController.deleteReview)
      .patch(authController.restrictTo('user','admin'),reviewController.updateReview)
      .get(reviewController.getOneReview);

module.exports = Router;
