const mongoose = require("mongoose");

const moneySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId(),
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      default: null,
    },
    upiid: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    public_id: {
      type: String,
      unique: true,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    paymentProces: {
      type: Boolean,
      default: false,
    },
    paymentMode: {
      type: String,
      enum: ["MANUAL", "PAYMENT_GATEWAY"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    userId: {
      type: String,
      required: true,
    },
    counter: {
      type: Number,
      required: false,
      default: 0,
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Money" }
);

module.exports = mongoose.model("Money", moneySchema);
