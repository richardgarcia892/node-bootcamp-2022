const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findById(id);

  if (!tour) return next(new AppError(`tour with id ${id} not found`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // Return only the updated object not the original one
  const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedTour) return next(new AppError(`tour with id ${id} not found`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedTour = await Tour.findByIdAndDelete(id);

  if (!deletedTour) return next(new AppError(`tour with id ${id} not found`, 404));

  res.status(204).json({
    status: 'success'
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: null,
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 }, // Calculate number of tours
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
    // { $match: { _id: { $ne: 'EASY' } } } // add another layer of filtering with Id being the selected grouping from above
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMontlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      // Use undiwnd operation that turn an array into individual objects
      $unwind: '$startDates'
    },
    {
      // Set the matching criteria (query condition to be fetched)
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      // Set the grouping options
      $group: {
        _id: { $month: '$startDates' }, //Group by month using startDates as reference value
        numToursStart: { $sum: 1 }, // each value add 1 to the sum to calculate the total number of elements
        tours: { $push: '$name' } // Create an array with the objects that belong to each group
      }
    },
    {
      $addFields: { month: '$_id' } // Create new field to the aggregation, month will have the value of _id from the aggregation
    },
    {
      $project: { _id: 0 } // Hide _id from the result
    },
    {
      $sort: { month: 1 } // Sort by month, ascending, -1 for descending sort
    },
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});
