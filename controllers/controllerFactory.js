const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getOne = (Model, populateProperties) =>
  catchAsync(async (req, res, next) => {
    const modelName = Model.modelName.toLowerCase();

    // Create Query Object
    const query = Model.findById(req.params.id);
    // Set population properties (if any)
    if (populateProperties) query.populate(populateProperties);

    const document = await query;
    if (!document) next(new AppError(`${modelName} with id ${req.params.id} not found`, 404));

    res.status(200).json({
      status: 'success',
      data: { [modelName]: document }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const modelName = Model.modelName.toLowerCase();
    // Body Objects stores the nested query params
    const filters = { ...req.body, ...req.query };
    const features = new APIFeatures(Model.find(), filters)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const documents = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        [modelName]: documents
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const modelName = Model.modelName.toLowerCase();

    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { [modelName]: document }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const modelName = Model.modelName.toLowerCase();

    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!document) return next(new AppError(`${modelName} with ID ${req.params.id} not found`, 404));
    res.status(200).json({
      status: 'success',
      data: { [modelName]: document }
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);
    req.status(204).json({
      status: 'success'
    });
  });
