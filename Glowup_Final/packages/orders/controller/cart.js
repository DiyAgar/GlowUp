const { success, error } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
const Error = require("../../../common/models/errorSchema");
const Cart = require("../models/cartSchema");
const Inventory = require("../../inventory/models/inventorySchema");
const { default: mongoose } = require("mongoose");
const Varient = require("../../inventory/models/varientSchema");

exports.addToCart = async (req, res) => {
  try {
    console.log(req.body);
    const { product, varient, quantity, value, attribute, amount } = req.body;
    if (!product) {
      return res
        .status(206)
        .json(
          error(getText("PROVIDE_PRODUCTID", req.language), res.statusCode)
        );
    }
    if (!varient) {
      return res
        .status(206)
        .json(
          error(getText("PROVIDE_VARIENTID", req.language), res.statusCode)
        );
    }
    const inventory = await Inventory.findById(product);
    if (!inventory) {
      return res
        .status(206)
        .json(
          error(getText("INVALID_PRODUCTID", req.language), res.statusCode)
        );
    }
    const varientId = await Varient.findOne({
      _id: varient,
      inventory: inventory._id,
    });
    if (!varientId) {
      return res
        .status(206)
        .json(
          error(getText("INVALID_VARIENTID", req.language), res.statusCode)
        );
    }
    const cart = await Cart.findOne({
      user: req.user._id,
      product: product,
      varient: varient,
    });
    // console.log(cart);
    if (cart) {
      const updated = await Cart.findByIdAndUpdate(
        cart._id,
        {
          quantity: +quantity ? +quantity : +cart.quantity + 1,
          amount:
            (+quantity ? +quantity : +cart.quantity + 1) *
            (+cart.amount / +cart.quantity),
          value: value,
          attribute: attribute,
        },
        { new: true }
      );
      return res
        .status(200)
        .json(
          success(getText("ADDED_CART"), { cart: updated }, res.statusCode)
        );
    }
    let query = {
      attribute: attribute,
      value: value,
      user: req.user._id,
      product: product,
      varient: varient,
      quantity: +quantity ? +quantity : 1,
      amount:
        (+quantity ? +quantity : 1) * (varientId.discount ?? varientId.price),
    };

    const newCart = await Cart.create(query);
    res
      .status(200)
      .json(success(getText("ADDED_CART"), { cart: newCart }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "cart/addToCart/:id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getMyCart = async (req, res) => {
  try {
    const cart = await Cart.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          localField: "product",
          foreignField: "_id",
          from: "inventories",
          as: "product",
          pipeline: [
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
                      // image: 1,
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
                      // image: 1,
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
                      // image: 1,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
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
              },
            },
            {
              $lookup: {
                localField: "value",
                foreignField: "_id",
                from: "values",
                as: "values",
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
          ],
        },
      },
      {
        $unwind: {
          path: "$varient",
          preserveNullAndEmptyArrays: true,
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
      {
        $group: {
          _id: "$user",
          amount: { $sum: "$amount" },
          totalProducts: { $sum: 1 },
          inventory: {
            $push: {
              cart_id: "$_id",
              attribute: "$attribute",
              value: "$value",
              product: "$product",
              varient: "$varient",
              quantity: "$quantity",
              amount: "$amount",
            },
          },
        },
      },
    ]);
    if (!cart.length) {
      return res.status(200).json(
        success("My bag", {
          cart: {
            _id: null,
            amount: 0,
            totalProducts: 0,
            inventory: [], 
          },
        }, res.statusCode)
      );
    }
    
    res.status(200).json(success("My bag", { cart: cart[0] }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "cart/getMyCart",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.viewCart = async (req, res) => {
  try {
    const cartId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json(error("Invalid bag ID", res.statusCode));
    }

    const cartDetails = await Cart.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(cartId),
        },
      },
      {
        $lookup: {
          localField: "product",
          foreignField: "_id",
          from: "inventories",
          as: "product",
          pipeline: [
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
          ],
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
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
              },
            },
            {
              $lookup: {
                localField: "value",
                foreignField: "_id",
                from: "values",
                as: "values",
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$varient",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          localField: "attribute",
          foreignField: "_id",
          from: "attributes",
          as: "attribute",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $lookup: {
          localField: "value",
          foreignField: "_id",
          from: "values",
          as: "value",
          pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          product: 1,
          varient: 1,
          attribute: 1,
          value: 1,
          quantity: 1,
          amount: 1,
          createdAt: 1,
        },
      },
    ]);

    if (!cartDetails.length) {
      return res
        .status(404)
        .json(error("Bag not found or does not exist", res.statusCode));
    }

    res
      .status(200)
      .json(
        success(
          "Bag details retrieved successfully",
          cartDetails[0],
          res.statusCode
        )
      );
  } catch (err) {
    console.error(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "cart/viewCartById",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.removeProduct = async (req, res) => {
  try {
    console.log(req.body);
    const { cartId, product, varient } = req.body;
    const cart = await Cart.findOne({
      user: req.user._id,
      $and: [
        cartId ? { _id: cartId } : {},
        product && varient ? { product: product, varient: varient } : {},
      ],
    });
    if (!cart) {
      return res
        .status(206)
        .json(error("Invalid product or bag id", res.statusCode));
    }
    await Cart.findByIdAndDelete(cart._id);
    res
      .status(200)
      .json(success(getText("PRODUCT_REMOVED"), {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "cart/removeProduct",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.countCartItems = async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.user._id }).countDocuments();
    res
      .status(200)
      .json(success(getText("PRODUCT_REMOVED"), { cart }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "cart/removeProduct/:id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.updateCart = async (req, res) => {
  try {
    console.log(req.body);
    const { cartId, product, varient, quantity, decrease, attribute, value } =
      req.body;
    // if (!decrease && !quantity) {
    //   return res
    //     .status(206)
    //     .json(error("Please provide decrease key or quantity!"));
    // }
    const cart = await Cart.findOne({
      user: req.user._id,
      $and: [
        cartId ? { _id: cartId } : {},
        product && varient ? { product: product, varient: varient } : {},
      ],
    });
    if (!cart) {
      return res
        .status(206)
        .json(error("Invalid product or bag id", res.statusCode));
    }
    // console.log(cart);
    const amount = cart.amount / cart.quantity;
    if (+quantity) {
      cart.quantity = +quantity ? +quantity : +cart.quantity + 1;
      cart.amount = +quantity * amount;
    }
    if (decrease) {
      if (cart.quantity == 1) await Cart.findByIdAndDelete(cart._id);
      else {
        cart.amount = +amount * (+cart.quantity - 1);
        cart.quantity = cart.quantity - 1;
      }
    }
    if (value?.length) cart.value = value;
    if (attribute?.length) cart.attribute = attribute;
    await cart.save();
    res
      .status(200)
      .json(success(getText("PRODUCT_REMOVED"), { cart }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "cart/removeProduct/:id",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

// export.getAllVarients = async(req,res)=>{

// }
