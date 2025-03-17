const { success, error } = require("common/apiResponse/apiResponse");
//const { getText } = require("../../../../common/language/lang");\
const validator = require("validator");
const Admin = require("common/models/admin");
const moment = require("moment");
const Error = require("common/models/errorSchema");
const {
  compressImage,
  uploadFileToS3,
  deleteFileWithRetry,
} = require("common/s3/s3Uploads");
const path = require("path");
const { sendMail } = require("../../notifications/controller/mail");

exports.adminSignup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email) {
      return res
        .status(201)
        .json(error("Please provide email", res.statusCode));
    }
    if (!validator.isEmail(email)) {
      return res.status(201).json(error("Invalid email", res.statusCode));
    }
    if (!password) {
      return res
        .status(201)
        .json(error("Please provide password", res.statusCode));
    }
    const verifyAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (verifyAdmin) {
      return res
        .status(201)
        .json(error("Email is already registered", res.statusCode));
    }

    const admin = await Admin.create({
      email: email.toLowerCase(),
      password: password,
      name: name,
    });
    res
      .status(201)
      .json(success("Signup Successful", { admin }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/adminSignup",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res
        .status(201)
        .json(error("Please provide email", res.statusCode));
    }
    if (!password) {
      return res
        .status(201)
        .json(error("Please provide password", res.statusCode));
    }
    const verify = await Admin.findOne({ email: email?.toLowerCase() });
    if (!verify) {
      return res
        .status(201)
        .json(error("Admin is not registered", res.statusCode));
    }
    if (!(await verify.correctPassword(password, verify.password))) {
      return res.status(201).json(error("Invalid Password", res.statusCode));
    }
    const token = await verify.generateAdminAuthToken();
    res
      .header("x-auth-token-admin", token)
      .header("access-control-expose-headers", "x-auth-token-admin")
      .status(201)
      .json(
        success("Logged In Successfully", { verify, token }, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/admin-login",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.adminForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(201)
        .json(error("Please provide email", res.statusCode));
    }
    if (!validator.isEmail(email)) {
      return res.status(201).json(error("Invalid email", res.statusCode));
    }
    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });
    if (!admin) {
      return res
        .status(200)
        .json(error("Email is not registered", res.statusCode));
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    var expire_time = (expire_time = moment(expire_time).add(5, "minutes"));
    await Admin.findByIdAndUpdate(admin._id, {
      otp: +otp,
      expire_time: expire_time,
    });
    sendMail(
      email,
      "Glow up Password OTP",
      `Your otp is ${otp} expire in 5 minute`,
    );
    res.status(201).json(success("OTP Sent", { otp, admin }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/admin-forgetPassword",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.adminVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email) {
      return res
        .status(201)
        .json(error("Please provide email", res.statusCode));
    }
    if (!validator.isEmail(email)) {
      return res.status(201).json(error("Invalid email", res.statusCode));
    }
    if (!otp) {
      return res.status(201).json(error("Please enter OTP", res.statusCode));
    }
    const verify = await Admin.findOne({ email: email.toLowerCase() });
    if (!verify) {
      return res
        .status(201)
        .json(error("Email is not registered", res.statusCode));
    }
    if (verify.otp !== +otp) {
      return res.status(201).json(error("Invalid OTP", res.statusCode));
    }
    if (new Date(verify.expire_time) < new Date()) {
      return res.status(200).json(error("OTP Expired", res.statusCode));
    }
    await Admin.findOneAndUpdate({ email: email.toLowerCase() }, { otp: "" });
    res.status(201).json(success("OTP Verified", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/admin-verifyOTP",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { email, password, oldPassword } = req.body;
    if (!email) {
      return res
        .status(201)
        .json(error("Please provide email", res.statusCode));
    }
    if (!validator.isEmail(email)) {
      return res.status(201).json(error("Invalid email", res.statusCode));
    }
    if (!password) {
      return res
        .status(201)
        .json(error("Please provide password", res.statusCode));
    }
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select(
      "password",
    );
    if (oldPassword) {
      if (!(await admin.correctPassword(oldPassword, admin.password))) {
        return res
          .status(200)
          .json(error("Invalid old Password", res.statusCode));
      }
    }
    if (await admin.correctPassword(password, admin.password)) {
      return res
        .status(200)
        .json(error("Old and new Password cannot be same", res.statusCode));
    }
    admin.password = password;
    await admin.save();
    res
      .status(201)
      .json(
        success("Password Updated Successfully", { admin }, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/admin-updatePassword",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getAdminData = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    res.status(200).json(success("Success", { admin }, res.statusCode));
  } catch (err) {
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/getAdmin",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.editProfile = async (req, res) => {
  try {
    const { name, email, mobileNumber } = req.body;
    let image, filepath;
    if (req.files && req.files[0]) {
      image = await compressImage(req.files[0], 1, "", 80);

      filepath = await uploadFileToS3({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: image,
        ACL: "public-read",
        ContentType: "image/webp",
      });

      setTimeout(async () => {
        if (req.files[0]?.filename) {
          deleteFileWithRetry(path.join("./public/", req.files[0].filename));
        }
      }, 5000);
    }

    const admin = await Admin.findById(req.admin._id);

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (mobileNumber) admin.mobileNumber = mobileNumber;
    if (filepath) admin.image = filepath.Location;
    await admin.save();
    res
      .status(200)
      .json(success("Profile Update Successful", { admin }, res.statusCode));
  } catch (err) {
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/editAdmin",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).json(error("Invalid Token", res.statusCode));
    }
    if (!password) {
      return res
        .status(201)
        .json(error("Please provide old password", res.statusCode));
    }
    if (!newPassword) {
      return res
        .status(201)
        .json(error("Please provide new password", res.statusCode));
    }
    if (!(await admin.correctPassword(password ,admin.password,))) {
      return res
        .status(201)
        .json(error("Incorrect old password", res.statusCode));
    }
    if (password === newPassword) {
      return res
        .status(201)
        .json(
          error(
            "Old password and new password should not be same",
            res.statusCode
          )
        );
    }
    admin.password = newPassword;
    await admin.save();
    res
      .status(201)
      .json(
        success("Password Updated Successfully", { admin }, res.statusCode)
      );
  } catch (err) {
    console.log(err);
    res.status(400).json(error("Password change error", res.statusCode));
  }
};