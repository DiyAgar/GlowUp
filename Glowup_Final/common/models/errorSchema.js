const { Schema, model, Types } = require("mongoose");
const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    admin: {
      type: Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    affiliate: {
      type: Types.ObjectId,
      ref: "Affiliate",
      required: false,
    },
    arrError: {
      type: Array,
      required: false,
      default: [],
    },
    strError: {
      type: String,
      required: false,
      default: "",
    },
    objError: {
      type: Object,
      required: false,
      default: {},
    },
    route: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: {} },
  { collection: "Error" },
);

// schema.index({ email: "text", full_name: "text", phone_number: "text" });

const Error = model("Error", schema);

module.exports = Error;
