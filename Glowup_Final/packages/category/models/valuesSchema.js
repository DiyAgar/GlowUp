const mongoose = require("mongoose");

const values = new mongoose.Schema(
  {
    name_en: {
      type: String,
      require: true,
    },
    name_ar: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: true,
    },
    attribute: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Attribute",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
  { collection: "Value" },
);
const Value = mongoose.model("Value", values);

module.exports = Value;
