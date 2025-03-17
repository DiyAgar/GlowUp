const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
const Error = require("../../../common/models/errorSchema");
const Inventory = require("../../inventory/models/inventorySchema");
const Varient = require("../../inventory/models/varientSchema");
const Wishlist = require("../models/wishlistSchema");
const { default: mongoose } = require("mongoose");

exports.addWishlist = async (req, res) => {
  try {
    const { varientId, productId } = req.body;
    if (!productId) {
      return res
        .status(200)
        .json(success(getText("PROVIDE_PRODUCT"), {}, res.statusCode));
    }
    const inventory = await Inventory.findById(productId);
    if (!inventory) {
      return res
        .status(200)
        .json(success(getText("INVALID_PRODUCT"), {}, res.statusCode));
    }
    if (varientId) {
      const varient = await Varient.findOne({
        _id: varientId,
        inventory: productId,
      });
      if (!varient) {
        return res
          .status(200)
          .json(success(getText("INVALID_VARIENTID"), {}, res.statusCode));
      }
    }
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
      varient: varientId,
    });
    if (wishlist) {
      await Wishlist.findByIdAndDelete(wishlist._id);
      return res
        .status(200)
        .json(success(getText("REMOVED_WISHLIST"), {}, res.statusCode));
    }
    await Wishlist.create({
      user: req.user._id,
      product: productId,
      varient: varientId || null,
    });
    res
      .status(200)
      .json(success(getText("ADDED_WISHLIST"), {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/addWishList/:id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

// exports.getWishList = async (req, res) => {
//   try {
//     const { page = 1, pageSize = 10 } = req.body;
//     const wishlist = await Wishlist.aggregate([
//      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           inventories: [
//             { $skip: (+page - 1) * +pageSize },
//             { $limit: +pageSize },
//             {
//               $lookup: {
//                 localField: "product",
//                 foreignField: "_id",
//                 from: "inventories",
//                 as: "product",
//                 pipeline: [
//                   { $set: { isFavourite: true } },
//                   {
//                     $lookup: {
//                       localField: "category",
//                       foreignField: "_id",
//                       from: "categories",
//                       as: "category",
//                       pipeline: [
//                         {
//                           $project: {
//                             name_en: 1,
//                             name_ar: 1,
//                             image: 1,
//                           },
//                         },
//                       ],
//                     },
//                   },
//                   // {
//                   //   $unwind: {
//                   //     path: "$category",
//                   //     preserveNullAndEmptyArrays: true,
//                   //   },
//                   // },
//                   {
//                     $lookup: {
//                       localField: "subCategory",
//                       foreignField: "_id",
//                       from: "subcategories",
//                       as: "subCategory",
//                       pipeline: [
//                         {
//                           $project: {
//                             name_en: 1,
//                             name_ar: 1,
//                             image: 1,
//                           },
//                         },
//                       ],
//                     },
//                   },
//                   // {
//                   //   $unwind: {
//                   //     path: "$subCategory",
//                   //     preserveNullAndEmptyArrays: true,
//                   //   },
//                   // },
//                   {
//                     $lookup: {
//                       localField: "subSubCategory",
//                       foreignField: "_id",
//                       from: "subsubcategories",
//                       as: "subSubCategory",
//                       pipeline: [
//                         {
//                           $project: {
//                             name_en: 1,
//                             name_ar: 1,
//                             image: 1,
//                           },
//                         },
//                       ],
//                     },
//                   },
//                   // {
//                   //   $unwind: {
//                   //     path: "$subSubCategory",
//                   //     preserveNullAndEmptyArrays: true,
//                   //   },
//                   // },
//                 ],
//               },
//             },
            
//             { $unwind: { path: "$product" } },
//             {
//               $lookup: {
//                 localField: "varient",
//                 foreignField: "_id",
//                 from: "varients",
//                 as: "varient",

//                 pipeline: [
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
//                             attribute: 1,
//                             name_en: 1,
//                             name_ar: 1,
//                           },
//                         },
//                       ],
//                     },
//                   },
//                 ],
//               },
//             },
            
//             { $unwind: { path: "$varient", preserveNullAndEmptyArrays: true } },
//             {
//               $group: {
//                 _id: "$user",
//                 products: {
//                   $push: { product: "$product", varient: "$varient" },
//                 },
//               },
//             },
//           ],
//         },
//       },
//     ]);
//     const total = wishlist[0].metadata.length
//       ? wishlist[0].metadata[0].total
//       : 0;
//     res.status(200).json(
//       success(
//         getText("WISHLIST"),
//         {
//           page,
//           pageSize,
//           total,
//           totalPage: Math.ceil(+total / +pageSize),
//           wishlist: wishlist[0].inventories.length
//             ? wishlist[0].inventories[0]
//             : {},
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
//       route: "platform/getWishList",
//     });
//     res
//       .status(500)
//       .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
//   }
// };

exports.getWishList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.body;
    const wishlist = await Wishlist.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          inventories: [
            { $skip: (+page - 1) * +pageSize },
            { $limit: +pageSize },
            {
              $lookup: {
                localField: "product",
                foreignField: "_id",
                from: "inventories",
                as: "product",
                pipeline: [
                  { $set: { isFavourite: true } },
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
                  {
                    $lookup: {
                      localField: "_id",
                      foreignField: "inventory",
                      from: "varients",
                      as: "varients",
                    },
                  },
                  {
                    $addFields: {
                      price: { $min: "$varients.price" },
                    },
                  },
                  { $unset: ["varients"] },
                ],
              },
            },
            { $unwind: { path: "$product" } },
            {
              $lookup: {
                localField: "varient",
                foreignField: "_id",
                from: "varients",
                as: "varient",
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
                ],
              },
            },
            { $unwind: { path: "$varient", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: "$user",
                products: {
                  $push: { product: "$product", varient: "$varient" },
                },
              },
            },
          ],
        },
      },
    ]);

    const total = wishlist[0].metadata.length
      ? wishlist[0].metadata[0].total
      : 0;

    res.status(200).json(
      success(
        getText("WISHLIST"),
        {
          page,
          pageSize,
          total,
          totalPage: Math.ceil(+total / +pageSize),
          wishlist: wishlist[0].inventories.length
            ? wishlist[0].inventories[0]
            : {},
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
      route: "platform/getWishList",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};


exports.removeWishList = async(req, res) => {
  try{
    const { varientId, productId } = req.body;

    if (!productId) {
      return res
        .status(200)
        .json(success(getText("PROVIDE_PRODUCT"), {}, res.statusCode));
    }
    const inventory = await Inventory.findById(productId);
    if (!inventory) {
      return res
        .status(200)
        .json(success(getText("INVALID_PRODUCT"), {}, res.statusCode));
    }
    if (varientId) {
      const varient = await Varient.findOne({
        _id: varientId,
        inventory: productId,
      });
      if (!varient) {
        return res
          .status(200)
          .json(success(getText("INVALID_VARIENTID"), {}, res.statusCode));
      }
    }

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
      varient: varientId,
    });
    if (wishlist) {
      await Wishlist.findByIdAndDelete(wishlist._id);
      return res
        .status(200)
        .json(success(getText("REMOVED_WISHLIST"), {}, res.statusCode));
    }
    else{
      return res.status(400).json(error(getText("NOT_IN_WISHLIST")), res.statusCode);
    }
  }
  catch(err){
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "platform/removeWishList",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
}