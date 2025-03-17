const News = require("../models/newSchema");
const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
const {
  compressImage,
  uploadFileToS3,
  deleteFileWithRetry,
} = require("../../../common/s3/s3Uploads");
const path = require("path");

exports.addNews = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const { title_en, description_en, title_ar, description_ar, type } =
      req.body;
    if (!req.files?.length) {
      return res
        .status(200)
        .json(error(getText("IMAGE", req.language), res.statusCode));
    }
    const image = await compressImage(req.files[0], 1, "", 80);
    const imageWeb = await uploadFileToS3({
      // eslint-disable-next-line no-undef
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Admins/${Date.now()}.webp`,
      Body: image,
      ACL: "public-read",
      ContentType: "image/webp",
    });
    setTimeout(async () => {
      deleteFileWithRetry(path.join("./public/", req.files[0].filename));
    }, 5000);

    const news = await News.create({
      title_en,
      description_en,
      title_ar,
      description_ar,
      type,
      image: imageWeb.Location,
    });
    res.status(201).json(success("Success", { news }, res.statusCode));
  } catch (err) {
    console.log(err);
    //   await Error.create({
    //     arrError: err,
    //     strError: JSON.stringify(err),
    //     objError: err,
    //     route: "category/getCategories",
    //   });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getNews = async (req, res) => {
  try {
    const { search, page = 1, pageSize = 10, type } = req.body;
    const news = await News.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
      {
        $match: {
          type: type,
          $and: [
            search ? { name_en: { $regex: search.trim(), $options: "i" } } : {},
            search
              ? { description_en: { $regex: search.trim(), $options: "i" } }
              : {},
          ],
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          news: [{ $skip: +pageSize * (+page - 1) }, { $limit: +pageSize }],
        },
      },
    ]);
    const total = news[0].metadata.length ? news[0].metadata[0].total : 0;
    res.status(200).json(
      success(
        "News list",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          news: +total ? news[0].news : [],
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    //   await Error.create({
    //     arrError: err,
    //     strError: JSON.stringify(err),
    //     objError: err,
    //     route: "category/getCategories",
    //   });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.viewNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    res.status(200).json(success("Banners", { news }, res.statusCode));
  } catch (err) {
    console.log(err);
    //   await Error.create({
    //     arrError: err,
    //     strError: JSON.stringify(err),
    //     objError: err,
    //     route: "platform/viewBanners/:id",
    //   });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.status(200).json(success("News Deleted", {}, res.statusCode));
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

exports.editNews = async (req, res) => {
  try {
    const { title_en, description_en, title_ar, description_ar } = req.body;
    const news = await News.findById(req.params.id);
    let image = "";
    if (req.files?.length) {
      const image = await compressImage(req.files[0], 1, "", 80);
      // images.push(image);
      const filepath = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: image,
        ACL: "public-read",
        ContentType: "image/webp",
      });
      let images = filepath;
      console.log(images);
      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", req.files[0].filename));
      }, 5000);
    }
    if (title_en) news.title_en = title_en;
    if (description_en) news.description_en = description_en;
    if (title_ar) news.title_ar = title_ar;
    if (description_ar) news.description_ar = description_ar;
    if (image) news.image = image.Location;
    await news.save();
    res
      .status(200)
      .json(success("Updated Successfully", { news }, res.statusCode));
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
