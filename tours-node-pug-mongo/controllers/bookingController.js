const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Tour = require('../models/tourModel');
const factory = require('./controllerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // create checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: []
          }
        },
        quantity: 1
      }
    ]
  });
  //create session response
  res.status(200).json({
    status: 'success',
    session
  });
});
