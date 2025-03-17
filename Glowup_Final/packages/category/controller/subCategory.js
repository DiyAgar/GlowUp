const {
  compressImage,
  uploadFileToS3,
  deleteFileWithRetry,
} = require("common/s3/s3Uploads");
const SubCategory = require("../models/subCategorySchema");
const Attribute = require("../models/attributesSchema");
const path = require("path");
const Category = require("../models/categorySchema");
const { error, success } = require("common/apiResponse/apiResponse");
const Error = require("common/models/errorSchema");
const { default: mongoose } = require("mongoose");
const { getText } = require("common/language/lang");

function isArray(input) {
  try {
    return Array.isArray(JSON.parse(input));
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return false;
  }
}
exports.addSubCategory = async (req, res) => {
  try {
    const { name_en, name_ar, category } = req.body;
    if (!name_en) {
      return res.status(200).json(error("Please provide name", res.statusCode));
    }
    if (!req.files?.length) {
      return res
        .status(200)
        .json(error("Please provide image", res.statusCode));
    }
    if (!category) {
      return res
        .status(200)
        .json(error("Please provide category", res.statusCode));
    }
    // const categoryId = await Category.findById(category);
    if (!isArray(category)) {
      return res.status(200).json(error("Invalid category", res.statusCode));
    }
    const verify = await SubCategory.findOne({ name_en: name_en?.trim() });
    if (verify) {
      return res
        .status(201)
        .json(error("Sub category name already stored", res.statusCode));
    }
    const image = await compressImage(req.files[0], 1, "", 80);
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
    const subCategory = await SubCategory.create({
      name_en: name_en?.trim(),
      name_ar: name_ar?.trim(),
      image: images.Location,
      category: JSON.parse(category),
    });
    res
      .status(200)
      .json(success("SubCategory Added", { subCategory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/addSubCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const { search, category, page = 1, pageSize = 10 } = req.body;

    const subCategory = await SubCategory.aggregate([
      {
        $match: {
          isDeleted: false,
          $or: [{ name_en: { $regex: search.trim(), $options: "i" } }],
          $and: [
            category
              ? { category: { $in: new mongoose.Types.ObjectId(category) } }
              : {},
          ],
        },
      },
      {
        $sort: {createdAt: -1}
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          subCategory: [
            { $skip: +pageSize * (+page - 1) },
            { $limit: +pageSize },
            {
              $lookup: {
                localField: "category",
                foreignField: "_id",
                from: "categories",
                as: "category",
                pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
              },
            },
            // {
            //   $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
            // },
          ],
        },
      },
    ]);
    const total = subCategory[0].metadata.length
      ? subCategory[0].metadata[0].total
      : 0;
    res.status(200).json(
      success(
        "SubCategories",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          subCategory: +total ? subCategory[0].subCategory : [],
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/getSubCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.viewSubCategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id).populate(
      "category"
    );
    res
      .status(200)
      .json(success("SubCategory", { subcategory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/viewSubCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.editSubCategory = async (req, res) => {
  try {
    const { name_en, name_ar, category } = req.body;
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return res
        .status(500)
        .json(error("Invalid Sub categoryId", res.statusCode));
    }
    if (name_en) {
      subCategory.name_en = name_en;
    }
    if (name_ar) {
      subCategory.name_ar = name_ar;
    }
    if (category) {
      // const categoryId = await Category.findById(category);
      // if (!categoryId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid categoryId", res.statusCode));
      // }
      subCategory.category = JSON.parse(category);
    }
    if (req.files?.length) {
      const image = await compressImage(req.files[0], 1, "", 80);
      const filepath = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: image,
        ACL: "public-read",
        ContentType: "image/webp",
      });
      subCategory.image = filepath.Location;
      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", req.files[0].filename));
      }, 5000);
    }
    await subCategory.save();
    res
      .status(200)
      .json(success("SubCategory Edited", { subCategory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/editSubCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.changeSubCategoryStatus = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).select(
      "status"
    );
    if (!subCategory) {
      return res
        .status(500)
        .json(error("Invalid Sub categoryId", res.statusCode));
    }
    subCategory.status = !subCategory.status;
    await subCategory.save();
    const msg = subCategory.status
      ? "SubCategory Enabled"
      : "SubCategory Disabled";
    res.status(201).json(success(msg, { subCategory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/changeSubCategoryStatus",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
        const categoryId = req.params.id;
        const linkedAttribute = await Attribute.findOne({
          subCategory: categoryId,
          isDeleted: false, 
        });
    
        if (linkedAttribute) {
          return res.status(400).json(error("Cannot delete Sub-category. It is linked to attributes.", res.statusCode));
        }
    await SubCategory.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json(success("Sub Category Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/deleteSubCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.subCategoryDropdown = async (req, res) => {
  try {
    const { category = [] } = req.body;
    if (!category?.length) {
      return res
        .status(206)
        .json(error("Please provide category", res.statusCode));
    }
    const subCategory = await SubCategory.find({
      // status: true,
      isDeleted: false,
      category: { $in: category },
    }).select(["name_en", "name_ar"]);
    res
      .status(200)
      .json(success("Sub Categories ", { subCategory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/allSubCategory/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getAllSubCategories = async (req, res) => {
  try {
    const { category } = req.body;
    console.log(req.body);
    if (!category) {
      return res
        .status(206)
        .json(error("Please provide category", res.statusCode));
    }
    const subcategories = await SubCategory.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          isDeleted: false,
          status: true,
          category: {
            $elemMatch: { $eq: new mongoose.Types.ObjectId(category) },
          },
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
        $lookup: {
          localField: "_id",
          foreignField: "subCategory",
          from: "inventories",
          as: "inventory",
          pipeline: [{ $project: { name_en: 1 } }],
        },
      },
      { $set: { hasProduct: { $size: "$inventory" } } },
      { $unset: "inventory" },
      { $match: { hasProduct: { $gt: 0 } } },
      // { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          localField: "_id",
          foreignField: "subCategory",
          from: "subsubcategories",
          as: "subsubcategory",
          pipeline: [
            { $match: { status: true, isDeleted: false } },
            { $project: { _id: 1 } },
          ],
        },
      },
      {
        $project: {
          name_en: 1,
          name_ar: 1,
          image: 1,
          category: 1,
          hasProduct: 1,
          subSubCategories: { $size: "$subsubcategory" },
        },
      },
    ]);
    res
      .status(200)
      .json(success("Sub Categories", { subcategories }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/getAllSubCategories",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};


exports.getSubCategoriesList = async (req, res) => {
  try {
   
    const subcategories = await SubCategory.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          isDeleted: false,
          status: true,
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
        $lookup: {
          localField: "_id",
          foreignField: "subCategory",
          from: "inventories",
          as: "inventory",
          pipeline: [{ $project: { name_en: 1 } }],
        },
      },
      { $set: { hasProduct: { $size: "$inventory" } } },
      { $unset: "inventory" },
      { $match: { 
        hasProduct: { $gt: 0 } } },
      {
        $lookup: {
          localField: "_id",
          foreignField: "subCategory",
          from: "subsubcategories",
          as: "subsubcategory",
          pipeline: [
            { $match: { status: true, isDeleted: false } },
            { $project: { _id: 1 } },
          ],
        },
      },
      {
        $project: {
          name_en: 1,
          name_ar: 1,
          image: 1,
          category: 1,
          hasProduct: 1,
          subSubCategories: { $size: "$subsubcategory" },
        },
      },
    ]);
    res
      .status(200)
      .json(success("All Subcategories", { subcategories }, res.statusCode));
  } catch (err) {
    console.error(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/getAllSubCategories",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};
