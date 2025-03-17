const { Schema, model, Types } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const schema = new Schema(
  {
    fullName: {
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
    email: {
      type: String,
      required: false,
      // unique: true,
    },
    profileImage: {
      type: String,
      required: false,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: false,
    },
    dateOfBirth: {
      type: String,
      required: false,
    },
    otp: {
      type: Number,
    },
    expireTime: {
      type: Date,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    promocodesApplied: [
      {
        type: Types.ObjectId,
        // ref: "PromoCode",
        required: false,
      },
    ],
    offersUsed: [
      {
        type: Types.ObjectId,
        // ref: "Offer",
        required: false,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      required: false,
      default: "",
    },
    code: {
      type: String,
      default: "",
    },
    isReferredUser: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
      default: "",
    },
    referredBy: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    flag: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: {} },
  { collection: "User" }
);

schema.index({ email: "text", full_name: "text", phone_number: "text" });
schema.methods.checkUserPassword = async (
  passwordFromFrontend,
  passwordFromDatabase
) => {
  return await bcrypt.compare(passwordFromFrontend, passwordFromDatabase);
};

schema.methods.changedPasswordAfter = (JWTTimestamp) => {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

schema.pre("save", async function (next) {
  // console.log(this.isModified("password"));
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 7);
  next();
});

schema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id },
    // eslint-disable-next-line no-undef
    process.env.JWT_SECRET,
    { expiresIn: "90d" }
  );
  return token;
};

const User = model("User", schema);

module.exports = User;
