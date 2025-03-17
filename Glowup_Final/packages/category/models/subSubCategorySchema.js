const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    category: {
      type: [mongoose.Types.ObjectId],
      ref: "Category",
      required: false,
    },
    subCategory: {
      type: [mongoose.Types.ObjectId],
      ref: "SubCategory",
      required: false,
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
  { collection: "SubSubCategory" },
);

const SubSubCategory = mongoose.model("SubSubCategory", schema);

module.exports = SubSubCategory;
