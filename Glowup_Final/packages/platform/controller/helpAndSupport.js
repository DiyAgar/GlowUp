const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
const Error = require("../../../common/models/errorSchema");
const User = require("../../../common/models/userSchema");
const Support = require("../models/helpSupportSchema");
const {
  compressImage,
  uploadFileToS3,
  deleteFileWithRetry,
} = require("../../../common/s3/s3Uploads");
const path = require("path");

exports.raiseTicket = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const { user, email, name, subject, message, type, priority } = req.body;
    if (!user && !email && !name) {
      return res
        .status(206)
        .json(error(getText("USER_OR_EMAIL", req.language), res.statusCode));
    }
    if (!subject) {
      return res
        .status(206)
        .json(error(getText("PROVIDE_SUBJECT", req.language), res.statusCode));
    }
    if (!message) {
      return res
        .status(206)
        .json(error(getText("PROVIDE_MESSAGE", req.language), res.statusCode));
    }
    if (!type) {
      return res
        .status(206)
        .json(error(getText("PROVIDE_TYPE", req.language), res.statusCode));
    }
    if (!["Query", "Feedback"].includes(type)) {
      return res
        .status(206)
        .json(error(getText("INVALID_TYPE", req.language), res.statusCode));
    }
    let query = {
      email: email,
      name: name,
      subject: subject,
      message: message,
      type: type,
      priority: priority ? priority : "High",
    };
    if (user) {
      const verify = await User.findById(user);
      if (!verify) {
        return res
          .status(206)
          .json(error(getText("INVALID_USER", req.language), res.statusCode));
      }
      query.user = user;
    }
    if (req.files?.length) {
      const image = await compressImage(req.files[0], 1, "", 80);
      const imageObj = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: image,
        ACL: "public-read",
        ContentType: "image/webp",
      });
      query.attachment = imageObj.Location;
      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", req.files[0].filename));
      }, 5000);
    }
    const ticket = await Support.create(query);
    res
      .status(201)
      .json(
        success(getText("Success", req.language), { ticket }, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "user/raiseTicket",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Support.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res
      .status(201)
      .json(
        success(getText("Success", req.language), { tickets }, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/getQueary",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getUserQueary = async (req, res) => {
  try {
    const { search, page = 1, pageSize = 10 } = req.body;

    const matchCondition = { type: "Query" };
    if (search) {
      matchCondition.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } },
      ];
    }
    const queary = await Support.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {$match: matchCondition },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          queary: [{ $skip: +pageSize * (+page - 1) }, { $limit: +pageSize }],
        },
      },
    ]);
    const total = queary[0].metadata.length ? queary[0].metadata[0].total : 0;
    res.status(200).json(
      success(
        "user queary",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          queary: +total ? queary[0].queary : [],
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/getUserQueary",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getUserFeedback = async (req, res) => {
  try {
    const { search, page = 1, pageSize = 10 } = req.body;
    const feedback = await Support.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $match: {
          type: "Feedback",
          $and: [
            search ? { name: { $regex: search?.trim(), $options: "i" } } : {},
            search
              ? { message: { $regex: search?.trim(), $options: "i" } }
              : {},
          ],
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          feedback: [{ $skip: +pageSize * (+page - 1) }, { $limit: +pageSize }],
        },
      },
    ]);
    const total = feedback[0].metadata.length
      ? feedback[0].metadata[0].total
      : 0;
    res.status(200).json(
      success(
        "Categories",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          feedback: +total ? feedback[0].feedback : [],
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/getUserFeedback",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.viewQueary = async (req, res) => {
  try {
    const queary = await Support.findById(req.params.id);
    res.status(200).json(success("Queary", { queary }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/viewQueary/:id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.deleteQueary = async (req, res) => {
  try {
    await Support.findByIdAndDelete(req.params.id);
    res.status(200).json(success("Queary Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/deleteQueary/:id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};
