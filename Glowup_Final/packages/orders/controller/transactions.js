const { success, error } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
const Error = require("../../../common/models/errorSchema");

exports.payment = async (req, res) => {
  try {
    console.log(req.body);
    const { amount } = req.body;
    if (!amount) {
      return res
        .status(206)
        .json(error(getText("PROVIDE_AMOUNT", req.language), res.statusCode));
    }
    let obj = {
      paymentMethod: "E-Wallet",
      transactionDate: new Date(),
      transactionId: Date.now(),
      transactionStatus: "Paid",
      amount: +amount ? +amount : 1,
    };
    res.status(200).json(success("Payment", { obj }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "cart/payment",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};
