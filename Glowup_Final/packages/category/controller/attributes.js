const { success, error } = require("common/apiResponse/apiResponse");
const Attribute = require("../models/attributesSchema");
const Value = require("../models/valuesSchema");
const Category = require("../models/categorySchema");
const SubCategory = require("../models/subCategorySchema");
const SubSubCategory = require("../models/subSubCategorySchema");
const Error = require("common/models/errorSchema");

exports.addAttribute = async (req, res) => {
  try {
    const { name_en, name_ar, category, subCategory, subSubCategory } =
      req.body;
    if (!name_en) {
      return res
        .status(200)
        .json(error("Please provide english name", res.statusCode));
    }
    if (!category) {
      return res
        .status(200)
        .json(error("Please provide category", res.statusCode));
    }
    // if (!subcategory) {
    //   return res
    //     .status(200)
    //     .json(error("Please provide category", res.statusCode));
    // }
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
    // if (subSubCategory) {
    //   const subSubCategoryId = await SubSubCategory.findById(subSubCategory);
    //   if (!subSubCategoryId) {
    //     return res
    //       .status(200)
    //       .json(error("Invalid sub sub categoryId", res.statusCode));
    //   }
    // }
    const verify = await Attribute.findOne({ name_en: name_en?.trim() });
    if (verify) {
      return res
        .status(201)
        .json(error("Attributes name already stored", res.statusCode));
    }
    let query = { name_en: name_en?.trim(), name_ar: name_ar?.trim() };
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (subSubCategory) query.subSubCategory = subSubCategory;
    const attributes = await Attribute.create(query);
    res
      .status(200)
      .json(success("Attribute added", { attributes }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/addAttribute",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getAttributes = async (req, res) => {
  try {
    const { search, category, page = 1, pageSize = 10 } = req.body;
    //console.log("body", req.body);
    //console.log("attributes", await Attribute.find().select('name_en'))
    const attributes = await Attribute.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          isDeleted: false,
          ...(search ? { name_en: { $regex: String(search), $options: "i" } } : {}),
          ...(category
            ? { category: { $in: [new mongoose.Types.ObjectId(category)] } }
            : {}),
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          attributes: [
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
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                localField: "subCategory",
                foreignField: "_id",
                from: "subcategories",
                as: "subCategory",
                pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
              },
            },
            { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                localField: "subSubCategory",
                foreignField: "_id",
                from: "subsubcategories",
                as: "subSubCategory",
                pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
              },
            },
            { $unwind: { path: "$subSubCategory", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
    ]);
    const total = attributes[0].metadata.length
      ? attributes[0].metadata[0].total
      : 0;
    res.status(200).json(
      success(
        "Attributes",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          subCategory: +total ? attributes[0].attributes : [],
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
      route: "category/getAttributes",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
exports.editAttribute = async (req, res) => {
  try {
    const { name_en, name_ar, category, subCategory, subSubCategory } =
      req.body;
    const attributes = await Attribute.findById(req.params.id);
    if (!attributes) {
      return res.status(206).json(error("Invalid AttributeId", res.statusCode));
    }
    if (name_en) {
      attributes.name_en = name_en;
    }
    if (name_ar) {
      attributes.name_ar = name_ar;
    }
    if (category) {
      // const categoryId = await Category.findById(category);
      // if (!categoryId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid categoryId", res.statusCode));
      // }
      attributes.category = category;
    }
    if (subCategory) {
      // const subCategoryId = await SubCategory.findById(subCategory);
      // if (!subCategoryId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid sub categoryId", res.statusCode));
      // }
      attributes.subCategory = subCategory;
    }
    if (subSubCategory) {
      // const subSubCategoryId = await SubSubCategory.findById(subSubCategory);
      // if (!subSubCategoryId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid sub sub categoryId", res.statusCode));
      // }
      attributes.subSubCategory = subSubCategory;
    }
    await attributes.save();
    res
      .status(200)
      .json(
        success("Attributes Edited", { attribute: attributes }, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/ediAttributes/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
exports.viewAttribute = async (req, res) => {
  try {
    const attributes = await Attribute.findById(req.params.id)
      .populate([
        { path: "category", select: "name_en name_ar" },
        { path: "subCategory", select: "name_en name_ar" },
        { path: "subSubCategory", select: "name_en name_ar" },
      ])
      .lean();

    res.status(200).json(success("Attributes", { attributes }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/viewAttributes/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteAttribute = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const linkedValue = await Value.findOne({
      attribute: categoryId,
      isDeleted: false, 
    });

    if (linkedValue) {
      return res.status(400).json(error("Cannot delete Attribute. It is linked to values.", res.statusCode));
    }
    await Attribute.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json(success("Attribute Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/deleteAttribute/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.changeAttributeStatus = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id).select("status");
    if (!attribute) {
      return res.status(206).json(error("Invalid AttributeId", res.statusCode));
    }
    attribute.status = !attribute.status;
    await attribute.save();
    const msg = attribute.status ? "Attribute Enabled" : "Attribute Disabled";
    res.status(201).json(success(msg, { attribute }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/attributeStatus/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.attributeDropdown = async (req, res) => {
  try {
    console.log(req.body);
    const { category, subCategory, subSubCategory } = req.body;
    if (!category?.length && !subCategory?.length && subSubCategory?.length) {
      return res
        .status(206)
        .json(
          error(
            "Please provide category, sub category or sub sub category!",
            res.statusCode,
          ),
        );
    }
    const attributes = await Attribute.find({
      isDeleted: false,
      $or: [
        category ? { category: { $in: category } } : {},
        subCategory ? { subCategory: { $in: subCategory } } : {},
        subSubCategory ? { subSubCategory: { $in: subSubCategory } } : {},
      ],
    })
      .sort({ createdAt: -1 })
      .select(["name_en", "name_ar"]);

    res.status(200).json(success("Attributes", { attributes }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/attributeDropdown",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
