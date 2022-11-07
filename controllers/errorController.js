const AppError = require('../utils/appError');

/**
 * @name handleCastErrorDB
 * @description Turn MongoDB castError to internal AppError, so the error can return to the user with the standard response.
 */
const handleCastErrorDB = err => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * @name handleDuplicateErrorDB
 * @description Handle duplicate values errors, coming from DB.
 */
const handleDuplicateErrorDB = err => {
  const message = `duplicated value ${JSON.stringify(err.keyValue)}`;
  return new AppError(message, 400);
};

/**
 * @name handleValidationErrorDB
 * @description Turn MongoDB validation error into AppError object
 * @param {*} err
 * @returns
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(element => element.message);
  const message = `validationError: ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const devErrorMsg = (err, res) => {
  console.error('error', err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};
const prdErrorMsg = (err, res) => {
  if (err.isOperational) {
    // Operational errors are trusted and created / handled by ourselves

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming Error: a bug or unknow error source, Error details should not be returned to user, generic error message instead

    console.error('ERROR', err);
    res.status(err.statusCode).json({
      status: 500,
      message: 'Something went wrong'
    });
  }
};
exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') devErrorMsg(err, res);
  if (process.env.NODE_ENV === 'production') {
    /**
     * In production eviroment, errors mongoDB errors should be converted from MongoDB error
     * To AppError objects to successfully log then to user with a human readable format.
     */
    let error = { ...err }; // error hard copy (avoid overwriting)
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    prdErrorMsg(error, res);
  }
};

exports.endpointNotFound = (req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl}`, 404);
  // Whenever an argument is passed to next, express will handle this as an error
  next(error);
};
