const express = require("express");
const { verifyBatchBySlugAndBatchNo } = require("../controllers/batchController");

const router = express.Router();

router.get("/:slug/:batchNo", verifyBatchBySlugAndBatchNo);

module.exports = router;
