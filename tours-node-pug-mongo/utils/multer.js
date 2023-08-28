const multer = require('multer');

const AppError = require('./../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('The file you are trying to upload is not an image', 400), false);
  }
};

const multerOptions = { storage: multerStorage, fileFilter: multerFileFilter };

exports.multer = multer(multerOptions);
