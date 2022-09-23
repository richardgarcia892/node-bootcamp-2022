const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');
// Import Routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// CONFIGURE MANDATORY MIDDLEWARES
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json()); // Use Json Middleware
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// SET ROUTERS ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl}`, 404);
  // Whenever an argument is passed to next, express will handle this as an error
  next(error);
});

app.use(globalErrorHandler);

module.exports = app;
