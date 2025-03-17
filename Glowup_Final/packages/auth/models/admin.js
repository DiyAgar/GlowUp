// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const adminSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: false,
//     },
//     email: {
//       type: String,
//       required: true,
//     },
//     image: {
//       type: String,
//       default: "",
//     },
//     password: {
//       type: String,
//       required: false,
//     },
//     mobileNumber: {
//       type: Number,
//       required: false,
//     },
//     otp: {
//       type: Number,
//     },
//     expire_time: {
//       type: Date,
//       required: false,
//     },
//     status: {
//       type: Boolean,
//       required: false,
//       default: true,
//     },
//   },
//   { timestamps: true },
//   { collection: "admin" }
// );

// adminSchema.methods.correctPassword = async (dbPass, frontendPass) => {
//   return bcrypt.compare(frontendPass, dbPass);
// };

// adminSchema.methods.generateAdminAuthToken = function () {
//   const token = jwt.sign({ _id: this._id }, "ultra-security", {
//     expiresIn: "90d",
//   });
//   return token;
// };

// adminSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     return (this.password = await bcrypt.hash(this.password, 7));
//   }
//   next();
// });

// const admin = mongoose.model("admin", adminSchema);

// module.exports = admin;
