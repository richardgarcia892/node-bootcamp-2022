const Review = require('../models/reviewModel');
const controllerFactory = require('./controllerFactory');

exports.setTourId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};

exports.setUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getReview = controllerFactory.getOne(Review);
exports.getAllReviews = controllerFactory.getAll(Review);
exports.createReview = controllerFactory.createOne(Review);
exports.deleteReview = controllerFactory.deleteOne(Review);
exports.updateReview = controllerFactory.updateOne(Review);
