const { success, error } = require("common/apiResponse/apiResponse");
const { getText } = require("common/language/lang");
const Inventory = require("../models/inventorySchema");
const { default: mongoose } = require("mongoose");
const Error = require("common/models/errorSchema");
const Order = require("../../orders/models/orderSchema");
const Varient = require("../models/varientSchema");

// exports.getProducts = async (req, res) => {
//   try {
//     console.log(req.body);
//     const { category,search, page = 1, pageSize = 10 } = req.body;

//     const products = await Inventory.aggregate([
//       {
//         $match: {
//           $and: [
//             category ? { category: new mongoose.Types.ObjectId(category) } : {},
//           ],
//         },
//       },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           products: [
//             { $skip: (+page - 1) * +pageSize },
//             { $limit: +pageSize },
//             {
//               $lookup: {
//                 localField: "_id",
//                 foreignField: "product",
//                 from: "wishlists",
//                 as: "wishlist",
//                 pipeline: [
//                   {
//                     $match: {
//                       $or: [
//                         req.user
//                           ? {
//                               user: new mongoose.Types.ObjectId(req.user._id),
//                             }
//                           : {},
//                       ],
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $addFields: {
//                 isFavourite: {
//                   $or: [
//                     req.user ? { $gt: [{ $size: "$wishlist" }, 0] } : false,
//                   ],
//                 },
//               },
//             },
//             { $unset: "wishlist" },
//             {
//               $lookup: {
//                 localField: "category",
//                 foreignField: "_id",
//                 from: "categories",
//                 as: "category",
//                 pipeline: [
//                   {
//                     $project: {
//                       name_en: 1,
//                       name_ar: 1,
//                       image: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $lookup: {
//                 localField: "subCategory",
//                 foreignField: "_id",
//                 from: "subcategories",
//                 as: "subCategory",
//                 pipeline: [
//                   {
//                     $project: {
//                       name_en: 1,
//                       name_ar: 1,
//                       image: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $lookup: {
//                 localField: "subSubCategory",
//                 foreignField: "_id",
//                 from: "subsubcategories",
//                 as: "subSubCategory",
//                 pipeline: [
//                   {
//                     $project: {
//                       name_en: 1,
//                       name_ar: 1,
//                       image: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $lookup: {
//                 localField: "_id",
//                 foreignField: "inventory",
//                 from: "varients",
//                 as: "varients",
//                 pipeline: [
//                   { $match: { isDeleted: false } },
//                   {
//                     $lookup: {
//                       localField: "attribute",
//                       foreignField: "_id",
//                       from: "attributes",
//                       as: "attribute",
//                       pipeline: [
//                         {
//                           $project: {
//                             name_en: 1,
//                             name_ar: 1,
//                           },
//                         },
//                       ],
//                     },
//                   },
//                   // { $unwind: "$attribute" },
//                   {
//                     $lookup: {
//                       localField: "value",
//                       foreignField: "_id",
//                       from: "values",
//                       as: "value",
//                       pipeline: [
//                         {
//                           $project: {
//                             name_en: 1,
//                             name_ar: 1,
//                           },
//                         },
//                       ],
//                     },
//                   },
//                   // { $unwind: "$value" },
//                   // {
//                   //   $group: {
//                   //     _id: "$attribute._id",
//                   //     values: {
//                   //       $push: {
//                   //         varient_id: "$_id",
//                   //         _id: "$value._id",
//                   //         name_en: "$value.name_en",
//                   //         name_ar: "$value.name_ar",
//                   //       },
//                   //     },
//                   //     attribute: { $first: "$attribute" },
//                   //     inventory: { $first: "$inventory" },
//                   //     imagesApp: { $first: "$imagesApp" },
//                   //     imagesWeb: { $first: "$imagesWeb" },
//                   //     imagesOrg: { $first: "$imagesOrg" },
//                   //     price: { $first: "$price" },
//                   //     discount: { $first: "$discount" },
//                   //     quantity: { $first: "$quantity" },
//                   //     status: { $first: "$status" },
//                   //     isDeleted: { $first: "$isDeleted" },
//                   //     createdAt: { $first: "$createdAt" },
//                   //   },
//                   // },
//                 ],
//               },
//             },
//           ],
//         },
//       },

//     ]);
//     const total = products[0].metadata.length
//       ? products[0].metadata[0].total
//       : 0;
//     res.status(201).json(
//       success(
//         getText("SUCCESS", req.language),
//         {
//           total,
//           page,
//           pageSize,
//           totalPages: Math.ceil(total / +pageSize),
//           products: products[0].products.length ? products[0].products : [],
//         },
//         res.statusCode
//       )
//     );
//   } catch (err) {
//     console.log(err);
//     await Error.create({
//       arrError: err,
//       strError: JSON.stringify(err),
//       objError: err,
//       route: "inventory/getProducts",
//     });
//     res
//       .status(500)
//       .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
//   }
// };
exports.getProducts = async (req, res) => {
  try {
    console.log(req.body);
    const {
      category,
      search,
      isFeatured,
      attribute,
      value,
      page = 1,
      pageSize = 10,
    } = req.body;

    console.log("req body", req.body);

    const products = await Inventory.aggregate([
      {
        $match: {
          $and: [
            category ? { category: new mongoose.Types.ObjectId(category) } : {},
            isFeatured ? { isFeatured: true } : {},
          ],
        },
      },
      {
        $lookup: {
          localField: "_id",
          foreignField: "inventory",
          from: "varients",
          as: "varients",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $match: {
                $and: [
                  attribute
                    ? {
                        attribute: {
                          $elemMatch: {
                            $eq: new mongoose.Types.ObjectId(attribute),
                          },
                        },
                      }
                    : {},
                  value
                    ? {
                        value: {
                          $elemMatch: {
                            $eq: new mongoose.Types.ObjectId(value),
                          },
                        },
                      }
                    : {},
                ],
              },
            },
            {
              $lookup: {
                localField: "attribute",
                foreignField: "_id",
                from: "attributes",
                as: "attribute",
                pipeline: [
                  {
                    $project: {
                      name_en: 1,
                      name_ar: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                localField: "value",
                foreignField: "_id",
                from: "values",
                as: "value",
                pipeline: [
                  {
                    $project: {
                      name_en: 1,
                      name_ar: 1,
                    },
                  },
                ],
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $set: { isVarientAvailable: { $size: "$varients" } } },
      // { $match: { isVarientAvailable: { $gt: 0 } } },
      // { $unwind: "$varients" },
      // {
      //   $match: {
      //     $and: [
      //       attribute
      //         ? {
      //             "varients.attribute": {
      //               $elemMatch: {
      //                 $eq: new mongoose.Types.ObjectId(attribute),
      //               },
      //             },
      //           }
      //         : {},
      //       value
      //         ? {
      //             "varients.value": {
      //               $elemMatch: {
      //                 $eq: new mongoose.Types.ObjectId(value),
      //               },
      //             },
      //           }
      //         : {},
      //     ],
      //   },
      // },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          products: [
            { $skip: (+page - 1) * +pageSize },
            { $limit: +pageSize },
            {
              $lookup: {
                localField: "_id",
                foreignField: "product",
                from: "wishlists",
                as: "wishlist",
                pipeline: [
                  {
                    $match: {
                      $or: [
                        req.user
                          ? {
                              user: new mongoose.Types.ObjectId(req.user._id),
                            }
                          : {},
                      ],
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                isFavourite: {
                  $or: [
                    req.user ? { $gt: [{ $size: "$wishlist" }, 0] } : false,
                  ],
                },
              },
            },
            { $unset: "wishlist" },
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
            // {
            //   $lookup: {
            //     localField: "_id",
            //     foreignField: "inventory",
            //     from: "varients",
            //     as: "varients",
            //     pipeline: [
            //       { $match: { isDeleted: false } },
            //       {
            //         $lookup: {
            //           localField: "attribute",
            //           foreignField: "_id",
            //           from: "attributes",
            //           as: "attribute",
            //           pipeline: [
            //             {
            //               $project: {
            //                 name_en: 1,
            //                 name_ar: 1,
            //               },
            //             },
            //           ],
            //         },
            //       },
            //       {
            //         $lookup: {
            //           localField: "value",
            //           foreignField: "_id",
            //           from: "values",
            //           as: "value",
            //           pipeline: [
            //             {
            //               $project: {
            //                 name_en: 1,
            //                 name_ar: 1,
            //               },
            //             },
            //           ],
            //         },
            //       },
            //     ],
            //   },
            // },
            {
              $lookup: {
                from: "brands",
                localField: "brand",
                foreignField: "_id",
                as: "brandDetails",
                pipeline: [{ $project: { brandName_en: 1, brandName_ar: 1 } }],
              },
            },
            // Add search filtering here after lookups
            {
              $match: search
                ? {
                    $or: [
                      { name_en: { $regex: search.trim(), $options: "i" } },
                      {
                        "category.name_en": {
                          $regex: search.trim(),
                          $options: "i",
                        },
                      },
                      {
                        "category.name_ar": {
                          $regex: search.trim(),
                          $options: "i",
                        },
                      },
                      {
                        "subCategory.name_en": {
                          $regex: search.trim(),
                          $options: "i",
                        },
                      },
                      {
                        "subCategory.name_ar": {
                          $regex: search.trim(),
                          $options: "i",
                        },
                      },
                      {
                        "subSubCategory.name_en": {
                          $regex: search.trim(),
                          $options: "i",
                        },
                      },
                      {
                        "subSubCategory.name_ar": {
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
                  }
                : {},
            },
          ],
        },
      },
    ]);

    const total = products[0].metadata.length
      ? products[0].metadata[0].total
      : 0;

    res.status(201).json(
      success(
        getText("SUCCESS", req.language),
        {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / +pageSize),
          products: products[0].products.length ? products[0].products : [],
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
      route: "inventory/getProducts",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.viewProduct = async (req, res) => {
  try {
    const product = await Inventory.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params._id),
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
                brandName_en: 1,
                brandName_ar: 1,
                image: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
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
      // { $unwind: "$subSubCategory" },
      {
        $lookup: {
          localField: "_id",
          foreignField: "inventory",
          as: "varients",
          from: "varients",
          pipeline: [
            {
              $set: {
                isSelected: req.query
                  ? {
                      $eq: [
                        "$_id",
                        new mongoose.Types.ObjectId(req.query.varient),
                      ],
                    }
                  : false,
              },
            },
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
                      subcategory: 1,
                      subSubcategory: 1,
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
                    $lookup: {
                      localField: "attribute",
                      foreignField: "_id",
                      from: "attributes",
                      as: "attribute",
                      pipeline: [
                        {
                          $project: {
                            name_en: 1,
                            name_ar: 1,
                          },
                        },
                      ],
                    },
                  },
                  { $unwind: "$attribute" },
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
            //     attributes: { $first: "$attribute" },
            //     allValues: {
            //       $push: {
            //         varient_id: "$_id",
            //         value: "$value",
            //         inventory: "$inventory",
            //         imagesApp: "$imagesApp",
            //         imagesWeb: "$imagesWeb",
            //         imagesOrg: "$imagesOrg",
            //         price: "$price",
            //         discount: "$discount",
            //         quantity: "$quantity",
            //         status: "$status",
            //         isDeleted: "$isDeleted",
            //         createdAt: "$createdAt",
            //       },
            //     },
            //   },
            // },
          ],
        },
      },
    ]);
    res
      .status(201)
      .json(
        success(
          getText("SUCCESS", req.language),
          { product: product[0] },
          res.statusCode
        )
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "inventory/viewProduct/_id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getFilters = async (req, res) => {
  try {
    const { category, subSubcategory, subCategory } = req.body;
    const filters = await Inventory.aggregate([
      {
        $match: {
          $or: [
            category ? { category: {} } : {},
            subCategory ? {} : {},
            subSubcategory ? {} : {},
          ],
        },
      },
      { $project: { category: 1, subCategory: 1, subSubCategory: 1 } },
      {
        $lookup: {
          localField: "_id",
          foreignField: "inventory",
          from: "varients",
          as: "varients",
          pipeline: [
            { $project: { attribute: 1, value: 1 , price: 1, discount: 1} },
            { $unwind: "$attribute" },
            { $unwind: "$value" },
          ],
        },
      },
      { $unwind: "$varients" },
      { $unwind: "$category" },
      { $unwind: "$subCategory" },
      { $unwind: "$subSubCategory" },
      {
        $facet: {
          categories: [
            { $group: { _id: "$category" } },
            {
              $lookup: {
                localField: "_id",
                foreignField: "_id",
                from: "categories",
                as: "category",
                pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
              },
            },
            { $unwind: "$category" },
            {
              $set: {
                name_en: "$category.name_en",
                name_ar: "$category.name_ar",
              },
            },
            { $unset: "category" },
          ],
          subCategories: [
            { $group: { _id: "$subCategory" } },
            {
              $lookup: {
                localField: "_id",
                foreignField: "_id",
                from: "subcategories",
                as: "subCategory",
                pipeline: [
                  { $project: { category: 1, name_en: 1, name_ar: 1 } },
                ],
              },
            },
            { $unwind: "$subCategory" },
            {
              $set: {
                category: "$subCategory.category",
                category: "$subCategory.category",
                name_en: "$subCategory.name_en",
                name_ar: "$subCategory.name_ar",
              },
            },
            { $unset: "subCategory" },
          ],
          subSubCategories: [
            { $group: { _id: "$subSubCategory" } },
            {
              $lookup: {
                localField: "_id",
                foreignField: "_id",
                from: "subsubcategories",
                as: "subSubCategory",
                pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
              },
            },
            { $unwind: "$subSubCategory" },
            {
              $set: {
                name_en: "$subSubCategory.name_en",
                name_ar: "$subSubCategory.name_ar",
              },
            },
            { $unset: "subSubCategory" },
          ],
          attributes: [
            { $group: { _id: "$varients.attribute" } },
            {
              $lookup: {
                localField: "_id",
                foreignField: "_id",
                from: "attributes",
                as: "attributes",
                pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
              },
            },
            { $unwind: "$attributes" },
            {
              $set: {
                name_en: "$attributes.name_en",
                name_ar: "$attributes.name_ar",
              },
            },
            { $unset: "attributes" },
          ],
          values: [
            { $group: { _id: "$varients.value" } },
            {
              $lookup: {
                localField: "_id",
                foreignField: "_id",
                from: "values",
                as: "value",
                pipeline: [
                  { $project: { attribute: 1, name_en: 1, name_ar: 1 } },
                ],
              },
            },
            { $unwind: "$value" },
            {
              $set: {
                attribute: "$value.attribute",
                name_en: "$value.name_en",
                name_ar: "$value.name_ar",
              },
            },
            { $unset: "value" },
          ],
        },
      },
    ]);
    res
      .status(201)
      .json(
        success(
          getText("SUCCESS", req.language),
          { filters: filters[0] },
          res.statusCode
        )
      );
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "inventory/viewProduct/_id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

// exports.bestSellersProduct = async (req, res) => {
//   try {
//     const orders = await Order.aggregate([

//       {
//         $unwind: "$inventory",
//       },
//       {
//         $group: {
//           _id: "$inventory.product",
//           totalQuantity: { $sum: "$inventory.quantity" },
//         },
//       },
//       {
//         $sort: { totalQuantity: -1 },
//       },
//     ]);

//     const inventories = await Inventory.find({
//       _id: { $in: orders.map((order) => order._id) },
//     }).lean();

//     // Merge inventory details with the total quantity sold
//     const bestsellerProducts = inventories.map((product) => ({
//       ...product,
//       totalQuantity: orders.find(
//         (order) => order._id.toString() === product._id.toString()
//       ).totalQuantity,
//     }));
// console.log(req.user._id)
//     return res
//       .status(200)
//       .json(
//         success(
//           "Bestseller products retrieved successfully",
//           { products: bestsellerProducts },
//           res.statusCode
//         )
//       );
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json(error("Server error", res.statusCode));
//   }
// };

// exports.bestSellersProduct = async (req, res) => {
//   try {
//     const { search } = req.body;
//     const orders = await Order.aggregate([
//       {
//         $unwind: "$inventory",
//       },
//       {
//         $group: {
//           _id: "$inventory.product",
//           totalQuantity: { $sum: "$inventory.quantity" },
//         },
//       },
//       {
//         $sort: { totalQuantity: -1 },
//       },
//     ]);

//     const inventories = await Inventory.aggregate([
//       {
//         $match: {
//           _id: {
//             $in: orders.map((order) => new mongoose.Types.ObjectId(order._id)),
//           },
//           ...(search && { name_en: { $regex: search.trim(), $options: "i" } }),
//         },
//       },
    
//       {
//         $lookup: {
//           from: "varients",
//           localField: "_id",
//           foreignField: "inventory",
//           as: "varients",
//         },
//       },
//       {
//         $lookup: {
//           localField: "_id",
//           foreignField: "product",
//           from: "wishlists",
//           as: "wishlist",
//           pipeline: [
//             {
//               $match: {
//                 $or: [
//                   req.user
//                     ? { user: new mongoose.Types.ObjectId(req.user._id) }
//                     : {},
//                 ],
//               },
//             },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           isFavourite: {
//             $or: [req.user ? { $gt: [{ $size: "$wishlist" }, 0] } : false],
//           },
//           price: { $min: "$varients.price" },
//         },
//       },
//       { $unset: ["wishlist", "varients"] },
//     ]);

//     // Merge inventory details with the total quantity sold
//     const bestsellerProducts = inventories.map((product) => ({
//       ...product,
//       totalQuantity: orders.find(
//         (order) => order._id.toString() === product._id.toString()
//       ).totalQuantity,
//     }));

//     return res
//       .status(200)
//       .json(
//         success(
//           "Bestseller products retrieved successfully",
//           { products: bestsellerProducts },
//           res.statusCode
//         )
//       );
//   } catch (err) {
//     console.log(err);
//     await Error.create({
//       arrError: err,
//       strError: JSON.stringify(err),
//       objError: err,
//       route: "inventory/bestSellersProduct",
//     });
//     return res.status(500).json(error("Server error", res.statusCode));
//   }
// };

exports.bestSellersProduct = async (req, res) => {
  try {
    const { search } = req.body;

    // Aggregate total quantity sold for each product
    const orders = await Order.aggregate([
      {
        $unwind: "$inventory",
      },
      {
        $group: {
          _id: "$inventory.product",
          totalQuantity: { $sum: "$inventory.quantity" },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
    ]);

    // Fetch inventory details along with product and variant information
    const inventories = await Inventory.aggregate([
      {
        $match: {
          _id: {
            $in: orders.map((order) => new mongoose.Types.ObjectId(order._id)),
          },
          ...(search && { name_en: { $regex: search.trim(), $options: "i" } }),
        },
      },
      {
        $lookup: {
          from: "varients",
          localField: "_id",
          foreignField: "inventory",
          as: "varients",
        },
      },
      {
        $lookup: {
          localField: "_id",
          foreignField: "product",
          from: "wishlists",
          as: "wishlist",
          pipeline: [
            {
              $match: {
                $or: [
                  req.user
                    ? { user: new mongoose.Types.ObjectId(req.user._id) }
                    : {},
                ],
              },
            },
          ],
        },
      },
      {
        $addFields: {
          isFavourite: {
            $or: [req.user ? { $gt: [{ $size: "$wishlist" }, 0] } : false],
          },
          price: { $min: "$varients.price" },
        },
      },
      {
        $unset: ["wishlist"],
      },
    ]);

    // Merge inventory details with total quantity sold
    const bestsellerProducts = inventories.map((product) => ({
      ...product,
      totalQuantity: orders.find(
        (order) => order._id.toString() === product._id.toString()
      )?.totalQuantity || 0,
    }));

    return res.status(200).json(
      success(
        "Bestseller products retrieved successfully",
        { products: bestsellerProducts },
        res.statusCode
      )
    );
  } catch (err) {
    console.error(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "inventory/bestSellersProduct",
    });
    return res.status(500).json(error("Server error", res.statusCode));
  }
};




