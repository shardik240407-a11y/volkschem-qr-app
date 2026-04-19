const express = require("express");
const { createBatch, getBatchesByProductId, updateBatch, deleteBatch } = require("../controllers/batchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createBatch);
router.route("/:productId").get(protect, getBatchesByProductId);

router
  .route("/:id")
  .put(protect, updateBatch)
  .delete(protect, deleteBatch);

module.exports = router;
