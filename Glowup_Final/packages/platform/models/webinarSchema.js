const { Schema, Types, model } = require("mongoose");

const schema = new Schema(
  {
    title_en: {
      type: String,
      required: false,
    },
    title_ar: {
      type: String,
      required: false,
    },
    products: {
      type: [Types.ObjectId],
      ref: "Inventory",
      required: false,
    },
    url: {
      type: String,
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
    date: {
      type: Date,
      required: false,
    },
  },
  { timestamps: {} },
  { collection: "Webinar" },
);

const Webinar = model("Webinar", schema);

module.exports = Webinar;
