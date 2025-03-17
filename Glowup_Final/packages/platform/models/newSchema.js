const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title_en: {
      type: String,
      required: true,
    },
    description_en: {
      type: String,
      required: true,
    },
    title_ar: {
      type: String,
      required: true,
    },
    description_ar: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["News", "Beauty"],
      requred: true,
    },
  },
  { timestamps: {} },
  { collection: "News" },
);

const News = mongoose.model("News", schema);

module.exports = News;
