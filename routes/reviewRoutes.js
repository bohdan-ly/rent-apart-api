const express = require("express");
const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setUserTourIds,
} = require("../controllers/reviewController");
const { verify, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(verify);

router.route("/").get(getAllReviews).post(verify, setUserTourIds, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(updateReview)
  .delete(verify, deleteReview);

module.exports = router;
