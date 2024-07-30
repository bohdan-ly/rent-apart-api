const express = require("express");
const fs = require("fs");
const {
  getAllRealties,
  createRealty,
  getRealty,
  distance,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getWithinTours,
  updateRealty,
  deleteRealty,
  uploadRealtyImages,
  resizeRealtyImages,
  uploadCover,
  // checkID,
  // validateNewTour,
} = require("../controllers/realtyController");
const reviewRouter = require("./reviewRoutes");
const { verify, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use("/:realtyId/reviews", reviewRouter);
// router.param('id', checkID);
// router
//   .route('/:tourId/reviews')
//   .post(verify, restrictTo(['user']), createReview);

router.route("/top-5-cheap").get(aliasTopTours, getAllRealties);

router.route("/tour-stats").get(getTourStats);

router.route("/tour-within/:distance/:latlng/:unit").get(getWithinTours);
router.route("/distance/:latlng/:unit").get(distance);

router.route("/monthly-plan/:year").get(verify, getMonthlyPlan);

router.route("/").get(verify, getAllRealties).post(verify, createRealty);

router
  .route("/:id")
  .get(getRealty)
  .patch(verify, uploadRealtyImages, resizeRealtyImages, updateRealty)
  .delete(verify, deleteRealty);

router.post(
  "/upload-image",
  uploadRealtyImages,
  resizeRealtyImages,
  function (req, res) {
    console.log("upload-image", req.body.imageCover);
    res.status(200).json({
      status: "success",
      data: { imageCover: req.body.imageCover, images: req.body.images },
    });
  }
);

router.post("/wayforpay", function (req, res) {
  console.log("Wayforpay", req.body);

  res.status(200).json({
    status: "success",
  });
});

module.exports = router;
