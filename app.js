const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

const { defaultSrcUrls, scriptSrcUrls, connectSrcUrls, fontSrcUrls, styleSrcUrls } = require('./config/helmet.urls');

const app = express();

// Enable trust proxy (for deployment on render)
// app.enable('trust proxy');

// Enable cors
app.use(cors());

// apply cors to prefligth methods
// app.options('/api/v1/', cors());
app.options('*', cors());

// Set the view engine to Pug and configure views directory
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Apply Content Security Policy using Helmet middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", ...defaultSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      connectSrc: ["'self'", ...connectSrcUrls],
      fontSrc: ["'self'", ...fontSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      workerSrc: ["'self'", 'blob:']
    }
  })
);

// Development logging using Morgan middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting for API requests from the same IP
const limiterTimer = 60 * 60 * 1000;
const limiterOptions = {
  max: 100,
  windowMs: limiterTimer,
  message: `Too many requests from this IP, please try again in ${limiterTimer / 1000} seconds`
};
const limiter = rateLimit(limiterOptions);
app.use('/api', limiter);

// Stripe webhooks need to use raw bodyparser
app.post(
  '/api/webhooks/stripe/checkout-session-completed',
  express.raw({ type: 'application/json' }),
  bookingController.createBookingCheckoutHandler
);

// Body parser middleware for reading data from the request body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// CookieParser middleware for handling cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against Cross-Site Scripting (XSS) attacks
app.use(xss());

// Prevent HTTP Parameter Pollution (HPP)
const hppWhitelist = ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'];
app.use(hpp({ whitelist: hppWhitelist }));

app.use(compression());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes for views
app.use('/', viewRouter);

// Set up API routes
app.use('/api/v1/ping', (req, res, next) => res.status(200).json({ status: 'running' }));
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handle requests to undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
