const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
const Error = require("../../../common/models/errorSchema");
const User = require("../../../common/models/userSchema");
const Address = require("../models/addressSchema");

exports.addAddress = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      countryCode,
      street,
      city,
      state,
      country,
      pinCode,
      isDefault,
      type,
      flag,
      saveToProfile,
    } = req.body;
    console.log(req.body);
    if (!street) {
      return res
        .status(206)
        .json(error(getText("PROVIDE_STREET", req.language), res.statusCode));
    }
    if (!city) {
      return res
        .status(206)
        .json(error(getText("PROVIDE_CITY", req.language), res.statusCode));
    }
    if (!pinCode) {
      return res
        .status(206)
        .json(error(getText("PROVIDE_PINCODE", req.language), res.statusCode));
    }
    if (type) {
      if (!["Home", "Work", "Office", "Other"].includes(type)) {
        return res
          .status(206)
          .json(
            error(getText("INVALID_ADD_TYPE", req.language), res.statusCode)
          );
      }
    }
    if (["true", true].includes(isDefault)) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const address = await Address.create({
      user: req.user._id,
      name: name,
      phoneNumber: phoneNumber,
      countryCode: countryCode,
      street: street,
      city: city,
      state: state,
      country: country,
      pinCode: pinCode,
      isDefault: ["true", true].includes(isDefault) ? true : false,
      type: type,
      flag: flag,
    });
    if (name?.trim() && saveToProfile) {
      await User.findByIdAndUpdate(req.user._id, { fullName: name?.trim() });
    }
    res.status(201).json(success("Address added", { address }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "user/addAddress",
    });
    res
      .status(400)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.editAddress = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      countryCode,
      street,
      city,
      state,
      country,
      pinCode,
      isDefault,
      type,
      flag,
    } = req.body;
    console.log(req.body);
    const address = await Address.findById(req.params._id);
    if (!address) {
      return res.status(206).json(error("Invalid Id", res.statusCode));
    }
    if (name) address.name = name;
    if (phoneNumber) address.phoneNumber = phoneNumber;
    if (countryCode) address.countryCode = countryCode;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (country) address.country = country;
    if (pinCode) address.pinCode = pinCode;
    if (flag) address.flag = flag;
    if (type) {
      if (!["Home", "Work", "Office", "Other"].includes(type)) {
        return res
          .status(206)
          .json(
            error(getText("INVALID_ADD_TYPE", req.language), res.statusCode)
          );
      }
      address.type = type;
    }
    if (isDefault) {
      await Address.updateMany({ user: address.user }, { isDefault: false });
      address.isDefault = true;
      // if (!["true", true].includes(isDefault)) {
      // }
    }
    await address.save();
    res
      .status(201)
      .json(success("Address edited", { address }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "user/editAddress",
    });
    res
      .status(400)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const address = await Address.find({ user: req.user._id })
      .populate("user")
      .sort({ createdAt: -1 })
      .lean();
    res.status(201).json(success("Addresses", { address }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "user/getAddresses",
    });
    res
      .status(400)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};
exports.viewAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params._id);
    res.status(201).json(success("Address", { address }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "user/viewAddresses",
    });
    res
      .status(400)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params._id);
    res.status(201).json(success("Address Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "user/deleteAddress",
    });
    res
      .status(400)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};
