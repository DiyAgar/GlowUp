const jwt = require("jsonwebtoken");
const { error } = require("../apiResponse/apiResponse");
const { getText } = require("../language/lang");
const User = require("../models/userSchema");
const Device = require("../models/deviceSchema");
async function tokenGuestAuth(req, res, next) {
  const token = req.header("x-auth-token-user");
  const language = req.header("x-auth-language");
  // if (!token)
  //   return res
  //     .status(401)
  //     .json(error("Access Denied. No token provided.", res.statusCode));
  try {
    if (token) {
      // eslint-disable-next-line no-undef
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      const user = await User.findById(req.user._id).lean();
      if (!user) {
        return res
          .status(401)
          .json(error(getText("SESSION", req.language), res.statusCode));
      }
      if (!user.status) {
        return res
          .status(401)
          .json(
            error(getText("ACCOUNT_DISABLED", req.language), res.statusCode),
          );
      }
      const device = await Device.findOne({
        user: user._id,
        authToken: token,
      }).lean();
      req.language = device ? device.language : "English";
      // if (!device) {
      //   return res
      //     .status(401)
      //     .json(error(getText("SESSION", req.language), res.statusCode));
      // }
      return next();
    } else {
      req.user = null;
      if (language) {
        req.language = ["English", "Arabic"].includes(language)
          ? language
          : "English";
      } else {
        req.language = "English";
      }
      return next();
    }
  } catch (ex) {
    console.log(ex);
    return res
      .status(401)
      .json(error(getText("SESSION", req.language), res.statusCode));
  }
}
module.exports = tokenGuestAuth;
