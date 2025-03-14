const mongoose = require("mongoose");

const WalletFlowSchema = new mongoose.Schema(
  {
    moneyId: {
      type: String,
      unique: true,
      required: true,
    },
    walletId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      ref: "User", 
    },
    amount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["ADD_MONEY", "WITHDRAWAL", "ADMIN", "ORDER"], 
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "TERMINATED"], 
      default: "PENDING",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      alias: "created_at", 
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection : "WalletFlow",
  }
);

module.exports = mongoose.model("WalletFlow", WalletFlowSchema);
