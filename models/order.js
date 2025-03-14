const mongoose = require("mongoose");
const productOrderedSchema = require("./productOrdered");

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    orderId: { type: String, unique: true, required: true },
    walletId: { type: String, required: true },
    name: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    domainId: { type: String, required: true },
    files: [
      {
        public_id: String,
        secure_url: String,
        fileName: String,
        fileType: String,
      },
    ],
    amount: { type: Number, required: true },
    purpose: {
      type: String,
      enum: ["ADD_MONEY", "ORDER", "WITHDRAWAL", "ADMIN"],
      default: "ORDER",
    },
    failureReason: { type: String, default: null },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "Order",
    timestamps: { createdAt: "created_at", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Order", orderSchema);
