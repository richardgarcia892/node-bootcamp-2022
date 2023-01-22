const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.setTourId, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourId,
    reviewController.setUserId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .put(authController.protect, authController.restrictTo('user'), reviewController.updateReview)
  .patch(authController.protect, authController.restrictTo('user'), reviewController.updateReview)
  .delete(authController.protect, authController.restrictTo('user'), reviewController.deleteReview);

module.exports = router;
