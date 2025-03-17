const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
//const Category = require("../../category/models/category");
//const SubCategory = require("../../category/models/subCategory");
//const SubSubCategory = require("../../category/models/subSubCategory");
//const Inventory = require("../../inventory/models/inventory");
//const Campaign=require("../models/campaignSchema");
const Affiliates = require("../../../common/models/affiliateSchema");
const { default: mongoose } = require("mongoose");

exports.addCampaign = async (req, res) => {
  try {
    console.log(req.body);
    const {
      category,
      subCategory,
      subSubCategory,
      products,
      name_en,
      name_ar,
      affiliates,
      startDate,
      endDate,
    } = req.body;
    if (category) {
      const categoryId = await Category.findById(category);
      if (!categoryId) {
        return res
          .status(200)
          .json(error(getText("CATEGORY", req.language), res.statusCode));
      }
    }
    if (subCategory) {
      const subCategoryId = await SubCategory.findById(subCategory);
      if (!subCategoryId) {
        return res
          .status(200)
          .json(error(getText("SUBCATEGORY", req.language), res.statusCode));
      }
    }
    if (subSubCategory) {
      const subSubCategoryId = await SubSubCategory.findById(subSubCategory);
      if (!subSubCategoryId) {
        return res
          .status(200)
          .json(error(getText("SUBSUBCATEGORY", req.language), res.statusCode));
      }
    }
    //   if (products?.trim()) {
    //   if (JSON.parse(products?.trim()).length) {
    const productId = await Inventory.findById(products);
    if (!productId) {
      return res
        .status(200)
        .json(error(getText("PRODUCTS", req.language), res.statusCode));
    }
    //  }
    //   }

    const campaign = await Campaign.create({
      name_en: name_en,
      name_ar: name_ar,
      category: category,
      subCategory: subCategory,
      subSubCategory: subSubCategory,
      products: products,
      startDate: startDate,
      endDate: endDate,
      affiliates: affiliates,
    });
    res.status(201).json(success("Success", { campaign }, res.statusCode));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const { search, category, page = 1, pageSize = 10 } = req.body;
    const query = {
      $or: [{ "category.name_en": { $regex: search.trim(), $options: "i" } }],
    };
    const campaign = await Campaign.aggregate([
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
        $lookup: {
          localField: "subCategory",
          foreignField: "_id",
          from: "subcategories",
          as: "subCategory",
        },
      },
      {
        $lookup: {
          localField: "subSubCategory",
          foreignField: "_id",
          from: "subsubcategories",
          as: "subSubCategory",
        },
      },
      {
        $lookup: {
          localField: "products",
          foreignField: "_id",
          from: "inventories",
          as: "products",
        },
      },
      {
        $match: query,
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          campaigns: [
            { $skip: +pageSize * (+page - 1) },
            { $limit: +pageSize },
          ],
        },
      },
    ]).sort({ createdAt: -1 });
    const total = campaign[0].metadata.length
      ? campaign[0].metadata[0].total
      : 0;
    res.status(200).json(
      success(
        "Banners",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          campaign: +total ? campaign[0].campaigns : [],
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

exports.viewCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
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
        },
      },
      {
        $lookup: {
          localField: "subSubCategory",
          foreignField: "_id",
          from: "subsubcategories",
          as: "subSubCategory",
        },
      },
      {
        $lookup: {
          localField: "products",
          foreignField: "_id",
          from: "inventories",
          as: "products",
        },
      },
    ]);

    res.status(200).json(
      success(
        "Campaign",
        {
          campaign,
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
    //     route: "platform/getsBanners",
    //   });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.status(200).json(success("Campaign Deleted", {}, res.statusCode));
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

exports.editCampaign = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      subSubCategory,
      products,
      name_en,
      name_ar,
      affiliates,
      startDate,
      endDate,
    } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (category) campaign.category = category;
    if (subCategory) campaign.subCategory = subCategory;
    if (subSubCategory) campaign.subSubCategory = subSubCategory;
    if (products) campaign.products = products;
    if (name_en) campaign.name_en = name_en;
    if (name_ar) campaign.name_ar = name_ar;
    if (affiliates) campaign.affiliates = affiliates;
    if (startDate) campaign.startDate = startDate;
    if (endDate) campaign.endDate = endDate;

    await campaign.save();
    res
      .status(200)
      .json(success("Updated Successfully", { campaign }, res.statusCode));
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

exports.getAffiliates = async (req, res) => {
  try {
    const affiliates = await Affiliates.find({
      verfification: "Approved",
    }).select(["_id", "firstName"]);
    res.status(200).json(
      success(
        "affiliates list successfully",
        {
          affiliates,
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
    //     route: "platform/getsBanners",
    //   });
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};
