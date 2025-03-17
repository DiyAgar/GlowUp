const jwt = require("jsonwebtoken");
const { error } = require("../apiResponse/apiResponse");
const { getText } = require("../language/lang");
const Admin = require("../models/admin");
async function tokenAdminAuth(req, res, next) {
  const token = req.header("x-auth-token-admin");
  if (!token)
    return res
      .status(401)
      .json(error("Access Denied. No token provided.", res.statusCode));
  try {
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    const admin = await Admin.findById(req.admin._id).lean();
    if (!admin) {
      return res
        .status(401)
        .json(error(getText("SESSION", req.language), res.statusCode));
    }
    req.language = admin.language ? admin.language : "English";
    next();
  } catch (ex) {
    console.log(ex);
    return res
      .status(401)
      .json(error(getText("SESSION", req.language), res.statusCode));
  }
}
module.exports = tokenAdminAuth;
