const mongoose = require("mongoose");
const { error, success } = require("common/apiResponse/apiResponse");
const Rating = require("../../inventory/models/ratingSchema");
const {
  compressImage,
  uploadFileToS3,
  deleteFileWithRetry,
} = require("common/s3/s3Uploads");
const path = require("path");
const { getText } = require("../../../common/language/lang");

exports.addRatingAndReview = async (req, res) => {
  try {
    const { productId, orderId, variantId, rating, comment } = req.body;
    const userId = req.user._id;

    const existingReview = await Rating.findOne({
      user: userId,
      product: productId,
      order: orderId,
      variant: variantId || null,
    });

    if (existingReview) {
      return res
        .status(200)
        .json(
          error(
            "You have already reviewed this product for this order.",
            res.statusCode,
          ),
        );
    }
    const image = await compressImage(req.files[0], 1, "", 80);

    const filepath = await uploadFileToS3({
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
    const newRating = await Rating.create({
      user: userId,
      product: productId,
      order: orderId,
      variant: variantId || null,
      rating,
      comment: comment || "",
      images: images.Location,
    });

    return res
      .status(200)
      .json(
        success(
          "Review added successfully",
          { data: newRating },
          res.statusCode,
        ),
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getUserRatings = async (req, res) => {
  try {
    const userId = req.user._id;

    const userRatings = await Rating.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },

      {
        $lookup: {
          from: "inventories",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      { $unwind: "$productDetails" },

      {
        $lookup: {
          from: "varients",
          localField: "variant",
          foreignField: "_id",
          as: "variantDetails",
        },
      },

      {
        $unwind: {
          path: "$variantDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderDetails",
        },
      },

      // Unwind order details (optional)
      {
        $unwind: {
          path: "$orderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Sort by the most recent ratings
      { $sort: { createdAt: -1 } },

      // Project fields to control the response
      {
        $project: {
          _id: 1,
          rating: 1,
          comment: 1,
          images: 1,
          createdAt: 1,
          "productDetails.name_en": 1,
          "productDetails.description_en": 1,
          "variantDetails.imagesApp": 1,
          "variantDetails.price": 1,
          "orderDetails._id": 1,
        },
      },
    ]);

    if (!userRatings.length) {
      return res
        .status(200)
        .json(error("No ratings found for this user.", res.statusCode));
    }

    // Return the ratings
    return res
      .status(200)
      .json(
        success(
          "User ratings fetched successfully.",
          { data: userRatings },
          res.statusCode,
        ),
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.ratingDelete = async (req, res) => {
  try {
    await Rating.findByIdAndDelete(req.params.id);
    res.status(200).json(success("rating deleted", {}, res.statusCode));
  } catch (err) {
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};
