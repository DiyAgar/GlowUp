const { error } = require("../apiResponse/apiResponse");
const { getText } = require("../language/lang");

const languageToken = async (req, res, next) => {
  const language = req.header("x-auth-language");
  if (!language)
    return res
      .status(401)
      .json(error("Please provide language header", res.statusCode));
  try {
    if (!["English", "Arabic"].includes(language)) {
      return res
        .status(401)
        .json(error("Invalid language header", res.statusCode));
    }
    req.language = language;
    next();
  } catch (ex) {
    console.log(ex);
    return res
      .status(400)
      .json(error(getText("UNAUTHORISED", language), res.statusCode));
  }
};

module.exports = languageToken;
