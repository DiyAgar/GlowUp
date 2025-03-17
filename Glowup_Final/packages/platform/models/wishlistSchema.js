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
  },
  { timestamps: {} },
  { collection: "Wishlist" }
);

const Wishlist = model("Wishlist", schema);

module.exports = Wishlist;
