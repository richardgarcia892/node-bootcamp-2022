const Review = require('../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});
exports.getAllTourReview = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const reviews = await Review.find({ tour: tourId });
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});
exports.getReview = catchAsync(async (req, res, next) => {
  const { tourId, reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId, tour: tourId });
  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});
exports.createReview = catchAsync(async (req, res, next) => {
  const data = req.body;
  const review = await Review.create(data);
  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});
exports.deleteReview = catchAsync(async (req, res, next) => {
  const { tourId, reviewId } = req.params;
  await Review.findOneAndDelete({ tour: tourId, _id: reviewId });
  req.status(204).json({
    status: 'success'
  });
});
exports.updateReview = catchAsync(async (req, res, next) => {
  const { tourId, reviewId } = req.params;
  const reviewModifications = req.body;
  const queryFilter = { tour: tourId, review: reviewId };
  const review = await Review.findOneAndUpdate(queryFilter, reviewModifications, { new: true });
  req.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});
