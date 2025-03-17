const { success, error } = require("common/apiResponse/apiResponse");
const {
  deleteFileWithRetry,
  uploadFileToS3,
  compressImage,
} = require("common/s3/s3Uploads");
//const { default: mongoose } = require("mongoose");
const { Types } = require("mongoose");
const path = require("path");
const Brands = require("../models/brandSchema");
const Inventory=require('../../inventory/models/inventorySchema');
const Varient=require('../../inventory/models/varientSchema')
exports.addBrand = async (req, res) => {
  try {
    const { brandName_en, brandName_ar } = req.body;
    if (!brandName_en) {
      return res
        .status(200)
        .json(error("Please provide english name", res.statusCode));
    }

    // if (!brandName_ar) {
    //   return res
    //     .status(200)
    //     .json(error("Please provide Arbic name", res.statusCode));
    // }
    const verify = await Brands.findOne({ brandName_en: brandName_en?.trim() });
    if (verify) {
      return res
        .status(201)
        .json(error("Attributes name already stored", res.statusCode));
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
    const newBrand = await Brands.create({
      brandName_en: brandName_en.trim(),
      brandName_ar: brandName_ar.trim(),
      image: images.Location,
    });

    return res
      .status(200)
      .json(success("Brand added successfully", newBrand, res.statusCode));
  } catch (err) {
    console.log(err);
    res.status(500).json(error("server error", res.statusCode));
  }
};
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brandName_en, brandName_ar } = req.body;

    const brand = await Brands.findById(id);
    if (!brand) {
      return res.status(200).json(error("Brand not found", res.statusCode));
    }

    if (brandName_en) brand.brandName_en = brandName_en.trim();
    if (brandName_ar) brand.brandName_ar = brandName_ar.trim();

    if (req.files && req.files[0]) {
      // Compress the image
      const compressedImage = await compressImage(req.files[0], 1, "", 80);

      // Upload compressed image to S3
      const filepath = await uploadFileToS3({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Admins/${Date.now()}.webp`,
        Body: compressedImage,
        ACL: "public-read",
        ContentType: "image/webp",
      });

      brand.image = filepath.Location;

      setTimeout(async () => {
        deleteFileWithRetry(path.join("./public/", req.files[0].filename));
      }, 5000);
    }

    // Save the updated brand
    await brand.save();

    res
      .status(200)
      .json(success("Brand updated successfully", { brand }, res.statusCode));
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

// exports.getBrandList = async (req, res) => {
//   try {
//     const { search, year, month, page, pageSize } = req.body;

//     let query = {};

//     // Search by brand name
//     if (search) {
//       query.brandName_en = { $regex: search.trim(), $options: "i" };
//     }

//     // Filter by year and month
//     if (year && month) {
//       const startDate = new Date(`${year}-${month}-01`);
//       const endDate = new Date(startDate);
//       endDate.setMonth(endDate.getMonth() + 1);

//       query.createdAt = {
//         $gte: startDate,
//         $lt: endDate,
//       };
//     } else if (year) {
//       const startDate = new Date(`${year}-01-01`);
//       const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

//       query.createdAt = {
//         $gte: startDate,
//         $lte: endDate,
//       };
//     }

//     // Pagination settings
//     const skip = ((+page ? +page : 1) - 1) * (+pageSize ? +pageSize : 10);
//     const limit = +pageSize ? +pageSize : 10;

//     const brands = await Brands.aggregate([
//       { $match: query },
//       { $sort: { createdAt: -1 } },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           data: [{ $skip: skip }, { $limit: limit }],
//         },
//       },
//     ]);

//     const totalPages = brands[0].metadata.length
//       ? Math.ceil(brands[0].metadata[0].total / (pageSize ?? 10))
//       : 1;

//     res.status(200).json(
//       success(
//         "Brand listing fetched successfully",
//         {
//           brands: brands[0].data,
//           page: +page,
//           totalPages: totalPages,
//         },
//         res.statusCode,
//       ),
//     );
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(error("Internal Server Error", res.statusCode));
//   }
// };

exports.getBrandList = async (req, res) => {
  try {
    const { search, year, month, page = 1, pageSize = 10 } = req.body;

    let query = {};

    if (search) {
      query.brandName_en = { $regex: search.trim(), $options: "i" };
    }

    
    if (year && month) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    } else if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    
    const skip = (page - 1) * pageSize;

    
    const brands = await Brands.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          brandName_en: 1,
          brandName_ar: 1,
          image:1,
          createdAt: 1,
          status: 1,
        },
      },
    ]);

   
    const totalBrands = await Brands.aggregate([
      { $match: query },
      { $count: "total" },
    ]);

    const total = totalBrands.length > 0 ? totalBrands[0].total : 0;

    res.status(200).json(
      success(
        "Brand listing fetched successfully",
        {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          brands,
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};



exports.viewBrand = async (req, res) => {
  try {
    const { id } = req.params;
    // Find brand by ID
    const brand = await Brands.findById(id);
    if (!brand) {
      return res.status(404).json(error("Brand not found", res.statusCode));
    }

    res
      .status(200)
      .json(
        success("Brand details fetched successfully", brand, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the brand exists and delete
    const brand = await Brands.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json(error("Brand not found", res.statusCode));
    }

    res
      .status(200)
      .json(success("Brand deleted successfully", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
exports.brandStatus = async (req, res) => {
  try {
    const brand = await Brands.findById(req.params.id).select("status");
    brand.status = !brand.status;
    await brand.save();
    const msg = brand.status ? "brand Enabled" : "brand Disabled";
    res.status(201).json(success(msg, { brand }, res.statusCode));
  } catch (err) {
    console.log(err);
    res.status(500).json(error("server error", res.statusCode));
  }
};

exports.getBrandDropdown = async (req, res) => {
  try {
    const brands = await Brands.find({ isDeleted: false, status: true })
      .sort({ createdAt: -1 })
      .select(["brandName_en", "brandName_ar"]);
    res
      .status(201)
      .json(success("Brands Dropdown", { brands }, res.statusCode));
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.body;
    const brands = await Brands.aggregate([
      { $match: { isDeleted: false, status: true } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (+page - 1) * pageSize }, { $limit: +pageSize }],
        },
      },
    ]);
    const totalPages = brands[0].metadata.length
      ? brands[0].metadata[0].total
      : 0;
    res.status(200).json(
      success(
        "Brand listing fetched successfully",
        {
          brands: brands[0].data,
          page: +page,
          pageSize: pageSize,
          total: totalPages,
          totalPages: Math.ceil(+totalPages / +pageSize),
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
//brand list get allbrands 

// exports.brandByProduct= async (req, res) => {
// try {
//       const { id } = req.params;
  
//       if (!Types.ObjectId.isValid(id)) {
//         return res.status(200).json(error("Invalid brand ID", res.statusCode));
//       }
//       const products = await Inventory.find({
//         brand: new Types.ObjectId(id),
//         isDeleted: false, 
//       })
//         .populate("category", "name_en name_ar")
//         .populate("subCategory", "name_en name_ar")
//         .populate("subSubCategory", "name_en name_ar")
//         .populate("attributes", "name_en name_ar")
//         .populate("values", "name_en name_ar")
//         .select(
//           "name_en name_ar description_en description_ar imagesApp imagesWeb imagesOg status isFeatured hasVarients"
//         )
//         .lean();
//       res.status(200).json(success("Products retrieved successfully",
//         {data: products},res.statusCode));
//     } catch (err) {
//       console.error(err);
//       res.status(500).json(error("Internal server error",res.statusCode));
//     }
//   };

exports.brandByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(200).json(error("Invalid brand ID", res.statusCode));
    }
    const products = await Inventory.aggregate([
      {
        $match: {
          brand: new Types.ObjectId(id),
          isDeleted: false,
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
        $lookup: {
          from: "categories", 
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $lookup: {
          from: "subcategories",  
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategoryDetails",
        },
      },
      {
        $lookup: {
          from: "subsubcategories", 
          localField: "subSubCategory",
          foreignField: "_id",
          as: "subSubCategoryDetails",
        },
      },
      {
        $lookup: {
          from: "attributes",  
          localField: "attribute",
          foreignField: "_id",
          as: "attributesDetails",
        },
      },
      {
        $lookup: {
          from: "values", 
          localField: "values",
          foreignField: "_id",
          as: "valuesDetails",
        },
      },
      {
        $lookup: {
          from: "varients",
          let: { inventoryId: "$_id" }, 
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$inventory", "$$inventoryId"] }, 
              },
            },
            {
              $match: { isDeleted: false }, 
            },
            {
              $lookup: {
                from: "attributes",
                localField: "attribute",
                foreignField: "_id",
                as: "attributeDetails",
              },
            },
            {
              $lookup: {
                from: "values",
                localField: "value",
                foreignField: "_id",
                as: "valueDetails",
              },
            },
            {
              $addFields: {
                attribute: { $arrayElemAt: ["$attributeDetails", 0] },
                value: { $arrayElemAt: ["$valueDetails", 0] },
                price: { $ifNull: ["$price", 0] }, // Ensure price has a default value
              },
            },
            {
              $project: {
                price: 1,
                discount: 1,
                quantity: 1,
                attribute: 1,
                value: 1,
                imagesApp: 1,
                imagesWeb: 1,
                imagesOg: 1,
              },
            },
          ],
          as: "variantsDetails",
        },
      },
      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "product",
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
        },
      },
      { $unset: "wishlist" },
      {
        $project: {
          name_en: 1,
          name_ar: 1,
          description_en: 1,
          description_ar: 1,
          imagesApp: 1,
          imagesWeb: 1,
          imagesOg: 1,
          status: 1,
          isFeatured: 1,
          hasVarients: 1,
          isFavourite: 1,
          brand: { $arrayElemAt: ["$brandDetails.name_en", 0] },
          category: { $arrayElemAt: ["$categoryDetails.name_en", 0] },
          subCategory: { $arrayElemAt: ["$subCategoryDetails.name_en", 0] },
          subSubCategory: { $arrayElemAt: ["$subSubCategoryDetails.name_en", 0] },
          //attributes: { $arrayElemAt: ["$attributesDetails.name_en", 0] },
         // values: { $arrayElemAt: ["$valuesDetails.name_en", 0] },
        //  brand: { $arrayElemAt: ["$brandDetails.name_en", 0] }, // Brand details
        //attributes:"$attributesDetails",
        variants: "$variantsDetails",
        },
      },
    ]);

    res.status(200).json(success("Products retrieved successfully", { data: products }, res.statusCode));

  } catch (err) {
    console.error(err);
    res.status(500).json(error("Internal server error", res.statusCode));
  }
};





exports.getTopDiscountedProducts = async (req, res) => {
  try {
    const products = await Inventory.aggregate([
      {
        $match: {
          // isDeleted: false,
          // status: true, // Only active products
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
        $lookup: {
          from: "categories", 
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $lookup: {
          from: "subcategories", 
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategoryDetails",
        },
      },
      {
        $lookup: {
          from: "varients", 
          let: { inventoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$inventory", "$$inventoryId"] },
              },
            },
            {
              $match: { isDeleted: false, status: true }, 
            },
            {
              $lookup: {
                from: "attributes",
                localField: "attribute",
                foreignField: "_id",
                as: "attributeDetails",
              },
            },
            {
              $lookup: {
                from: "values",
                localField: "value",
                foreignField: "_id",
                as: "valueDetails",
              },
            },
            {
              $addFields: {
                attribute: { $arrayElemAt: ["$attributeDetails", 0] },
                value: { $arrayElemAt: ["$valueDetails", 0] },
                price: { $ifNull: ["$price", 0] }, // Ensure price has a default value
              },
            },
            {
              $project: {
                price: 1,
                discount: 1,
                quantity: 1,
                imagesApp: 1,
                imagesWeb: 1,
                imagesOg: 1,
                attribute:1,
                value:1,
              },
            },
          ],
          as: "variantsDetails",
        },
      },

      {
        $addFields: {
          maxDiscount: {
            $max: "$variantsDetails.discount", 
          },
        },
      },
      {
        $sort: { maxDiscount: -1 }, 
      },
      {
        $limit: 5, 
      },
      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "product",
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
        },
      },
      { $unset: "wishlist" },
      {
        $project: {
          name_en: 1,
          name_ar: 1,
          description_en: 1,
          description_ar: 1,
          imagesApp: 1,
          imagesWeb: 1,
          imagesOg: 1,
          isFeatured: 1,
          brand: { $arrayElemAt: ["$brandDetails.brandName_en", 0] },
          category: { $arrayElemAt: ["$categoryDetails.name_en", 0] },
          subCategory: { $arrayElemAt: ["$subCategoryDetails.name_en", 0] },
          variants: "$variantsDetails",
          maxDiscount: 1, 
          isFavourite:1,
        },
      },
    ]);

    if (!products.length) {
      return res
        .status(200)
        .json(error("No discounted products found",res.statusCode));
    }

    res.status(200).json(success("Top discounted products retrieved successfully",
      {data: products},res.statusCode));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
