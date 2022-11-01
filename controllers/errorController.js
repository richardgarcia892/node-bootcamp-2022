const AppError = require('../utils/appError');

exports.globalErrorHandler = (err, req, res, next) => {
  console.log('globalErrorHandler: an error ocurred');
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

exports.endpointNotFound = (req, res, next) => {
  console.log('appErrorHandler: an error ocurred');
  const error = new AppError(`Can't find ${req.originalUrl}`, 404);
  // Whenever an argument is passed to next, express will handle this as an error
  next(error);
};
