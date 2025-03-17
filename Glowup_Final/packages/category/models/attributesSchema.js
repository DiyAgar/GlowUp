const { model, Schema, Types } = require("mongoose");

const attribute = new Schema(
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
    category: {
      type: [Types.ObjectId],
      ref: "Category",
      require: true,
    },
    subCategory: {
      type: [Types.ObjectId],
      ref: "SubCategory",
      require: false,
    },
    subSubCategory: {
      type: [Types.ObjectId],
      ref: "SubSubCategory",
      require: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
  { collection: "Attribute" },
);
const Attribute = model("Attribute", attribute);

module.exports = Attribute;
