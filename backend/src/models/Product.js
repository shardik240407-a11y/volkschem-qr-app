const mongoose = require("mongoose");
const slugify = require("slugify");

const DEFAULT_COMPANY_INFO = `Volkschem Crop Science PVT LTD\nSymbol of Quality\nAddress: India (update official address in admin panel if needed)\nSupport: support@volkschem.com`;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    product_image: {
      type: String,
      required: true,
      trim: true,
    },
    technical_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    company_info: {
      type: String,
      default: DEFAULT_COMPANY_INFO,
      trim: true,
    },
    label_url: {
      type: String,
      trim: true,
      default: "",
    },
    leaflet_url: {
      type: String,
      trim: true,
      default: "",
    },
    cib_reg_no: { type: String, default: "", trim: true },
    license_no: { type: String, default: "", trim: true },
    manufactured_by: { type: String, default: "", trim: true },
    marketed_by: { type: String, default: "", trim: true },
    website_link: { type: String, default: "www.volkschem.com", trim: true },
    net_content: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

productSchema.pre("validate", function buildSlug() {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
});

module.exports = mongoose.model("Product", productSchema);
