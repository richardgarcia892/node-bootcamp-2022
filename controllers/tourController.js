const sharp = require('sharp');
const multer = require('multer');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const controllerFactory = require('./controllerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('The file you are trying to upload is not an image', 400), false);
  }
};
exports.uploadTourImages = multer({ storage: multerStorage, fileFilter: multerFileFilter }).fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // Image cover
  const fileDestination = 'public/img/tours';

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(parseInt(process.env.TOUR_COVER_WIDTH, 10), parseInt(process.env.TOUR_COVER_HEIGHT, 10))
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`${fileDestination}/${req.body.imageCover}`);

  // Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(parseInt(process.env.TOUR_COVER_WIDTH, 10), parseInt(process.env.TOUR_COVER_HEIGHT, 10))
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${fileDestination}/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = // Geospatial querys need the radius calculated in radians
    unit === 'mi'
      ? distance / 3963.2 // Radius of earth in radians
      : distance / 6378.1; // Radius of earth kilometers

  if (!lat || !lng) next(new AppError('please provide Latitude and logitude', 400));

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours }
  });
});

exports.getTourDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) next(new AppError('please provide Latitude and logitude', 400));

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    results: { data: distances }
  });
});

exports.getTour = controllerFactory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = controllerFactory.getAll(Tour);
exports.createTour = controllerFactory.createOne(Tour);
exports.updateTour = controllerFactory.updateOne(Tour);
exports.deleteTour = controllerFactory.deleteOne(Tour);
