const { Schema, Types, model } = require("mongoose");

const schema = new Schema(
  {
    name_en: {
      type: String,
      required: true,
      default: "",
    },
    name_ar: {
      type: String,
      required: true,
      default: "",
    },
    category: {
      type: [Types.ObjectId],
      ref: "Category",
      required: false,
    },
    subCategory: {
      type: [Types.ObjectId],
      ref: "SubCategory",
      required: false,
    },
    subSubCategory: {
      type: [Types.ObjectId],
      ref: "SubSubCategory",
      required: false,
    },
    products: {
      type: [Types.ObjectId],
      ref: "Inventory",
      required: false,
    },
    affiliates: {
      type: [Types.ObjectId],
      ref: "Affiliate",
      required: false,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
  { collection: "Campaign" },
);

const Campaign = model("Campaign", schema);
module.exports = Campaign;
