const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    batch_no: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    manufacturing_date: {
      type: Date,
      required: true,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

batchSchema.index({ product_id: 1, batch_no: 1 }, { unique: true });

module.exports = mongoose.model("Batch", batchSchema);
