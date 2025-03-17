const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    otp: {
      type: Number,
    },
    expire_time: {
      type: Date,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    language: {
      type: String,
      required: false,
      enum: ["English", "Arabic"],
      default: "English",
    },
  },
  { timestamps: true },
  { collection: "Admin" },
);
adminSchema.index({ email: "text", name: "text", mobileNumber: "text" });
adminSchema.methods.correctPassword = async (
  passwordFromFrontend,
  passwordFromDatabase,
) => {
  return await bcrypt.compare(passwordFromFrontend, passwordFromDatabase);
};

adminSchema.methods.generateAdminAuthToken = function () {
  // eslint-disable-next-line no-undef
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
  return token;
};

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    return (this.password = await bcrypt.hash(this.password, 7));
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
