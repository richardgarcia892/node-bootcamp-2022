const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('./../utils/catchAsync');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/BookingsModel');
const controllerFactory = require('./controllerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // create checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  await Booking.create({ tour, user, price });
};

exports.createBookingCheckoutHandler = catchAsync(async (req, res, next) => {
  console.log('handler');
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('error with event');
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  console.log({ event });
  if (event.type === 'checkout.session.completed') createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
});

exports.getBooking = controllerFactory.getOne(Booking);
exports.getAllBookings = controllerFactory.getAll(Booking);
exports.createBooking = controllerFactory.createOne(Booking);
exports.deleteBooking = controllerFactory.deleteOne(Booking);
exports.updateBooking = controllerFactory.updateOne(Booking);
