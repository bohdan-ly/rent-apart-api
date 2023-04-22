const express = require("express");
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

router.route("/").get(getAllRealties).post(verify, createRealty);

router
  .route("/:id")
  .get(getRealty)
  .patch(verify, uploadRealtyImages, resizeRealtyImages, updateRealty)
  .delete(verify, deleteRealty);

module.exports = router;
