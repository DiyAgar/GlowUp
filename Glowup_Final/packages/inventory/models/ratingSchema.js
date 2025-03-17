const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Varient",
      required: false,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
        required: false,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Rating", ratingSchema);
