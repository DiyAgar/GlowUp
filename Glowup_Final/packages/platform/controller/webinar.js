const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
const Webinar = require("../models/webinarSchema");
//const Inventory = require("../../inventory/models/inventory");

exports.addWebinar = async (req, res) => {
  try {
    const { products, url, startDate, endDate, date, title_en, title_ar } =
      req.body;
    console.log(req.body);
    // if (products?.trim()) {
    // if (JSON.parse(products?.trim()).length) {
    const productId = await Inventory.findById(products);
    if (!productId) {
      return res
        .status(200)
        .json(error(getText("PRODUCTS", req.language), res.statusCode));
    }
    // }
    //}

    const webinar = await Webinar.create({
      products: products,
      title_ar: title_ar,
      title_en: title_en,
      url: url,
      startDate: startDate,
      endDate: endDate,
      date: date,
    });
    res.status(201).json(success("Success", { webinar }, res.statusCode));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getWebinar = async (req, res) => {
  try {
    const { search, page = 1, pageSize = 10 } = req.body;
    const query = {
      $or: [{ title_en: { $regex: search.trim(), $options: "i" } }],
    };
    const webinar = await Webinar.aggregate([
      {
        $match: query,
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          webinars: [{ $skip: +pageSize * (+page - 1) }, { $limit: +pageSize }],
        },
      },
    ]).sort({ createdAt: -1 });
    const total = webinar[0].metadata.length ? webinar[0].metadata[0].total : 0;
    res.status(200).json(
      success(
        "Banners",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          webinar: +total ? webinar[0].webinars : [],
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
      route: "platform/getWebinar",
    });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.viewWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    res.status(200).json(success("Webinar", { webinar }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/viewBanners/:id",
    });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.deleteWebinar = async (req, res) => {
  try {
    await Webinar.findByIdAndDelete(req.params.id);
    res.status(200).json(success("Webinar Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    //   await Error.create({
    //     arrError: err,
    //     strError: JSON.stringify(err),
    //     objError: err,
    //     route: "platform/deleteBanners/:id",
    //   });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.editWebinar = async (req, res) => {
  try {
    const { title_en, startDate, title_ar, endDate, url, date } = req.body;
    const webinar = await Webinar.findById(req.params.id);

    if (title_en) webinar.title_en = title_en;
    if (title_ar) webinar.title_ar = title_ar;
    if (startDate) webinar.startDate = startDate;
    if (endDate) webinar.endDate = endDate;
    if (url) webinar.url = url;
    if (date) webinar.date = date;

    await webinar.save();
    res
      .status(200)
      .json(success("Updated Successfully", { webinar }, res.statusCode));
  } catch (err) {
    console.log(err);
    //   await Error.create({
    //     arrError: err,
    //     strError: JSON.stringify(err),
    //     objError: err,
    //     route: "category/editCategories/:id",
    //   });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};
