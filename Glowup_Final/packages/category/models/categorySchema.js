const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name_en: {
      type: String,
      require: true,
    },
    name_ar: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: false,
      default: "",
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isTop: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
  { collection: "Category" },
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
