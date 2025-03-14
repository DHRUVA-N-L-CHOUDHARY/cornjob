const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _id: String,
    userId: String,
    productName: String,
    description: String,
    price: Number,
    minProduct: Number,
    maxProduct: Number,
    stock: Number,
    sheetLink: String,
    sheetName: String,
    created_at: Date,
    updatedAt: Date,
  },
  { collection: "Product" }
);

module.exports = mongoose.model("Product", productSchema);
