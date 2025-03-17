const { Schema, Types, model } = require("mongoose");

const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    varient: {
      type: Types.ObjectId,
      ref: "Varient",
      required: false,
    },
    attributeAndValues: {
      type: [Types.ObjectId],
      ref: "Attribute",
      required: true,
    },
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
    quantity: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: {} },
  { collection: "Cart" }
);

const Cart = model("Cart", schema);

module.exports = Cart;
