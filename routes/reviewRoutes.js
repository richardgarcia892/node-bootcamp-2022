const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

router
  .route('/:reviewId')
  .get(reviewController.getReview)
  .put(authController.protect, authController.restrictTo('user'), reviewController.updateReview)
  .patch(authController.protect, authController.restrictTo('user'), reviewController.updateReview)
  .delete(authController.protect, authController.restrictTo('user'), reviewController.deleteReview);

module.exports = router;
