const { Schema, Types, model } = require("mongoose");

const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    countryCode: {
      type: String,
      required: false,
    },
    street: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    pinCode: {
      type: String,
      required: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["Home", "Work", "Office", "Other"],
      default: "Home",
    },
     flag:{
      type:String,
      required:false,
      default:""
     }    
  },
  { timestamps: true },
  { collection: "Address" },
);

// schema.index({ name_ar: "text", name_en: "text" });
const Address = model("Address", schema);
module.exports = Address;
