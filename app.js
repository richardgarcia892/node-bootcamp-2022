const express = require('express');
const morgan = require('morgan');

const errorController = require('./controllers/errorController');

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

app.all('*', errorController.endpointNotFound);
app.use(errorController.globalErrorHandler); // USE Global Error handler as the last middleware

module.exports = app;
