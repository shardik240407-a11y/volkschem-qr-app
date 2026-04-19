const Batch = require("../models/Batch");
const Product = require("../models/Product");

const buildVerificationUrl = (slug, batchNo) => {
  const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  return `${frontendBase}/p/${slug}/${batchNo}`;
};

const createBatch = async (req, res) => {
  const { product_id, batch_no, manufacturing_date, expiry_date, price } = req.body;

  if (!product_id || !batch_no || !manufacturing_date || !expiry_date || !price) {
    res.status(400);
    throw new Error("product_id, batch_no, manufacturing_date, expiry_date and price are required.");
  }

  // Validate expiry is after manufacturing date
  if (new Date(expiry_date) <= new Date(manufacturing_date)) {
    res.status(400);
    throw new Error("Expiry date must be after manufacturing date.");
  }

  const product = await Product.findById(product_id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const normalizedBatchNo = batch_no.trim().toUpperCase();

  const existingBatch = await Batch.findOne({
    product_id,
    batch_no: normalizedBatchNo,
  });

  if (existingBatch) {
    res.status(409);
    throw new Error("Batch number already exists for this product.");
  }

  const batch = await Batch.create({
    product_id,
    batch_no: normalizedBatchNo,
    manufacturing_date,
    expiry_date,
    price,
  });

  res.status(201).json({
    ...batch.toObject(),
    verification_url: buildVerificationUrl(product.slug, batch.batch_no),
  });
};

const getBatchesByProductId = async (req, res) => {
  const batches = await Batch.find({ product_id: req.params.productId }).sort({ createdAt: -1 });
  res.json(batches);
};

const verifyBatchBySlugAndBatchNo = async (req, res) => {
  const { slug, batchNo } = req.params;

  const product = await Product.findOne({ slug });

  if (!product) {
    res.status(404);
    throw new Error("Invalid or Fake Product");
  }

  const batch = await Batch.findOne({
    product_id: product._id,
    batch_no: batchNo.trim().toUpperCase(),
  });

  if (!batch) {
    res.status(404);
    throw new Error("Invalid or Fake Product");
  }

  res.json({
    is_genuine: true,
    product,
    batch,
  });
};

const updateBatch = async (req, res) => {
  const { id } = req.params;
  const { batch_no, price, manufacturing_date, expiry_date } = req.body;

  const batch = await Batch.findById(id);

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found.");
  }

  // If changing batch_no, ensure no duplicates for this product
  if (batch_no && batch_no.trim().toUpperCase() !== batch.batch_no) {
    const existing = await Batch.findOne({
      product_id: batch.product_id,
      batch_no: batch_no.trim().toUpperCase(),
    });
    if (existing) {
      res.status(409);
      throw new Error("Batch number already exists for this product.");
    }
    batch.batch_no = batch_no.trim().toUpperCase();
  }

  if (price !== undefined) batch.price = price;
  if (manufacturing_date) batch.manufacturing_date = manufacturing_date;
  if (expiry_date) batch.expiry_date = expiry_date;

  // Validate dates if both are present in the instance
  if (new Date(batch.expiry_date) <= new Date(batch.manufacturing_date)) {
    res.status(400);
    throw new Error("Expiry date must be after manufacturing date.");
  }

  const updatedBatch = await batch.save();
  res.json(updatedBatch);
};

const deleteBatch = async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findById(id);

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found.");
  }

  await Batch.findByIdAndDelete(id);
  res.json({ message: "Batch deleted." });
};

module.exports = {
  createBatch,
  getBatchesByProductId,
  verifyBatchBySlugAndBatchNo,
  updateBatch,
  deleteBatch,
};
