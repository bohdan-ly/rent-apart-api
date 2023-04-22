const mongoose = require("mongoose");
const slugify = require("slugify");
const { isAlpha } = require("validator");
// const User = require('./userModel');

const realtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
      minLength: [10, "Realty name must be at least 10 characters"],
      maxLength: [40, "Realty name must be at most 40 characters"],
      // validate: [isAlpha, 'Name should contain alpha characters'],
    },
    slug: String,
    rooms: { type: Number, required: [true, "Rooms count is required"] },
    area: { type: Number, required: [true, "Area is required"] },
    price: { type: Number, required: [true, "Price is required"] },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["soldOut", "active", "rented", "ready", "archived"],
        message: "Status is either: soldOut, active, rented, ready, archived",
      },
    },
    imageCover: { type: String, required: [true, "Image is required"] },
    images: [String],
    description: { type: String, trim: true },
    notes: { type: String, trim: true },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this. works only when we create NEW instance, so CREATE or SAVE
          return val < this.price;
        },
        message: "Discount ({VALUE}) must be lower than price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Summary is required"],
    },
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    address: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    ratingsAverage: {
      type: Number,
      default: 2.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => parseFloat(val.toFixed(1)),
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

realtySchema.index({ price: 1, ratingsAverage: -1 });
realtySchema.index({ slug: 1 });
realtySchema.index({
  startLocation: "2dsphere",
});

// virtual params

// realtySchema.virtual("reviews", {
//   ref: "Review",
//   foreignField: "tour",
//   localField: "_id",
// });

realtySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE

realtySchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    select: "-__v -passwordChangedAt",
  });
  next();
});

const Realty = mongoose.model("Realty", realtySchema);

module.exports = Realty;
