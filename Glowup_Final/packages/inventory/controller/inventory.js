const { error, success } = require("common/apiResponse/apiResponse");
//const { getText } = require("common/language/lang");
const Inventory = require("../models/inventorySchema");
const Error = require("common/models/errorSchema");
const { default: mongoose } = require("mongoose");
const {
  compressImage,
  uploadFileToS3,
  deleteFileWithRetry,
} = require("common/s3/s3Uploads");
const path = require("path");
const { getText } = require("common/language/lang");
const Category = require("../../category/models/categorySchema");
const SubCategory = require("../../category/models/subCategorySchema");
const SubSubCategory = require("../../category/models/subSubCategorySchema");
const fs = require("fs");
const Varient = require("../models/varientSchema");

exports.uploadProductImage = async (req, res) => {
  try {
    console.log(req.body);
    if (!req.files?.length) {
      return res
        .status(206)
        .json(error("Please provide images!", res.statusCode));
    }
    let imagesWeb = [],
      imagesOg = [];
    imagesApp = [];
    for (const file of req.files) {
      const webBuffer = await compressImage(file, 300);
      const web = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: webBuffer,
        ACL: "public-read",
        ContentType: "image/webp",
      });
      const appBuffer = await compressImage(file, 200);
      const mobile = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: appBuffer,
        ACL: "public-read",
        ContentType: "image/webp",
      });
      let extArray = file.mimetype.split("/");
      let ext = extArray[extArray.length - 1];
      const originals = await uploadFileToS3({
        // eslint-disable-next-line no-undef
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.${ext}`,
        Body: fs.readFileSync(file.path),
        ACL: "public-read",
        ContentType: "image/webp",
      });
      imagesWeb.push(web.Location);
      imagesApp.push(mobile.Location);
      imagesOg.push(originals.Location);
      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", file.filename));
      }, 5000);
    }
    res
      .status(201)
      .json(
        success("Image", { imagesOg, imagesWeb, imagesApp }, res.statusCode)
      );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.addInventory = async (req, res) => {
  try {
    const {
      name_en,
      name_ar,
      description_en,
      description_ar,
      category,
      subCategory,
      subSubCategory,
      price,
      origin,
      isLive,
      currency,
      imagesWeb,
      imagesOg,
      imagesApp,
      varients,
      brand,
      attribute,
      value,
    } = req.body;
    console.log(req.body);
    // console.log(req.files);
    if (!name_en) {
      return res
        .status(200)
        .json(error("Please provide english name", res.statusCode));
    }
    if (!description_en) {
      return res
        .status(201)
        .json(error("Please provide english description", res.statusCode));
    }
    if (!category) {
      return res
        .status(201)
        .json(error("Please provide category", res.statusCode));
    }
    const categoryId = await Category.findById(category);
    if (!categoryId) {
      return res.status(200).json(error("Invalid categoryId", res.statusCode));
    }
    // if (subCategory) {
    //   const subCategoryId = await SubCategory.findById(subCategory);
    //   if (!subCategoryId) {
    //     return res
    //       .status(200)
    //       .json(error("Invalid sub categoryId", res.statusCode));
    //   }
    // }
    // const verify = await SubSubCategory.findById(subSubCategory);
    // if (!verify) {
    //   return res
    //     .status(201)
    //     .json(error("Invalid Sub Sub Category id", res.statusCode));
    // }
    if (!origin) {
      return res
        .status(201)
        .json(error("Please provide product origin", res.statusCode));
    }
    if (!currency) {
      return res
        .status(201)
        .json(error("Please provide currency ", res.statusCode));
    }
    if (!varients?.length) {
      return res
        .status(201)
        .json(error("Please provide vaients ", res.statusCode));
    }
    if (!imagesOg?.length) {
      return res
        .status(201)
        .json(error("Please provide images", res.statusCode));
    }
    let query = {
      name_en: name_en,
      name_ar: name_ar,
      description_en: description_en,
      description_ar: description_ar,
      category: category,
      subCategory: subCategory,
      subSubCategory: subSubCategory,
      // price: +price,
      origin: origin,
      isLive: isLive,
      currency: currency,
      imagesApp: imagesApp,
      imagesWeb: imagesWeb,
      imagesOg: imagesOg,
      // attribute: attribute,
      // value: value,
      hasVarients: varients?.length ? true : false,
    };
    if (brand) query.brand = brand;
    const inventory = new Inventory(query);
    if (inventory.hasVarients && varients?.length) {
      let myVarients = [];
      for (const varient of varients) {
        // if (varient.values?.length) {
        //   varient.values.map((item) => {
        //     myVarients.push({
        //       inventory: inventory._id,
        //       ...varient,
        //       value: item,
        //     });
        //   });
        // } else {
        myVarients.push({
          inventory: inventory._id,
          ...varient,
        });
        // }
      }
      await Varient.create(myVarients);
    }
    await inventory.save();
    // await Promotion.create({ products: inventory._id, type: "Fresh" });
    // await Promotion.create({ products: inventory._id, type: "Trending" });
    // await Promotion.create({ products: inventory._id, type: "TopSeller" });
    // await Promotion.create({ products: inventory._id, type: "Featured" });
    res
      .status(201)
      .json(success("Product created successfully", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
    git;
  }
};

// exports.getInventories = async (req, res) => {
//   try {
//     const { search, year, month, page = 1, pageSize = 10 } = req.body;
//     const inventory = await Inventory.aggregate([
//       {
//         $project: {
//           name_en: 1,
//           name_ar: 1,
//           category: 1,
//           subCategory: 1,
//           subSubCategory: 1,
//           imagesApp: 1,
//           isLive: 1,
//           origin: 1,
//           createdAt: 1,
//           isDeleted: 1,
//           status: 1,
//         },
//       },
//       { $sort: { createdAt: -1 } },
//       {
//         $match: {
//           $or: [search ? { name_en: { $regex: search.trim(), $options: "i" } } : {},],
//           isDeleted: false,
//         },
//       },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           inventories: [
//             { $skip: +pageSize * (+page - 1) },
//             { $limit: +pageSize },
//             {
//               $lookup: {
//                 localField: "category",
//                 foreignField: "_id",
//                 from: "categories",
//                 as: "category",
//                 pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
//               },
//             },
//             {
//               $lookup: {
//                 localField: "subCategory",
//                 foreignField: "_id",
//                 from: "subcategories",
//                 as: "subCategory",
//                 pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
//               },
//             },
//             {
//               $lookup: {
//                 localField: "subSubCategory",
//                 foreignField: "_id",
//                 from: "subsubcategories",
//                 as: "subSubCategory",
//                 pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
//               },
//             },
//             // {
//             //   $lookup: {
//             //     localField: "_id",
//             //     foreignField: "inventory",
//             //     from: "varients",
//             //     as: "varients",
//             //   },
//             // },
//           ],
//         },
//       },
//     ]);
//     const total = inventory[0].metadata.length
//       ? inventory[0].metadata[0].total
//       : 0;
//     res.status(200).json(
//       success(
//         "Inventories",
//         {
//           total,
//           totalPage: Math.ceil(+total / +pageSize),
//           page,
//           pageSize,
//           inventory: +total ? inventory[0].inventories : [],
//         },
//         res.statusCode
//       )
//     );
//   } catch (err) {
//     console.log(err);
//     await Error.create({
//       // admin:admin,
//       arrError: err,
//       strError: err,
//       objError: err,
//       route: "inventory/getInventory",
//     });
//     res.status(500).json(error("Internal Server Error", res.statusCode));
//   }
// };

exports.getInventories = async (req, res) => {
  try {
    const {
      search,
      category,
      subCategory,
      subSubCategory,
      brand,
      makeLive,
      page = 1,
      pageSize = 10,
    } = req.body;
//     const count = await Inventory.countDocuments({ isDeleted: false });
// console.log("Total non-deleted inventories:", count);

    const inventory = await Inventory.aggregate([
      {
        $project: {
          name_en: 1,
          name_ar: 1,
          category: 1,
          subCategory: 1,
          subSubCategory: 1,
          imagesApp: 1,
          isLive: 1,
          origin: 1,
          brand: 1,
          createdAt: 1,
          isDeleted: 1,
          status: 1,
          isFeatured: 1,
        },
      },
      {
        $match: {
          isDeleted: false,
          ...(search && { name_en: { $regex: search.trim(), $options: "i" } }),
          ...(makeLive !== undefined && {
            isLive: makeLive === "true" || makeLive === true,
          }),
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
          from: "subsubcategories",
          as: "subSubCategory",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandDetails",
        },
      },
      {
        $addFields: {
          category: {
            $filter: {
              input: "$category",
              as: "cat",
              cond: category
                ? { $eq: ["$$cat._id", new mongoose.Types.ObjectId(category)] }
                : { $ne: ["$$cat", null] },
            },
          },
          subCategory: {
            $filter: {
              input: "$subCategory",
              as: "subCat",
              cond: subCategory
                ? {
                    $eq: [
                      "$$subCat._id",
                      new mongoose.Types.ObjectId(subCategory),
                    ],
                  }
                : { $ne: ["$$subCat", null] },
            },
          },
          subSubCategory: {
            $filter: {
              input: "$subSubCategory",
              as: "subSubCat",
              cond: subSubCategory
                ? {
                    $eq: [
                      "$$subSubCat._id",
                      new mongoose.Types.ObjectId(subSubCategory),
                    ],
                  }
                : { $ne: ["$$subSubCat", null] },
            },
          },
        },
      },
      {
        $match: {
          ...(category && { "category.0": { $exists: true } }),
          ...(subCategory && { "subCategory.0": { $exists: true } }),
          ...(subSubCategory && { "subSubCategory.0": { $exists: true } }),
          ...(brand && {
            "brandDetails._id": new mongoose.Types.ObjectId(brand),
          }),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          inventories: [
            { $skip: +pageSize * (+page - 1) },
            { $limit: +pageSize },
          ],
        },
      },
    ]);

    const total = inventory[0].metadata.length
      ? inventory[0].metadata[0].total
      : 0;

    res.status(200).json(
      success(
        "Inventories",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          inventory: +total ? inventory[0].inventories : [],
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.error(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "inventory/getInventory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.viewInventory = async (req, res) => {
  try {
    const inventory = await Inventory.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
          // isDeleted: false,
        },
      },
      {
        $lookup: {
          localField: "category",
          foreignField: "_id",
          from: "categories",
          as: "category",
          pipeline: [
            {
              $project: {
                name_en: 1,
                name_ar: 1,
                image: 1,
              },
            },
          ],
        },
      },
      // { $unwind: "$category" },
      {
        $lookup: {
          localField: "subCategory",
          foreignField: "_id",
          from: "subcategories",
          as: "subCategory",
          pipeline: [
            {
              $project: {
                name_en: 1,
                name_ar: 1,
                image: 1,
              },
            },
          ],
        },
      },
      // { $unwind: "$subCategory" },
      {
        $lookup: {
          localField: "subSubCategory",
          foreignField: "_id",
          from: "subsubcategories",
          as: "subSubCategory",
          pipeline: [
            {
              $project: {
                name_en: 1,
                name_ar: 1,
                image: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          localField: "brand",
          foreignField: "_id",
          from: "brands",
          as: "brand",
          pipeline: [
            {
              $project: {
                name_en: 1,
                name_ar: 1,
                logo: 1,
              },
            },
          ],
        },
      },
      // { $unwind: "$subSubCategory" },
      {
        $lookup: {
          localField: "_id",
          foreignField: "inventory",
          as: "varients",
          from: "varients",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $lookup: {
                localField: "attribute",
                foreignField: "_id",
                from: "attributes",
                as: "attribute",
                pipeline: [
                  {
                    $project: {
                      category: 1,
                      subCategory: 1,
                      subSubCategory: 1,
                      name_en: 1,
                      name_ar: 1,
                    },
                  },
                ],
              },
            },
            // { $unwind: "$attribute" },
            {
              $lookup: {
                localField: "value",
                foreignField: "_id",
                from: "values",
                as: "value",
                pipeline: [
                  {
                    $project: {
                      attribute: 1,
                      name_en: 1,
                      name_ar: 1,
                    },
                  },
                ],
              },
            },
            // { $unwind: "$value" },
            // {
            //   $group: {
            //     _id: "$attribute._id",
            //     values: { $push: "$value" },
            //     attribute: { $first: "$attribute" },
            //     inventory: { $first: "$inventory" },
            //     imagesApp: { $first: "$imagesApp" },
            //     imagesWeb: { $first: "$imagesWeb" },
            //     imagesOrg: { $first: "$imagesOrg" },
            //     price: { $first: "$price" },
            //     discount: { $first: "$discount" },
            //     quantity: { $first: "$quantity" },
            //     status: { $first: "$status" },
            //     isDeleted: { $first: "$isDeleted" },
            //     createdAt: { $first: "$createdAt" },
            //   },
            // },
          ],
        },
      },
    ]);
    res
      .status(200)
      .json(success("Inventory Details", { inventory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "inventory/viewInventory/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { isDeleted: true });
    // await Varient.updateMany(
    //   { inventory: req.params._id },
    //   { isDeleted: true }
    // );
    const varients = await Varient.find({ inventory: req.params.id }).select(
      "_id"
    );
    for (const element of varients) {
      await Varient.findByIdAndUpdate(element, { isDeleted: true });
    }
    res.status(200).json(success("Inventory Deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "inventory/deleteInventory/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.editInventory = async (req, res) => {
  try {
    const {
      name_en,
      name_ar,
      description_en,
      description_ar,
      category,
      subCategory,
      subSubCategory,
      price,
      origin,
      isLive,
      currency,
      attributes,
      values,
      imagesWeb,
      imagesOg,
      imagesApp,
      varients,
      brand,
      deleteImages = [],
      deleteVarient = [],
    } = req.body;
    console.log(req.body);
    const inventory = await Inventory.findById(req.params._id);
    if (!inventory) {
      return res.status(200).json(error("Invalid inventoryId", res.statusCode));
    }
    if (name_en) inventory.name_en = name_en;
    if (name_ar) inventory.name_ar = name_ar;
    if (description_en) inventory.description_en = description_en;
    if (description_ar) inventory.description_ar = description_ar;
    if (brand) inventory.brand = brand;
    if (category) {
      // const categoryId = await Category.findById(category);
      // if (!categoryId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid categoryId", res.statusCode));
      // }
      inventory.category = category;
    }
    if (subCategory) {
      // const subCategoryId = await SubCategory.findById(subCategory);
      // if (!subCategoryId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid sub categoryId", res.statusCode));
      // }
      inventory.subCategory = subCategory;
    }
    if (subSubCategory) {
      // const verify = await SubSubCategory.findById(subSubCategory);
      // if (!verify) {
      //   return res
      //     .status(201)
      //     .json(error("Invalid Sub Sub Category id", res.statusCode));
      // }
      inventory.subSubCategory = subSubCategory;
    }
    if (price) inventory.price = +price;
    if (origin) inventory.origin = origin;
    if (isLive) inventory.isLive = isLive;
    if (currency) inventory.currency = currency;
    if (attributes) inventory.attributes = attributes;
    if (values) inventory.values = values;
    if (imagesApp) inventory.imagesApp = imagesApp;
    if (imagesWeb) inventory.imagesWeb = imagesWeb;
    if (imagesOg) inventory.imagesOg = imagesOg;
    await inventory.save();
    for (const element of deleteVarient) {
      await Varient.findByIdAndUpdate(element, { isDeleted: true });
    }
    if (inventory.hasVarients && varients?.length) {
      for (const varient of varients) {
        const verifyVarient = await Varient.findById(varient?._id);
        if (!verifyVarient) {
          await Varient.create({
            inventory: inventory._id,
            price: +varient.price,
            discount: +varient.discount,
            attribute: varient.attribute,
            value: varient.value,
            imagesOg: varient.imagesOg,
            imagesWeb: varient.imagesWeb,
            imagesApp: varient.imagesApp,
            quantity: +varient.quantity,
          });
        }
        await Varient.findByIdAndUpdate(varient._id, {
          price: +varient.price,
          discount: +varient.discount,
          attribute: varient.attribute,
          value: varient.value,
          imagesOg: varient.imagesOg?.filter(
            (item) => !deleteImages.includes(item)
          ),
          imagesWeb: varient.imagesWeb?.filter(
            (item) => !deleteImages.includes(item)
          ),
          imagesApp: varient.imagesApp?.filter(
            (item) => !deleteImages.includes(item)
          ),
          quantity: +varient.quantity,
        });
      }
    }
    res
      .status(201)
      .json(success("Product updated successfully", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.changeInventoryStatus = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).select("status");
    if (!inventory) {
      return res.status(200).json(error("Invalid inventoryId", res.statusCode));
    }
    inventory.status = !inventory.status;
    await inventory.save();
    const msg = inventory.status ? "Inventory Enabled" : "Inventory Disabled";
    res.status(201).json(success(msg, { inventory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "inventory/inventoryStatus/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.isFeaturedProduct = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).select(
      "isFeatured"
    );
    if (!inventory) {
      return res.status(200).json(error("Invalid inventoryId", res.statusCode));
    }
    inventory.isFeatured = !inventory.isFeatured;
    await inventory.save();
    const msg = inventory.isFeatured
      ? "Inventory added to featured"
      : "Inventory removed from featured";
    res.status(201).json(success(msg, { inventory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "inventory/inventoryStatus/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.isProductLive = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).select("isLive");
    if (!inventory) {
      return res.status(200).json(error("Invalid inventoryId", res.statusCode));
    }
    inventory.isLive = !inventory.isLive;
    await inventory.save();
    const msg = inventory.isLive
      ? "Product is availlable user's side"
      : "Product is not available user's side";
    res.status(201).json(success(msg, { inventory }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "inventory/inventoryStatus/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteVarient = async (req, res) => {
  try {
    await Varient.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json(success("Varient deleted", {}, res.statusCode));
  } catch (err) {
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "inventory/deleteVarients/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.viewVarient = async (req, res) => {
  try {
    const varient = await Varient.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "attributes",
          localField: "attribute",
          foreignField: "_id",
          as: "attributes",
          pipeline: [
            {
              $project: {
                name_en: 1,
                name_ar: 1,
                category: 1,
                subCategory: 1,
                subSubCategory: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "values",
          localField: "value",
          foreignField: "_id",
          as: "values",
          pipeline: [
            {
              $project: {
                name_en: 1,
                name_ar: 1,
                attribute: 1,
              },
            },
          ],
        },
      },
    ]);
    res.status(200).json(success("Success", { varient }, res.statusCode));
  } catch (err) {
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "inventory/viewVarients/:id",
    });
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

// exports.addVarients = async (req, res) => {
//   try {
//     const { price, discount, attributes, inventory, quantity, values } =
//       req.body;
//     if (!price) {
//       return res
//         .status(201)
//         .json(error("Please provide Price", res.statusCode));
//     }
//     if (!quantity) {
//       return res
//         .status(201)
//         .json(error("Please provide discountPrice", res.statusCode));
//     }
//     let imagesWeb = [],
//       imagesApp = [];
//     for (const file of req.files) {
//       const webBuffer = await compressImage(file, 300);
//       const web = await uploadFileToS3({
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `Admins/${Date.now()}.webp`,
//         Body: webBuffer,
//         ACL: "public-read",
//         ContentType: "image/webp",
//       });
//       const appBuffer = await compressImage(file, 200);
//       const mobile = await uploadFileToS3({
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `Admins/${Date.now()}.webp`,
//         Body: appBuffer,
//         ACL: "public-read",
//         ContentType: "image/webp",
//       });
//       imagesWeb.push(web.Location);
//       imagesApp.push(mobile.Location);
//       setTimeout(async () => {
//         deleteFileWithRetry(path.join("./public/", file.filename));
//       }, 5000);
//     }
//     const variant = await Varients.create({
//       price,
//       discount,
//       inventory,
//       imagesApp: imagesApp,
//       imagesWeb: imagesWeb,
//       attributes: JSON.parse(attributes),
//       values: JSON.parse(values),
//       quantity,
//       imagesOrg: imagesApp,
//     });
//     res
//       .status(200)
//       .json(success("Varient added successfully", { variant }, res.statusCode));
//   } catch (err) {
//     console.log(err);
//     await Error.create({
//       // admin:admin,
//       arrError: err,
//       strError: err,
//       objError: err,
//       route: "inventory/addVarients",
//     });
//     res.status(500).json(error("Internal Server Error", res.statusCode));
//   }
// };

// exports.getVarient = async (req, res) => {
//   try {
//     const varient = await Varients.aggregate([
//       {
//         $match: {
//           inventory: new mongoose.Types.ObjectId(req.params.id),
//           isDeleted: false,
//         },
//       },
//       {
//         $lookup: {
//           from: "attributes",
//           localField: "attributes",
//           foreignField: "_id",
//           as: "attributes",
//         },
//       },
//       {
//         $lookup: {
//           from: "values",
//           localField: "values",
//           foreignField: "_id",
//           as: "values",
//         },
//       },
//     ]).sort({ createdAt: -1 });
//     res.status(200).json(success("Success", { varient }, res.statusCode));
//   } catch (err) {
//     console.log(err);
//     await Error.create({
//       // admin:admin,
//       arrError: err,
//       strError: err,
//       objError: err,
//       route: "inventory/getVarients/:id",
//     });
//     res.status(500).json(error("Internal Server Error", res.statusCode));
//   }
// };

exports.editVarients = async (req, res) => {
  try {
    const {
      price,
      discount,
      attribute,
      value,
      quantity,
      deleteImage = [],
      imagesWeb,
      imagesApp,
      imagesOg,
    } = req.body;
    console.log(req.body);
    console.log(req.files);
    const varient = await Varient.findById(req.params.id);
    if (price) varient.price = price;
    if (discount) varient.discount = discount;
    if (quantity) varient.quantity = quantity;
    if (attribute) {
      const attributes = Array.isArray(attribute)
        ? attribute
        : JSON.parse(attribute);
      if (attributes.length) {
        varient.attribute = attributes;
      }
    }
    if (value) {
      const values = Array.isArray(value) ? value : JSON.parse(value);
      if (values.length) {
        varient.value = values;
      }
    }
    // if (deleteImage?.length) {
    //   varient.imagesApp = varient.imagesApp.map((item) => {
    //     if (!deleteImage.includes(item)) return item;
    //   });
    //   varient.imagesWeb = varient.imagesApp.map((item) => {
    //     if (!deleteImage.includes(item)) return item;
    //   });
    //   varient.imagesOg = varient.imagesApp.map((item) => {
    //     if (!deleteImage.includes(item)) return item;
    //   });
    // }
    if (imagesApp?.length) varient.imagesApp = imagesApp;
    if (imagesWeb?.length) varient.imagesWeb = imagesWeb;
    if (imagesWeb?.length) varient.imagesWeb = imagesWeb;
    // let imagesWeb = [],
    //   imagesOg = [];
    // imagesApp = [];
    // if (deleteImage.length) {
    //   imagesWeb = varient.imagesWeb.map((item) => {
    //     if (!deleteImage.includes(item)) return item;
    //     return;
    //   });
    //   imagesApp = varient.imagesApp.map((item) => {
    //     if (!deleteImage.includes(item)) return item;
    //     return;
    //   });
    //   imagesOg = varient.imagesOg.map((item) => {
    //     if (!deleteImage.includes(item)) return item;
    //     return;
    //   });
    // }
    // if (req.files?.length) {
    //   for (const file of req.files) {
    //     const webBuffer = await compressImage(file, 300);
    //     const web = await uploadFileToS3({
    //       // eslint-disable-next-line no-undef
    //       Bucket: process.env.S3_BUCKET_NAME,
    //       Key: `Admins/${Date.now()}.webp`,
    //       Body: webBuffer,
    //       ACL: "public-read",
    //       ContentType: "image/webp",
    //     });
    //     const appBuffer = await compressImage(file, 200);
    //     const mobile = await uploadFileToS3({
    //       // eslint-disable-next-line no-undef
    //       Bucket: process.env.S3_BUCKET_NAME,
    //       Key: `Admins/${Date.now()}.webp`,
    //       Body: appBuffer,
    //       ACL: "public-read",
    //       ContentType: "image/webp",
    //     });
    //     let extArray = file.mimetype.split("/");
    //     let ext = extArray[extArray.length - 1];
    //     const originals = await uploadFileToS3({
    //       // eslint-disable-next-line no-undef
    //       Bucket: process.env.S3_BUCKET_NAME,
    //       Key: `Admins/${Date.now()}.${ext}`,
    //       Body: fs.readFileSync(file.path),
    //       ACL: "public-read",
    //       ContentType: "image/webp",
    //     });
    //     imagesWeb.push(web.Location);
    //     imagesApp.push(mobile.Location);
    //     imagesOg.push(originals.Location);
    //     setTimeout(async () => {
    //       deleteFileWithRetry(path.join("./public/", file.filename));
    //     }, 5000);
    //   }
    // }
    // if (req.files?.length || deleteImage.length) {
    //   varient.imagesApp = imagesApp;
    //   varient.imagesWeb = imagesWeb;
    //   varient.imagesOg = imagesOg;
    // }
    // if(imagesApp?.length){
    //   varient.imagesApp = imagesApp;
    // }
    // if(imagesWeb?.length){
    //   varient.imagesWeb = imagesWeb;
    // }
    // if(imagesOg?.length){
    //   varient.imagesOg = imagesOg;
    // }
    // let imagesAppArray = [];
    // let imagesWebArray = [];
    // let imagesOgArray = [];

    // if (deleteImage.length) {
    //   imagesWebArray = varient.imagesWeb.filter((item) => !deleteImage.includes(item));
    //   imagesAppArray = varient.imagesApp.filter((item) => !deleteImage.includes(item));
    //   imagesOgArray = varient.imagesOg.filter((item) => !deleteImage.includes(item));
    // }

    // if (imagesAppArray?.length) {
    //   varient.imagesApp = imagesAppArray;
    // }
    // if (imagesWebArray?.length) {
    //   varient.imagesWeb = imagesWebArray;
    // }
    // if (imagesOgArray?.length) {
    //   varient.imagesOg = imagesOgArray;
    // }
    await varient.save();
    res
      .status(200)
      .json(success("Varient updated", { varient }, res.statusCode));
  } catch (err) {
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "inventory/editVarients/:id",
    });
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getSearch = async (req, res) => {
  try {
    const { search, makeLive, page = 1, pageSize = 10 } = req.body;

    const inventory = await Inventory.aggregate([
      {
        $project: {
          name_en: 1,
          name_ar: 1,
          description_en: 1,
          description_ar: 1,
          category: 1,
          subCategory: 1,
          subSubCategory: 1,
          imagesApp: 1,
          isLive: 1,
          origin: 1,
          brand: 1,
          createdAt: 1,
          isDeleted: 1,
          status: 1,
        },
      },
      {
        $match: {
          isDeleted: false,
          ...(makeLive !== undefined && {
            isLive: makeLive === "true" || makeLive === true,
          }),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $lookup: {
          from: "subsubcategories",
          localField: "subSubCategory",
          foreignField: "_id",
          as: "subSubCategory",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandDetails",
          pipeline: [{ $project: { brandName_en: 1, brandName_ar: 1 } }],
        },
      },
      {
        $lookup: {
          from: "varients",
          localField: "_id",
          foreignField: "inventory",
          as: "varients",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                price: 1,
                attribute: 1,
                value: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          price: { $arrayElemAt: ["$varients.price", 0] },
        },
      },
      {
        $unset: "varients",
      },

      {
        $match: {
          ...(search && {
            $or: [
              { name_en: { $regex: search.trim(), $options: "i" } },
              { "category.name_en": { $regex: search.trim(), $options: "i" } },
              {
                "subCategory.name_en": { $regex: search.trim(), $options: "i" },
              },
              {
                "subSubCategory.name_en": {
                  $regex: search.trim(),
                  $options: "i",
                },
              },
              {
                "brandDetails.brandName_en": {
                  $regex: search.trim(),
                  $options: "i",
                },
              },
            ],
          }),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          inventories: [
            { $skip: +pageSize * (+page - 1) },
            { $limit: +pageSize },
          ],
        },
      },
    ]);

    const total = inventory[0].metadata.length
      ? inventory[0].metadata[0].total
      : 0;

    res.status(200).json(
      success(
        "Inventories",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          inventory: +total ? inventory[0].inventories : [],
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.error(err);
    await Error.create({
      arrError: err,
      strError: err,
      objError: err,
      route: "inventory/getInventory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
