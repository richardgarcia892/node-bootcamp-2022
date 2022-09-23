const mongoose = require('mongoose');
const slugify = require('slugify');

// Create mongoose Schema to define the document structure
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour Name is required'],
      unique: true,
      minLength: [10, 'Name is too short'],
      maxLength: [50, 'name is too long']
    },
    slug: { type: String },
    duration: {
      type: Number,
      required: [true, 'Tour duration is required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour group size is required']
    },
    difficulty: {
      type: String,
      required: [true, 'Tour Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be easy, medium or difficult'
      }
    },
    ratingsAverage: { type: Number, default: 0 },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'Tour price is required']
    },
    priceDiscount: {
      type: Number,
      validate: function(value) {
        // CUstom validator should always return a Boolean true / false
        // Only applies for new documents, not for update operations
        return value < this.price; // check if the value is greater than the discount, otherwhise the discount is not valid
      },
      message: 'Discount price should be lower than original price'
    },
    summary: { type: String, trim: true },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'imageCover is required']
    },
    images: [{ type: String }],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // Sets this field to not be returned on querys
    },
    startDates: [{ type: Date }],
    secretTour: { type: Boolean, default: false }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return Math.floor(this.duration / 7);
});

//DOCUMENT MIDDLEWARE: Runs Before .save() and .create()
tourSchema.pre('save', function(next) {
  // traditional function needs to be used as arrow doesnt have access to this keyword
  this.slug = slugify.default(this.name, { lower: true });
  next(); // Mongoosee middleware works just like express middleware, so next keyword stands to jump to next middleware function
});

// Mongoose middleware are also called hooks, multiple middlewares can be defined for the same hook
// tourSchema.pre('save', function(next) {
//   console.log(this);
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(this);
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(doc, next) {
  console.log(`Query duration (ms): ${Date.now() - this.start}`);
  next();
});

// AGGREGATION Middleware has access to agreggate object
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// Create the final model object (used to perform CRUD operations)
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
