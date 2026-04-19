const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith("image/");

    return {
      folder: isImage ? "volkschem/product-images" : "volkschem/product-docs",
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname}`
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.-]/g, "")
        .toLowerCase(),
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;
