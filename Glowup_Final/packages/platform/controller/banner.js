const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
//const Category = require("../../category/models/category");
//const SubCategory = require("../../category/models/subCategory");
//const SubSubCategory = require("../../category/models/subSubCategory");
//const Inventory = require("../../inventory/models/inventory");
// const {
//   uploadFileToS3,
//   compressImage,
//   deleteFileWithRetry,
// } = require("common/s3/s3Uploads");
const path = require("path");
const Banner = require("../models/bannerSchema");
const { default: mongoose } = require("mongoose");

exports.addBanner = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const {
      category,
      subCategory,
      subSubCategory,
      products,
      url,
      text,
      position,
    } = req.body;
    if (!req.files?.length) {
      return res
        .status(200)
        .json(error(getText("IMAGE", req.language), res.statusCode));
    }
    if (category?.trim()) {
      const categoryId = await Category.findById(category);
      if (!categoryId) {
        return res
          .status(200)
          .json(error(getText("CATEGORY", req.language), res.statusCode));
      }
    }
    if (subCategory?.trim()) {
      const subCategoryId = await SubCategory.findById(subCategory?.trim());
      if (!subCategoryId) {
        return res
          .status(200)
          .json(error(getText("SUBCATEGORY", req.language), res.statusCode));
      }
    }
    if (subSubCategory?.trim()) {
      const subSubCategoryId = await SubSubCategory.find({
        _id: subSubCategory?.trim(),
      });
      if (!subSubCategoryId) {
        return res
          .status(200)
          .json(error(getText("SUBSUBCATEGORY", req.language), res.statusCode));
      }
    }
    if (products?.trim()) {
      if (JSON.parse(products?.trim()).length) {
        const productId = await Inventory.findById(
          JSON.parse(products?.trim()),
        );
        if (!productId) {
          return res
            .status(200)
            .json(error(getText("PRODUCTS", req.language), res.statusCode));
        }
      }
    }
    if (!position) {
      return res
        .status(201)
        .json(error("Please provide position", res.statusCode));
    }
    if (!["Top", "Offer"].includes(position)) {
      return res.status(201).json(error("Invalid position", res.statusCode));
    }
    const image = await compressImage(req.files[0], 1, "", 80);
    const appBuffer = await compressImage(req.files[0], 1, "", 60);
    const imageWeb = await uploadFileToS3({
      // eslint-disable-next-line no-undef
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Admins/${Date.now()}.webp`,
      Body: image,
      ACL: "public-read",
      ContentType: "image/webp",
    });
    const imageApp = await uploadFileToS3({
      // eslint-disable-next-line no-undef
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Admins/${Date.now()}.webp`,
      Body: appBuffer,
      ACL: "public-read",
      ContentType: "image/webp",
    });
    setTimeout(async () => {
      deleteFileWithRetry(path.join("./public/", req.files[0].filename));
    }, 5000);

    const banner = await Banner.create({
      category: category,
      subCategory: subCategory,
      subSubCategory: subSubCategory,
      products: products,
      url: url,
      imageApp: imageApp.Location,
      imageWeb: imageWeb.Location,
      text: text,
      position: position,
    });
    res.status(201).json(success("Success", { banner }, res.statusCode));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Inventory.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          name_en: 1,
          name_ar: 1,
        },
      },
    ]);
    res.status(200).json(
      success(
        "Product  list",
        {
          products,
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "platform/getProducts",
    });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.getBanners = async (req, res) => {
  try {
    const { search, category, page = 1, pageSize = 10 } = req.body;
    const query = {
      $or: [{ "category.name_en": { $regex: search.trim(), $options: "i" } }],
    };
    const banner = await Banner.aggregate([
      {
        $match: {
          $and: [
            category ? { category: new mongoose.Types.ObjectId(category) } : {},
          ],
        },
      },
      {
        $lookup: {
          localField: "category",
          foreignField: "_id",
          from: "categories",
          as: "category",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          localField: "subCategory",
          foreignField: "_id",
          from: "subcategories",
          as: "subCategory",
        },
      },
      {
        $unwind: {
          path: "$subSubCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: query,
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          banners: [{ $skip: +pageSize * (+page - 1) }, { $limit: +pageSize }],
        },
      },
    ]).sort({ createdAt: -1 });
    const total = banner[0].metadata.length ? banner[0].metadata[0].total : 0;
    res.status(200).json(
      success(
        "Banners",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          banner: +total ? banner[0].banners : [],
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
      route: "platform/getsBanners",
    });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.viewBanners = async (req, res) => {
  try {
    const banners = await Banner.findById(req.params.id).populate([
      "category",
      "subCategory",
    ]);
    res.status(200).json(success("Banners", { banners }, res.statusCode));
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

exports.changeBanners = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id).select("status");
    banner.status = !banner.status;
    await banner.save();
    const msg = banner.status ? "Banner Enabled" : "Banner Disabled";
    res.status(201).json(success(msg, { banner }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/changeBanners/:id",
    });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json(success("Banners Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/deleteBanners/:id",
    });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.editBanner = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const {
      category,
      subCategory,
      subSubCategory,
      products,
      url,
      text,
      position,
    } = req.body;
    const image = await compressImage(req.files[0], 1, "", 80);
    const appBuffer = await compressImage(req.files[0], 1, "", 60);
    const imageWeb = await uploadFileToS3({
      // eslint-disable-next-line no-undef
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Admins/${Date.now()}.webp`,
      Body: image,
      ACL: "public-read",
      ContentType: "image/webp",
    });
    const imageApp = await uploadFileToS3({
      // eslint-disable-next-line no-undef
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Admins/${Date.now()}.webp`,
      Body: appBuffer,
      ACL: "public-read",
      ContentType: "image/webp",
    });
    setTimeout(async () => {
      deleteFileWithRetry(path.join("./public/", req.files[0].filename));
    }, 5000);
    const banner = await Banner.findById(req.params.id);
    if (category) banner.category = category;
    if (subCategory) banner.subCategory = subCategory;
    if (subSubCategory) banner.subSubCategory = subSubCategory;
    if (url) banner.url = url;
    if (text) banner.text = text;
    if (position) banner.position = position;
    if (products) banner.products = products;
    banner.imageWeb = imageWeb.Location;
    banner.imageApp = imageApp.Location;
    await banner.save();
    res.status(201).json(success("Success", { banner }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/editBanners/:id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getUserBanner = async (req, res) => {
  try {
    console.log(req.body);
    // const { position } = req.body;
    // if (!position) {
    //   return res
    //     .status(201)
    //     .json(error("Please provide position", res.statusCode));
    // }
    // if (!["Top", "Offer"].includes(position)) {
    //   return res.status(201).json(error("Invalid position", res.statusCode));
    // }
    const banners = await Banner.aggregate([
      {
        $facet: {
          top: [
            {
              $match: { status: true, position: "Top" },
            },
          ],
          offer: [
            {
              $match: { status: true, position: "Offer" },
            },
          ],
        },
      },
      // { $sort: { position: -1 } },
    ]);
    res
      .status(201)
      .json(success("Success", { banners: banners[0] }, res.statusCode));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};
