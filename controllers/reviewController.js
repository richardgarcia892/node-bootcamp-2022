const Review = require('../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const queryParams = { tour: tourId, ...req.query };
  const feature = new APIFeatures(Review.find(), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await feature.query;
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
  const tour = req.params.tourId;
  const user = req.user.id;
  const data = req.body;
  const tourData = { tour, user, ...data };
  const review = await Review.create(tourData);
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
