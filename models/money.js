const mongoose = require("mongoose");
const { Schema } = mongoose;

const MoneySchema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: String, default: null },
    walletId: { type: String, required: true },
    upiId: { type: String, required: true },
    payment_method_id: { type: String, required: true },
    accountNumber: { type: String, default: null },
    accountType: { type: String, default: null },
    paymentType: {
      type: String,
      enum: ["MANUAL", "PAYMENT_GATEWAY"],
      default: "PAYMENT_GATEWAY",
    },
    bankName: { type: String, default: null },
    ifscCode: { type: String, default: null },
    transactionId: { type: String, unique: true, required: true },
    public_id: { type: String, unique: true, default: null },
    secure_url: { type: String, default: null },
    purpose: {
      type: String,
      enum: ["ADD_MONEY", "WITHDRAWAL", "ADMIN", "ORDER"],
      required: true,
    },
    failureReason: { type: String, default: null },
    paymentProces: { type: Boolean, default: false },
    paymentMode: {
      type: String,
      enum: ["MANUAL", "PAYMENT_GATEWAY"],
      required: true,
    },
    counter: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    userId: {
      type: String,
      required: true,
    },
    domainId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    walletFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletFlow",
      default: null,
    },
    paymentMetaData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMetaData",
      default: null,
    },
  },
  { collection: "Money" }
);

module.exports = mongoose.model("Money", MoneySchema);
