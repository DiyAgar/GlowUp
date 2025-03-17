const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    category: {
      type: [mongoose.Types.ObjectId],
      ref: "Category",
      required: true,
    },
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
  },
  { timestamps: true },
  { collection: "SubCategory" },
);

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategory;
