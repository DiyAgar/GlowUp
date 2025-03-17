const jwt = require("jsonwebtoken");
const { error } = require("../apiResponse/apiResponse");
const { getText } = require("../language/lang");
const Affiliate = require("../models/affiliateSchema");
async function tokenAffiliateAuth(req, res, next) {
  const token = req.header("x-auth-token-affiliate");
  if (!token)
    return res
      .status(401)
      .json(error("Access Denied. No token provided.", res.statusCode));
  try {
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const affiliate = await Affiliate.findById(req.user._id);
    req.language = affiliate.language ? affiliate.language : "English";
    next();
  } catch (ex) {
    console.log(ex);
    return res
      .status(401)
      .json(error(getText("SESSION", req.language), res.statusCode));
  }
}
module.exports = tokenAffiliateAuth;
