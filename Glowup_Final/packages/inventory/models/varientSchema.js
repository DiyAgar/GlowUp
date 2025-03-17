const { Schema, model, Types } = require("mongoose");

const schema = new Schema(
  {
    attribute: {
      type: [Types.ObjectId],
      ref: "Attribute",
      required: true,
    },
    value: {
      type: [Types.ObjectId],
      ref: "Value",
      default: [],
    },
    inventory: {
      type: Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    imagesApp: {
      type: Array,
      default: [],
    },
    imagesWeb: {
      type: Array,
      default: [],
    },
    imagesOg: {
      type: Array,
      required: false,
      default: [],
    },
    price: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
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
  { collection: "Varient" }
);

const Varient = model("Varient", schema);

module.exports = Varient;
