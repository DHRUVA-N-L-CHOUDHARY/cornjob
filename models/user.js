const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true, // Mandatory field
    },
    totalMoney: {
      type: Number,
      default: 0, // Prisma @default(0)
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paymentType: {
      type: String,
      enum: ["MANUAL", "PAYMENT_GATEWAY"], // Equivalent to `PaymentType` enum
      default: "MANUAL", // Prisma @default(MANUAL)
    },
  },
  { collection: "User" }
);

module.exports = mongoose.model("User", userSchema);
