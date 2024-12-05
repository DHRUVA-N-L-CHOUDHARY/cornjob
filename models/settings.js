const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    automaticVariable: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "Settings" }
);

module.exports = mongoose.model("Settings", settingsSchema);
