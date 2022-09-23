const express = require('express');
const morgan = require('morgan');
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
  // res.status(404).json({
  //   status: 'failed',
  //   message: `cant find ${req.originalUrl} not found`
  // });
  const err = new Error(`cant find ${req.originalUrl} not found`);
  err.status = 'fail';
  err.statusCode = 404;

  // Whenever an argument is passed to next, express will handle this as an error
  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
