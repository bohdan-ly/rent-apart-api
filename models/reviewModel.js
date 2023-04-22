// review, rating, createdAt, ref to realty, ref to user
const mongoose = require("mongoose");
const Realty = require("./realtyModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: "String",
      required: [true, "Review is can not be empty."],
    },
    rating: { type: Number, min: 0, max: 10 },
    createdAt: { type: Date, default: new Date(Date.now()) },
    realty: {
      type: mongoose.Schema.ObjectId,
      ref: "Realty",
      required: [true, "Review must belong to a realty."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ realty: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (realtyId) {
  const stats = await this.aggregate([
    { $match: { realty: realtyId } },
    {
      $group: {
        _id: "$realty",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length) {
    await realty.findByIdAndUpdate(realtyId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await realty.findByIdAndUpdate(realtyId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post(/^save/, function () {
  if (this.constructor) {
    this.constructor.calcAverageRatings(this.realty);
  }
});

// findByIdAndUpdate
// findByIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.tempReview = await this.clone().findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here query was already executed
  if (this.tempReview) {
    await this.tempReview.constructor.calcAverageRatings(
      this.tempReview.realty
    );
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
