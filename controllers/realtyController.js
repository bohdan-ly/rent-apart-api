const multer = require("multer");
const sharp = require("sharp");
const Realty = require("../models/realtyModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid file type.", 400), false);
  }
};

const upload = multer({ storage: multerStorage });

exports.uploadRealtyImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// upload.single('imageCover') => req.file
// upload.array('images', 5) => req.files

exports.resizeRealtyImages = catchAsync(async (req, res, next) => {
  if (req.files?.imageCover) {
    // 1) Cover image
    req.body.imageCover = `realty-${req.params.id}-${Date.now()}-cover.jpg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/realty/${req.body.imageCover}`);
  }
  // Images

  if (req.files?.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, idx) => {
        const fileName = `realty-${req.params.id}-${Date.now()}-${idx + 1}.jpg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/img/realty/${fileName}`);

        req.body.images.push(fileName);
      })
    );
  }

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = "price,-ratingsAverage";
  req.query.limit = 5;
  req.query.fields = "name,price,ratingsAverage,summary";
  next();
};

exports.getAllRealties = factory.getAll(Realty);
exports.getRealty = factory.getOne(Realty, { path: "reviews" });
exports.createRealty = factory.createOne(Realty);
exports.updateRealty = factory.updateOne(Realty);
exports.deleteRealty = factory.deleteOne(Realty);

exports.getWithinTours = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  if (!distance || !latlng) return next(new AppError("Invalid params.", 400));

  const [lat, lng] = latlng.split(",");

  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(200)
    .json({ status: "success", results: tours.length, data: { data: tours } });
});

exports.distance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  if (!latlng) return next(new AppError("Invalid params.", 400));

  const [lat, lng] = latlng.split(",");

  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );

  const distanceMultiplier = unit === "mi" ? 0.000621371 : 0.001;

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [+lng, +lat],
        },
        distanceField: "distance",
        distanceMultiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({ status: "success", data: { data: distance } });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const groups = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        _id: { $toUpper: "$difficulty" },
        toursCount: { $sum: 1 },
        ratingsCount: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
  ]);

  res.status(200).json({ status: "success", data: { groups } });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     data: err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = +req.params.year; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        toursStartsCount: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    { $limit: 12 },
  ]);

  res.status(200).json({ status: "success", data: { plan } });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     data: err,
  //   });
  // }
});
