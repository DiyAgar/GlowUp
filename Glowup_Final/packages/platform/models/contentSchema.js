const mongoose = require("mongoose");

const contenSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["About Us", "Term and Conditions", "Privacy Policy"],
      required: true,
    },
    title_en: {
      type: String,
      required: true,
    },
    title_ar: {
      type: String,
      required: true,
    },
    contents_en: [
      {
        heading: {
          type: String,
          required: false,
        },
        content: {
          type: String,
          required: false,
        },
      },
    ],
    contents_ar: [
      {
        heading: {
          type: String,
          required: false,
        },
        content: {
          type: String,
          required: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ["published", "pending"],
      default: "published",
    },
  },
  { timestamps: true },
  { collection: "content" },
);
contenSchema.index({ createdAt: -1 });
contenSchema.index({ type: 1 });
const Content = mongoose.model("content", contenSchema);
module.exports = Content;
