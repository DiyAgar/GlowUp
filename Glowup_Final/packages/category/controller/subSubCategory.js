const path = require("path");
const Category = require("../models/categorySchema");
const SubCategory = require("../models/subCategorySchema");
const SubSubCategory = require("../models/subSubCategorySchema");
const {
  compressImage,
  uploadFileToS3,
  deleteFileWithRetry,
} = require("common/s3/s3Uploads");
const { success, error } = require("common/apiResponse/apiResponse");
const Error = require("common/models/errorSchema");
const { default: mongoose } = require("mongoose");
const { getText } = require("common/language/lang");

exports.addSubSubCategory = async (req, res) => {
  try {
    const { name_en, name_ar, category, subCategory } = req.body;
    if (!name_en) {
      return res.status(200).json(error("Please provide name", res.statusCode));
    }
    if (!category) {
      return res
        .status(200)
        .json(error("Please provide category", res.statusCode));
    }
    // const categoryId = await Category.findById(category);
    // if (!categoryId) {
    //   return res.status(200).json(error("Invalid categoryId", res.statusCode));
    // }
    // if (subCategory) {
    //   const subCategoryId = await SubCategory.findById(subCategory);
    //   if (!subCategoryId) {
    //     return res
    //       .status(200)
    //       .json(error("Invalid sub categoryId", res.statusCode));
    //   }
    // }
    const verify = await SubSubCategory.findOne({ name_en: name_en?.trim() });
    if (verify) {
      return res
        .status(201)
        .json(error("Sub category name already stored", res.statusCode));
    }
    let image = "";
    if (req.files.length) {
      const buffer = await compressImage(req.files[0], 1, "", 80);
      // images.push(image);
      const filepath = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: buffer,
        ACL: "public-read",
        ContentType: "image/webp",
      });
      image = filepath.Location;
      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", req.files[0].filename));
      }, 5000);
    }
    let query = {
      name_en: name_en?.trim(),
      name_ar: name_ar?.trim(),
      image: image,
      category: JSON.parse(category),
    };
    if (subCategory) query.subCategory = JSON.parse(subCategory);
    const subSubCategory = await SubSubCategory.create(query);
    res
      .status(200)
      .json(
        success("Sub Sub Category Added", { subSubCategory }, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/addSubSubCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getSubSubCategories = async (req, res) => {
  try {
    const { search, category, subCategory, page = 1, pageSize = 10 } = req.body;

    const subSubCategory = await SubSubCategory.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          isDeleted: false,
          $or: [search ? { name_en: { $regex: search, $options: "i" } } : {}],
          $and: [
            category
              ? {
                  category: {
                    $elemMatch: { $eq: new mongoose.Types.ObjectId(category) },
                  },
                }
              : {},
          ],
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          subSubCategory: [
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
            {
              $lookup: {
                localField: "subCategory",
                foreignField: "_id",
                from: "subcategories",
                as: "subCategory",
                pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
              },
            },
            // {
            //   $unwind: {
            //     path: "$subCategory",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
          ],
        },
      },
    ]);
    const total = subSubCategory[0].metadata.length
      ? subSubCategory[0].metadata[0].total
      : 0;
    res.status(200).json(
      success(
        "SubSubCategories",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          subCategory: subSubCategory[0].subSubCategory,
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
      route: "category/getSubSubCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.viewSubSubCategory = async (req, res) => {
  try {
    const subSubcategory = await SubSubCategory.findById(
      req.params.id,
    ).populate(["category", "subCategory"]);
    res
      .status(200)
      .json(success("SubCategory", { subSubcategory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/viewSubSubCategory/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.editSubSubCategory = async (req, res) => {
  try {
    const { name_en, name_ar, category, subCategory } = req.body;
    const subSubCategory = await SubSubCategory.findById(req.params.id);
    if (!subSubCategory) {
      return res
        .status(206)
        .json(error("Invalid Sub sub category id", res.statusCode));
    }
    if (name_en) {
      subSubCategory.name_en = name_en;
    }
    if (name_ar) {
      subSubCategory.name_ar = name_ar;
    }
    if (category) {
      // const categoryId = await Category.findById(category);
      // if (!categoryId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid categoryId", res.statusCode));
      // }
      subSubCategory.category = JSON.parse(category);
    }
    if (subCategory) {
      // const subCategoryId = await SubCategory.findById(subCategory);
      // if (!subCategoryId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid sub categoryId", res.statusCode));
      // }
      subSubCategory.subCategory = JSON.parse(subCategory);
    }
    if (req.files.length) {
      const buffer = await compressImage(req.files[0], 1, "", 80);
      // images.push(image);
      const filepath = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: buffer,
        ACL: "public-read",
        ContentType: "image/webp",
      });
      subSubCategory.image = filepath.Location;
      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", req.files[0].filename));
      }, 5000);
    }
    await subSubCategory.save();
    res
      .status(200)
      .json(
        success("Sub Sub Category Edited", { subSubCategory }, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/editSubSubCategory/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.changeSubSubCategoryStatus = async (req, res) => {
  try {
    const subSubCategory = await SubSubCategory.findById(req.params.id).select(
      "status",
    );
    if (!subSubCategory) {
      return res
        .status(206)
        .json(error("Invalid Sub sub category id", res.statusCode));
    }
    subSubCategory.status = !subSubCategory.status;
    await subSubCategory.save();
    const msg = subSubCategory.status
      ? "Sub Sub Category Enabled"
      : "Sub Sub Category Disabled";
    res.status(201).json(success(msg, { subSubCategory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/statusSubSubCategory/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteSubSubCategory = async (req, res) => {
  try {
    await SubSubCategory.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res
      .status(200)
      .json(success("Sub Sub Category Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/deleteSubSubCategory/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.subSubCategoryDropdown = async (req, res) => {
  try {
    const { category, subCategory } = req.body;
    console.log(req.body);
    if (!category?.length && !subCategory?.length) {
      return res
        .status(206)
        .json(
          error("Please provide category or sub category!", res.statusCode),
        );
    }
    let subCategories = [];
    if (subCategory?.length) {
      subCategories = subCategory.map((item) => {
        return new mongoose.Types.ObjectId(item);
      });
    }
    let categories = [];
    if (category?.length) {
      categories = category.map((item) => {
        return new mongoose.Types.ObjectId(item);
      });
    }
    console.log(subCategories, categories);
    const subSubCategory = await SubSubCategory.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          isDeleted: false,
          $and: [
            categories?.length ? { category: { $in: categories } } : {},
            subCategories?.length
              ? { subCategory: { $in: subCategories } }
              : {},
          ],
        },
      },
      {
        $project: { name_en: 1, name_ar: 1 },
      },
    ]);
    res
      .status(200)
      .json(
        success(
          "SubSubCategories dropdown",
          { subSubCategory },
          res.statusCode,
        ),
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/subSubCategoryDropdown",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getAllSubSubCategories = async (req, res) => {
  try {
    const { subcategory } = req.body;
    console.log(req.body);
    if (!subcategory) {
      return res
        .status(206)
        .json(error("Please provide sub category", res.statusCode));
    }
    const subsubcategories = await SubSubCategory.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          status: true,
          isDeleted: false,
          subCategory: {
            $elemMatch: {
              $eq: new mongoose.Types.ObjectId(subcategory),
            },
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
      // { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          localField: "subCategory",
          foreignField: "_id",
          from: "subcategories",
          as: "subCategory",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      // { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
      // {
      //   $project: {
      //     name_en: 1,
      //     name_ar: 1,
      // image: 1,
      //     subSubCategories: { $size: "$subsubcategory" },
      //   },
      // },
    ]);
    res
      .status(200)
      .json(
        success("Sub Sub Categories", { subsubcategories }, res.statusCode),
      );
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

exports.getSubSubCategoriesList = async (req, res) => {
  try {
    const subSubCategories = await SubSubCategory.aggregate([
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
          localField: "subCategory",
          foreignField: "_id",
          from: "subcategories",
          as: "subCategory",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $lookup: {
          localField: "subSubCategory",
          foreignField: "_id",
          from: "subSubcategories",
          as: "subSubCategory",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $lookup: {
          localField: "_id",
          foreignField: "subSubCategory",
          from: "inventories",
          as: "inventory",
          pipeline: [{ $project: { name_en: 1 } }],
        },
      },
      { $set: { hasProduct: { $size: "$inventory" } } },
      { $unset: "inventory" },
      {
        $match: {
          hasProduct: { $gt: 0 },
        },
      },
      {
        $project: {
          name_en: 1,
          name_ar: 1,
          image: 1,
          category: 1,
          subCategory: 1,
          hasProduct: 1,
        },
      },
    ]);

    res
      .status(200)
      .json(success("All SubSubCategories", { subSubCategories }, res.statusCode));
  } catch (err) {
    console.error(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/getAllSubSubCategories",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

