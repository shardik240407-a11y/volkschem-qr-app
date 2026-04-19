const Batch = require("../models/Batch");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const slugify = require("slugify");

// ── Helper: extract Cloudinary public_id from a URL ───────────────────────────
const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    // Remove version prefix (e.g. v1234567890/)
    const withoutVersion = parts[1].replace(/^v\d+\//, "");
    // Remove file extension
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

// ── Helper: determine Cloudinary resource_type from URL ───────────────────────
const getResourceType = (url) => {
  if (!url) return "image";
  return url.includes("/raw/") ? "raw" : "image";
};

// ── Helper: delete a single Cloudinary asset ─────────────────────────────────
const deleteCloudinaryAsset = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: getResourceType(url),
    });
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset (${publicId}):`, err.message);
  }
};

// ── Controllers ───────────────────────────────────────────────────────────────

const createProduct = async (req, res) => {
  const {
    name,
    technical_name,
    description,
    company_info,
    cib_reg_no,
    license_no,
    manufactured_by,
    marketed_by,
    website_link,
    net_content,
  } = req.body;

  if (!name || !technical_name || !description) {
    res.status(400);
    throw new Error("name, technical_name and description are required.");
  }

  if (!req.files?.product_image?.[0]) {
    res.status(400);
    throw new Error("Product image is required.");
  }

  const slug = slugify(name, { lower: true, strict: true, trim: true });
  const existing = await Product.findOne({ slug });

  if (existing) {
    res.status(409);
    throw new Error("A product with this name already exists.");
  }

  const product = await Product.create({
    name,
    technical_name,
    description,
    company_info,
    cib_reg_no,
    license_no,
    manufactured_by,
    marketed_by,
    website_link,
    net_content,
    product_image: req.files.product_image[0].path,
    label_url: req.files?.label_file?.[0]?.path || "",
    leaflet_url: req.files?.leaflet_file?.[0]?.path || "",
  });

  res.status(201).json(product);
};

const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const search = req.query.search || "";

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { technical_name: { $regex: search, $options: "i" } },
    ];
  }

  const totalCount = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    products,
    totalPages,
    currentPage: page,
    totalCount,
  });
};

const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const batches = await Batch.find({ product_id: product._id }).sort({ createdAt: -1 });

  res.json({
    ...product.toObject(),
    batches,
  });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  res.json(product);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  // If a new product image is uploaded, delete the old one from Cloudinary
  if (req.files?.product_image?.[0]) {
    await deleteCloudinaryAsset(product.product_image);
  }
  if (req.files?.label_file?.[0] && product.label_url) {
    await deleteCloudinaryAsset(product.label_url);
  }
  if (req.files?.leaflet_file?.[0] && product.leaflet_url) {
    await deleteCloudinaryAsset(product.leaflet_url);
  }

  const payload = {
    name: req.body.name || product.name,
    technical_name: req.body.technical_name || product.technical_name,
    description: req.body.description || product.description,
    company_info: req.body.company_info || product.company_info,
    cib_reg_no: req.body.cib_reg_no ?? product.cib_reg_no,
    license_no: req.body.license_no ?? product.license_no,
    manufactured_by: req.body.manufactured_by ?? product.manufactured_by,
    marketed_by: req.body.marketed_by ?? product.marketed_by,
    website_link: req.body.website_link ?? product.website_link,
    net_content: req.body.net_content ?? product.net_content,
    product_image: req.files?.product_image?.[0]?.path || product.product_image,
    label_url: req.files?.label_file?.[0]?.path || product.label_url,
    leaflet_url: req.files?.leaflet_file?.[0]?.path || product.leaflet_url,
  };

  const updated = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  res.json(updated);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  // Delete Cloudinary assets before removing DB record
  await Promise.all([
    deleteCloudinaryAsset(product.product_image),
    deleteCloudinaryAsset(product.label_url),
    deleteCloudinaryAsset(product.leaflet_url),
  ]);

  await Batch.deleteMany({ product_id: id });
  await Product.findByIdAndDelete(id);

  res.json({ message: "Product and related batches deleted." });
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
};
