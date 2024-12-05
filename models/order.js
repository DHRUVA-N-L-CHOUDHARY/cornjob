const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: String,
    name: String,
    userId: String,
    products: [
      {
        name: String,
        quantity: Number,
        productPrice: Number,
      },
    ],
    amount: Number,
    status: String,
    created_at: Date,
    updatedAt: Date,
    reason: String,
    files: [
      {
        public_id: String,
        secure_url: String,
        fileName: String,
        fileType: String,
      },
    ],
  },
  { collection: "Order" }
);

module.exports = mongoose.model("Order", orderSchema);
