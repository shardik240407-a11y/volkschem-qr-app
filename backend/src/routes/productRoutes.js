const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const uploadFields = upload.fields([
  { name: "product_image", maxCount: 1 },
  { name: "label_file", maxCount: 1 },
  { name: "leaflet_file", maxCount: 1 },
]);

// GET   /api/products         — list all (admin only)
// POST  /api/products         — create (admin only)
router
  .route("/")
  .get(protect, getAllProducts)
  .post(protect, uploadFields, createProduct);

// GET   /api/products/slug/:slug  — public, by product slug
router.get("/slug/:slug", getProductBySlug);

// GET   /api/products/:id     — get by ID (admin only)
// PUT   /api/products/:id     — update (admin only)
// DELETE /api/products/:id    — delete (admin only)
router
  .route("/:id")
  .get(protect, getProductById)
  .put(protect, uploadFields, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
