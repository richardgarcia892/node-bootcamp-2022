const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const controllerFactory = require('./controllerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const fileDestination = 'public/img/users';
//     cb(null, fileDestination);
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     const filename = `user-${req.user.id}-${Date.now()}.${ext}`;
//     cb(null, filename);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('The file you are trying to upload is not an image', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFileFilter });

exports.uploadProfilePicture = upload.single('photo');

exports.resizeProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  const fileDestination = 'public/img/users';
  const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  req.file.filename = filename;

  const width = parseInt(process.env.PROFILE_PICTURE_WIDTH, 10);
  const height = parseInt(process.env.PROFILE_PICTURE_HEIGHT, 10);

  await sharp(req.file.buffer)
    .resize(width, height)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`${fileDestination}/${filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.setCurrentUserId = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});
exports.deactivateCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.getUser = controllerFactory.getOne(User);
exports.getAllUsers = controllerFactory.getAll(User);
exports.createUser = controllerFactory.createOne(User);
exports.updateUser = controllerFactory.updateOne(User);
exports.deleteUser = controllerFactory.deleteOne(User);
