const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    domainId: {
      type: String,
      required: true,
    },
    autmVar: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "Settings",
    timestamps: { createdAt: "created_at", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
