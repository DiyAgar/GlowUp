const { Schema, Types, model } = require("mongoose");

const schema = new Schema(
  {
    imageApp: {
      type: String,
      required: true,
    },
    imageWeb: {
      type: String,
      required: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: false,
    },
    subCategory: {
      type: Types.ObjectId,
      ref: "SubCategory",
      required: false,
    },
    subSubCategory: {
      type: Types.ObjectId,
      ref: "SubSubCategory",
      required: false,
    },
    products: {
      type: [Types.ObjectId],
      ref: "Inventory",
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    url: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      enum: ["Top", "Offer"],
      default: "Top",
    },
  },
  { timestamps: true },
  { collection: "Banner" },
);

const Banner = model("Banner", schema);
module.exports = Banner;
