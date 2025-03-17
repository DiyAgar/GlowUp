const { Schema, model, Types } = require("mongoose");

const schema = new Schema(
  {
    name_en: {
      type: String,
      required: true,
    },
    name_ar: {
      type: String,
      default: "",
    },
    description_en: {
      type: String,
      required: false,
    },
    description_ar: {
      type: String,
      default: "",
    },
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: false,
    },
    category: {
      type: [Types.ObjectId],
      ref: "Category",
      required: true,
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
    imagesApp: {
      type: Array,
      required: false,
      default: [],
    },
    imagesWeb: {
      type: Array,
      required: false,
      default: [],
    },
    imagesOg: {
      type: Array,
      required: false,
      default: [],
    },
    status: {
      type: Boolean,
      required: false,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      required: false,
      default: false,
    },
    // price: {
    //   type: Number,
    //   default: 0,
    // },
    // discount: {
    //   type: Number,
    //   default: 0,
    // },
    origin: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "",
    },
    hasVarients: {
      type: Boolean,
      default: false,
    },
    attributes: {
      type: [Types.ObjectId],
      ref: "Attribute",
      default: [],
    },
    values: {
      type: [Types.ObjectId],
      ref: "Value",
      default: [],
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  
  },
  { timestamps: true },
  { collection: "Inventory"}
);

const Inventory = model("Inventory", schema);

module.exports = Inventory;
