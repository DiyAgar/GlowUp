const { error, success } = require("common/apiResponse/apiResponse");
const Category = require("../models/categorySchema");
const SubCategory = require("../models/subCategorySchema");
const {
  deleteFileWithRetry,
  uploadFileToS3,
  compressImage,
} = require("common/s3/s3Uploads");
const Error = require("common/models/errorSchema");
const path = require("path");
const { getText } = require("common/language/lang");

exports.addCategory = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const { name_en, name_ar } = req.body;
    if (!name_en) {
      return res.status(200).json(error("Please provide name", res.statusCode));
    }
    const verify = await Category.findOne({ name_en: name_en?.trim() });
    if (verify) {
      return res
        .status(201)
        .json(error("Category name already stored", res.statusCode));
    }
    if (!req.files?.length) {
      return res
        .status(201)
        .json(error("Please provide image", res.statusCode));
    }
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
    setTimeout(async () => {
      deleteFileWithRetry(path.join("./public/", req.files[0].filename));
    }, 5000);
    const category = await Category.create({
      name_en: name_en?.trim(),
      name_ar: name_ar?.trim(),
      image: images.Location,
    });
    res
      .status(200)
      .json(success("Category Added", { category }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/addCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { search, isTop } = req.body;
    const categories = await Category.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          isDeleted: false,
          $and: [
            search ? { name_en: { $regex: search.trim(), $options: "i" } } : {},
            // search
            //   ? { description_en: { $regex: search.trim(), $options: "i" } }
            //   : {},
            isTop ? { isTop: true } : {},
          ],
        },
      },
    ]);
    res.status(200).json(success("Categories", { categories }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/getCategories",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.editCategory = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const { name_en, name_ar } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(206).json(error("Invalid CategoryId", res.statusCode));
    }
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
      category.image = filepath.Location;
      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", req.files[0].filename));
      }, 5000);
    }
    if (name_en?.trim()) category.name_en = name_en?.trim();
    if (name_ar?.trim()) category.name_ar = name_ar?.trim();
    await category.save();
    res
      .status(200)
      .json(success("Category Edited", { category }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/editCategories/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.viewCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.status(200).json(success("Category", { category }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/viewCategories/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteCategory = async (req, res) => {
  try {

    const categoryId = req.params.id;
    const linkedSubCategories = await SubCategory.findOne({
      category: categoryId,
      isDeleted: false, 
    });

    if (linkedSubCategories) {
      return res.status(400).json(error("Cannot delete category. It is linked to subcategories.", res.statusCode));
    }

    await Category.findByIdAndUpdate(categoryId, { isDeleted: true });
    res.status(200).json(success("Category Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/deleteCategories/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.changeCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select("status");
    category.status = !category.status;
    await category.save();
    const msg = category.status ? "Category Enabled" : "Category Disabled";
    res.status(201).json(success(msg, { category }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/categoryStatus/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.categoryDropdown = async (req, res) => {
  try {
    const category = await Category.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .select(["name_en", "name_ar"]);
    res.status(200).json(success("Categories", { category }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/allCategory",
    });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { isTop } = req.body;
    console.log(req.body);
    const categories = await Category.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          status: true,
          isDeleted: false,
          $and: [isTop ? { isTop: true } : {}],
        },
      },
      {
        $lookup: {
          localField: "_id",
          foreignField: "category",
          from: "subcategories",
          as: "subcategory",
          pipeline: [
            { $match: { status: true, isDeleted: false } },
            { $project: { _id: 1 } },
          ],
        },
      },
      {
        $lookup: {
          localField: "_id",
          foreignField: "category",
          from: "inventories",
          as: "inventory",
          pipeline: [{ $project: { name_en: 1 } }],
        },
      },
      { $set: { hasProduct: { $size: "$inventory" } } },
      { $unset: "inventory" },
      { $match: { hasProduct: { $gt: 0 } } },
      {
        $project: {
          name_en: 1,
          name_ar: 1,
          isTop: 1,
          image: 1,
          hasProduct: 1,
          subCategories: { $size: "$subcategory" },
        },
      },
    ]);
    res.status(200).json(success("Categories", { categories }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/get-categories",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};
