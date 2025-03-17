const { Schema, Types, model } = require("mongoose");

const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    subject: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["Query", "Feedback"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In-Progress", "Solved"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    attachment: {
      type: String,
      required: false,
      default: "",
    },
    order: {
      type: Types.ObjectId,
      ref: "Order",
      required: false,
    },
  },
  { timestamps: true },
  { collection: "Support" },
);

const Support = model("Support", schema);
module.exports = Support;
