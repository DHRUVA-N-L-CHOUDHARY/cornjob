const mongoose = require("mongoose");

const walletFlowSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      alias: "_id", 
    },
    moneyId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"], 
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
  { collection: "WalletFlow" }
);

module.exports = mongoose.model("WalletFlow", walletFlowSchema);
