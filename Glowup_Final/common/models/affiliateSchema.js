const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const schema = new Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
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
    nationalId: {
      type: String,
      required: false,
      default: "",
    },
    password: {
      type: String,
      required: false,
      // select: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: false,
    },
    verfification: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    age: {
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
    loyaltyPoints: {
      type: Boolean,
      default: false,
    },
    level: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    comission: {
      type: Number,
      default: 0,
    },
    reasonRejection: {
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
  { collection: "Affiliate" },
);

schema.index({ email: "text", full_name: "text", phone_number: "text" });
schema.methods.checkAffiliatePassword = async (
  passwordFromFrontend,
  passwordFromDatabase,
) => {
  return await bcrypt.compare(passwordFromFrontend, passwordFromDatabase);
};

// schema.methods.changedPasswordAfter = (JWTTimestamp) => {
//   if (this.passwordChangedAt) {
//     const changedTimeStamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10,
//     );
//     console.log(changedTimeStamp, JWTTimestamp);
//     return JWTTimestamp < changedTimeStamp;
//   }
//   return false;
// };

schema.pre("save", async function (next) {
  // console.log(this.isModified("password"));
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 7);
  next();
});

schema.methods.generateAffiliateToken = function () {
  const token = jwt.sign(
    { _id: this._id },
    // eslint-disable-next-line no-undef
    process.env.JWT_SECRET,
    { expiresIn: "90d" },
  );
  return token;
};

const Affiliate = model("Affiliate", schema);

module.exports = Affiliate;
