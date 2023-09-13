const Tour = require('../models/tourModel');
const Booking = require('../models/BookingsModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'warandinga tours | All tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  if (!tour) return next(new AppError('Tour name not found', 404));
  res.status(200).render('tour', {
    title: `warandinga tours | ${tour.name}`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login'
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Profile'
  });
};

exports.updateProfile = catchAsync(async (req, res) => {
  const user = User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).redner('account', {
    title: 'profile',
    user: user
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIDs = bookings.map(el => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
