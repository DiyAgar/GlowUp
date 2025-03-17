const { model, Schema, Types } = require("mongoose");
const { collection } = require("./attributesSchema");

const brand = new Schema(
  {
    brandName_en: {
      type: String,
      required: true,
    },
    brandName_ar: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
      default: "",
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
  { collection: "Brand" },
);
const Brand = model("Brand", brand);
module.exports = Brand;
