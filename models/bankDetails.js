const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      unique: true,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
    upiid: {
      type: String,
      required: true,
    },
    upinumber: {
      type: String,
      required: true,
    },
    accountDetails: {
      type: String,
      required: true,
    },
    ifsccode: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["SAVINGS", "CURRENT"], // Example of account types (adjust based on your application)
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"], // Define roles based on your system
      default: "ADMIN",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      alias: "created_at",
    },
  },
  { collection: "BankDetails" }
);

module.exports = mongoose.model("BankDetails", bankDetailsSchema);

