const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      data: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      data: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    // Return only the updated object not the original one
    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      data: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    await Tour.findByIdAndDelete(id);
    res.status(204).json({
      status: 'success'
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      data: err
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      data: err
    });
  }
};

exports.getMontlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      data: err
    });
  }
};
