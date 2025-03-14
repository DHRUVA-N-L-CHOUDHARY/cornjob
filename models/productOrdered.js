const mongoose = require("mongoose");

const productOrderedSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: { type: String, required: true },
  },
  {
    collection: "productOrdered",
  }
);

module.exports = mongoose.model("productOrdered", productOrderedSchema);
