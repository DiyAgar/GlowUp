const { Schema, model, Types } = require("mongoose");
const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    notification_status: {
      type: Boolean,
      required: false,
      default: true,
    },
    deviceId: {
      type: String,
      required: false,
      default: "",
    },
    deviceOS: {
      type: String,
      required: false,
      default: "",
    },
    fcmToken: {
      type: String,
      required: false,
      default: "",
    },
    authToken: {
      type: String,
      required: false,
      default: "",
    },
    deviceName: {
      type: String,
      required: false,
      default: "",
    },
    OSVersion: {
      type: String,
      required: false,
      default: "",
    },
    buildNumber: {
      type: String,
      required: false,
      default: "",
    },
    language: {
      type: String,
      required: false,
      enum: ["English", "Arabic"],
      default: "English",
    },
  },
  { timestamps: {} },
  { collection: "Device" },
);

// schema.index({ email: "text", full_name: "text", phone_number: "text" });

const Device = model("Device", schema);

module.exports = Device;
