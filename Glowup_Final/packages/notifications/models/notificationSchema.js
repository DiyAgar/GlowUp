const { Types, Schema, model } = require("mongoose");

const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
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
    body_en: {
      type: String,
      required: true,
    },
    body_ar: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: {} },
  { collection: "UserNotification" },
);

const UserNotification = model("UserNotification", schema);

module.exports = UserNotification;
