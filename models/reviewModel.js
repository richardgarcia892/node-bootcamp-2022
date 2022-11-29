const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review info is required'],
      maxlength: [1000, 'maximum review length is 1000 characters']
    },
    rating: { type: Number, required: true },
    tour: { type: mongoose.Schema.ObjectId, ref: 'Tour', required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({ path: 'user', select: 'name' });
  this.populate({ path: 'tours', select: 'name photo' });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
