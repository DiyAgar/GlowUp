const { success, error } = require("common/apiResponse/apiResponse");
const { getText } = require("common/language/lang");
const { isEmail } = require("validator");
const crypto = require("crypto");
const moment = require("moment");
const User = require("common/models/userSchema");
const Device = require("common/models/deviceSchema");
const Error = require("common/models/errorSchema");
const {
  compressImage,
  uploadFileToS3,
  deleteFileWithRetry,
} = require("common/s3/s3Uploads");
const path = require("path");

exports.signin = async (req, res) => {
  try {
    const {
      countryCode,
      phoneNumber,
      email,
      deviceId,
      deviceOS,
      fcmToken,
      deviceName,
      OSVersion,
      buildNumber,
      language,
      referralCode,
      flag,
    } = req.body;

    console.log(req.body);
    if (!((phoneNumber && countryCode) || email)) {
      return res
        .status(200)
        .json(
          error(getText("PROVIDE_EMAIL_PHONE", req.language), res.statusCode)
        );
    }
    const otp = crypto.randomInt(1000, 9999);
    const expireTime = moment(new Date()).add(10, "minute");
    const user = await User.findOne({
      $and: [
        phoneNumber
          ? { countryCode: countryCode, phoneNumber: phoneNumber?.trim() }
          : {},
        email ? { email: email?.toLowerCase() } : {},
      ],
    });
    // console.log(user);
    // .lean();

    if (!user) {
      const newUser = new User({
        countryCode: countryCode,
        phoneNumber: phoneNumber?.trim(),
        otp: otp,
        expireTime: new Date(expireTime),
        flag:flag
       
      });
      const code = `${String(newUser._id).split("").reverse().join("").slice(0, 6).toUpperCase()}${Date.now().toString().slice(6, 13)}`;
      newUser.code = code;
      //referralcode
      if (referralCode) {
        const referringUser = await User.findOne({ code: referralCode.trim() });
        if (referringUser) {
          newUser.referralCode = referralCode.trim();
          newUser.referredBy = referringUser._id;
        }
      }
     // await user.save();
      await newUser.save();
      console.log(newUser);
    } else {
      await User.findByIdAndUpdate(user._id, {
        otp: otp,
        expireTime: new Date(expireTime),
      });
    }
    if (deviceId) {
      const device = await Device.findOne({ deviceId: deviceId });
      if (device) {
        await Device.findByIdAndUpdate(device._id, {
          fcmToken: fcmToken ?? "",
          authToken: token,
        });
      } else {
        await Device.create({
          user: user._id,
          deviceId: deviceId ?? "",
          deviceOS: deviceOS,
          fcmToken: fcmToken ?? "",
          authToken: token,
          deviceName: deviceName ?? "",
          OSVersion: OSVersion ?? "",
          buildNumber: buildNumber ?? "",
          language: language ? language : "English",
        });
      }
    }
    // await sendNotificationUser(
    //   "LOGIN",
    //   { type: "LOGIN", userId: String(user._id), username: user?.firstName_en },
    //   user._id,
    // );
  
    res
      .status(201)
      .json(
        success(
          getText("OTP_SENT", req.language),
          { email, countryCode, phoneNumber, otp },
          res.statusCode
        )
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/login",
    });
    res.status(400).json(error("Internal Server Error", res.statusCode));
  }
};



exports.verifyOTP = async (req, res) => {
  try {
    console.log(req.body);
    const {
      otp,
      countryCode,
      phoneNumber,
      email,
      deviceId,
      deviceOS,
      fcmToken,
      deviceName,
      OSVersion,
      buildNumber,
      language,
    } = req.body;
    if (deviceId) {
      if (deviceOS) {
        return res
          .status(206)
          .json(error(getText("DEVICE_OS", req.language), res.statusCode));
      }
      if (fcmToken) {
        return res
          .status(206)
          .json(error(getText("FCM_TOKEN", req.language), res.statusCode));
      }
      if (deviceName) {
        return res
          .status(206)
          .json(error(getText("DEVICE_NAME", req.language), res.statusCode));
      }
      if (OSVersion) {
        return res
          .status(206)
          .json(error(getText("OS_VERSION", req.language), res.statusCode));
      }
      if (buildNumber) {
        return res
          .status(206)
          .json(error(getText("BUILD_NUMBER", req.language), res.statusCode));
      }
    }
    if (!((phoneNumber && countryCode) || email)) {
      return res
        .status(200)
        .json(
          error(getText("PROVIDE_EMAIL_PHONE", req.language), res.statusCode)
        );
    }
    const user = await User.findOne({
      $and: [
        phoneNumber
          ? { countryCode: countryCode, phoneNumber: phoneNumber }
          : {},
        email ? { email: email?.toLowerCase() } : {},
      ],
    });
    if (!user) {
      const msg = email
        ? getText("UNREGISTERED_EMAIL", req.language)
        : getText("UNREGISTERED_PHONE", req.language);
      return res.status(200).json(error(msg, res.statusCode));
    }
    if (!otp) {
      return res
        .status(200)
        .json(error(getText("PROVIDE_OTP", req.language), res.statusCode));
    }
    if (user.otp !== +otp) {
      return res
        .status(200)
        .json(error(getText("INVALID_OTP", req.language), res.statusCode));
    }
    const verified = await User.findByIdAndUpdate(
      user._id,
      { isVerified: true, otp: "" },
      { new: true }
    );
    const token = user.generateAuthToken();
    if (deviceId) {
      const device = await Device.findOne({ deviceId: deviceId });
      if (device) {
        await Device.findByIdAndUpdate(device._id, {
          fcmToken: fcmToken ?? "",
          authToken: token,
        });
      } else {
        await Device.create({
          user: user._id,
          deviceId: deviceId ?? "",
          deviceOS: deviceOS,
          fcmToken: fcmToken ?? "",
          authToken: token,
          deviceName: deviceName ?? "",
          OSVersion: OSVersion ?? "",
          buildNumber: buildNumber ?? "",
          language: language ? language : "English",
        });
      }
    }
    let completeProfile = false;
    if (!user.email) completeProfile = true;
    if (!user.fullName) completeProfile = true;
    if (!user.profileImage) completeProfile = true;
    if (!user.gender) completeProfile = true;
    if (!user.dateOfBirth) completeProfile = true;
    res
      .status(201)
      .json(
        success(
          getText("OTP_VERIFIED", req.language),
          { completeProfile, token, user: verified },
          res.statusCode
        )
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/verifyOTP",
    });
    res.status(400).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select(["-otp", "-password"])
      .lean();
    let completeProfile = false;
    if (!user.email) completeProfile = true;
    if (!user.fullName) completeProfile = true;
    if (!user.profileImage) completeProfile = true;
    if (!user.gender) completeProfile = true;
    if (!user.dateOfBirth) completeProfile = true;
    res
      .status(201)
      .json(success("User", { completeProfile, user }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/getUser",
    });
    res.status(400).json(error("Internal Server Error", res.statusCode));
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, countryCode, email, gender, dateOfBirth } =
      req.body;
    console.log(req.body);
    console.log(req.files);
    const user = await User.findById(req.user._id);
    if (email?.trim()) {
      if (user.email !== email) {
        const checkEmail = await User.findOne({ email: email.toLowerCase() });
        if (checkEmail) {
          return res
            .status(200)
            .json(
              success(
                getText("DUPLICATE_EMAIL", req.language),
                { user },
                res.statusCode
              )
            );
        }
        user.email = email;
      }
    }
    if (fullName?.trim()) user.fullName = fullName;
    if (phoneNumber?.trim()) {
      if (!countryCode) {
        return res
          .status(200)
          .json(error(getText("COUNTRY_CODE", req.language), res.statusCode));
      }
      if (user.phoneNumber !== phoneNumber) {
        const checkPhone = await User.findOne({
          countryCode: countryCode,
          phoneNumber: phoneNumber?.trim(),
        });
        if (checkPhone) {
          return res
            .status(200)
            .json(
              error(getText("DUPLICATE_PHONE", req.language), res.statusCode)
            );
        }
      }
      user.phoneNumber = phoneNumber;
    }
    if (gender?.trim()) user.gender = gender?.trim();
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (req.files?.length) {
      const image = await compressImage(req.files[0], 1, "", 100);
      const filepath = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: image,
        ACL: "public-read",
        ContentType: "image/webp",
      });
      user.profileImage = filepath.Location;
      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", req.files[0].filename));
      }, 5000);
    }
    await user.save();
    res
      .status(201)
      .json(
        success(getText("USER_UPDATED", req.language), { user }, res.statusCode)
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/editUserProfile",
    });
    res.status(400).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { reason } = req.body;
    console.log(req.body);
    const user = await User.findById(req.user._id);
    user.email = "";
    user.countryCode = "";
    user.phoneNumber = "";
    user.fullName = "Account Deleted";
    user.email = "";
    user.dateOfBirth = "";
    user.profileImage = "";
    user.isDeleted = true;
    if (reason) user.reason = reason;
    await user.save();
    await Device.deleteMany({ user: user._id });
    res
      .status(201)
      .json(
        success(getText("USER_DELETED", req.language), { user }, res.statusCode)
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/deleteUser",
    });
    res.status(400).json(error("Internal Server Error", res.statusCode));
  }
};

exports.changeLanguage = async (req, res) => {
  try {
    const { language, deviceId } = req.body;
    console.log(req.body);
    if (!deviceId) {
      return res
        .status(206)
        .json(error("Please provide deviceId", res.statusCode));
    }
    if (!language) {
      return res
        .status(206)
        .json(error("Please provide language", res.statusCode));
    }
    if (!["Arabic", "English"].includes(language)) {
      return res.status(206).json(error("Invalid language", res.statusCode));
    }
    const device = await Device.findOne({ deviceId: deviceId });
    if (!device) {
      return res.status(401).json(error("Please login again!", res.statusCode));
    }
    device.language = language;
    await device.save();
    res
      .status(201)
      .json(
        success(getText("CHANGE_LANGUAGE", req.language), {}, res.statusCode)
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/changeLanguage",
    });
    res.status(400).json(error("Internal Server Error", res.statusCode));
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.header("x-auth-token-user");
    await Device.findOneAndDelete({ user: req.user._id, authToken: token });
    res
      .status(201)
      .json(success(getText("LOGGED_OUT", req.language), {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/logout",
    });
    res.status(400).json(error("Internal Server Error", res.statusCode));
  }
};

exports.updateFCM = async (req, res) => {
  try {
    console.log(req.body);
    const {
      deviceId,
      deviceOS,
      fcmToken,
      deviceName,
      OSVersion,
      buildNumber,
      language,
    } = req.body;
    if (!deviceId) {
      return res
        .status(206)
        .json(error("PROVIDE_DEVICEID", req.language), res.statusCode);
    }
    const device = await Device.findOne({
      user: req.user._id,
      deviceId: deviceId,
    });
    if (deviceId) device.deviceId = deviceId;
    if (deviceOS) device.deviceOS = deviceOS;
    if (fcmToken) device.fcmToken = fcmToken;
    if (deviceName) device.deviceName = deviceName;
    if (OSVersion) device.OSVersion = OSVersion;
    if (buildNumber) device.buildNumber = buildNumber;
    if (language) device.language = language;
    await device.save();
    res
      .status(201)
      .json(success(getText("LOGGED_OUT", req.language), {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "auth/updateFCM",
    });
    res
      .status(400)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.verifyReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;

    // inputValidate 
    if (!referralCode) {
      return res
        .status(200)
        .json(error("Referral code is required.",res.statusCode));
    }

    
    const userWithReferralCode = await User.findOne({code:referralCode });

    if (!userWithReferralCode) {
      return res
        .status(200)
        .json(error("Invalid referral code.",res.statusCode));
    }

  
    res.status(200).json(success("Referral code is valid.",
      {data: {
        userId: userWithReferralCode._id,
        name: userWithReferralCode.name,
        email: userWithReferralCode.email,
      },},res.statusCode));
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal server error.",res.statusCode));
  }
};