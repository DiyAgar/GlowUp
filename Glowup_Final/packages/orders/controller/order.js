const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");
const Error = require("../../../common/models/errorSchema");
const Address = require("../../user/models/addressSchema");
const Order = require("../models/orderSchema");
const Cart = require("../models/cartSchema");
const { default: mongoose } = require("mongoose");
const User = require("../../../common/models/userSchema");
const { sendMail } = require("../../notifications/controller/mail");
const { sendNotificationUser } = require("../../notifications/controller/push");

exports.placeOrder = async (req, res) => {
  try {
    console.log(req.body);
    const {
      address,
      paymentMethod,
      transactionDate,
      transactionId,
      transactionStatus,
      promocode,
      attribute,
      value,
      cart_id,
    } = req.body;
    // if (!cart_id) {
    //   return res
    //     .status(206)
    //     .json(error(getText("PROVIDE_CARTID", req.language), res.statusCode));
    // }
    if (!address) {
      return res
        .status(206)
        .json(error(getText("PROVIDE_ADDRESS", req.language), res.statusCode));
    }
    const userAddress = await Address.findById(address).select([
      "-_id",
      "name",
      "street",
      "city",
      "state",
      "country",
      "pinCode",
    ]);
    if (!userAddress) {
      return res
        .status(206)
        .json(error(getText("INVALID_ADDRESS", req.language), res.statusCode));
    }
    // if (!inventory) {
    //   return res
    //     .status(206)
    //     .json(error(getText("PROVIDE_PRODUCTS", req.language), res.statusCode));
    // }
    // if (!inventory.length) {
    //   return res
    //     .status(206)
    //     .json(error(getText("PROVIDE_PRODUCTS", req.language), res.statusCode));
    // }
    if (!paymentMethod) {
      return res
        .status(206)
        .json(error(getText("PAYMENT_METHOD", req.language), res.statusCode));
    }
    if (!transactionDate) {
      return res
        .status(206)
        .json(error(getText("TRANSACTION_DATE", req.language), res.statusCode));
    }
    if (!transactionId) {
      return res
        .status(206)
        .json(error(getText("TRANSACTION_ID", req.language), res.statusCode));
    }
    if (!transactionStatus) {
      return res
        .status(206)
        .json(
          error(getText("TRANSACTION_STATUS", req.language), res.statusCode)
        );
    }
    if (!["Paid", "Cancelled", "Pending"].includes(transactionStatus)) {
      return res
        .status(206)
        .json(
          error(
            getText("INVALID_TRANSACTION_STATUS", req.language),
            res.statusCode
          )
        );
    }
    const cart = await Cart.aggregate([
      {
        $match: {
          $and: [
            cart_id
              ? {
                  _id: new mongoose.Types.ObjectId(cart_id),
                }
              : {},
          ],
          user: new mongoose.Types.ObjectId(req.user._id),
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
      {
        $group: {
          _id: "$user",
          amount: { $sum: "$amount" },
          totalProducts: { $sum: 1 },
          inventory: {
            $push: {
              cart_id: "$_id",
              product: "$product",
              attribute: "$attribute",
              value: "$value",
              varient: "$varient",
              quantity: "$quantity",
              amount: "$amount",
            },
          },
        },
      },
    ]);
    if (!cart.length) {
      return res
        .status(206)
        .json(error(getText("EMPTY_CART", req.language), res.statusCode));
    }
    // console.log(cart);
    let inventories = [];
    for (const element of cart[0].inventory) {
      inventories.push({
        product: element.product,
        varient: element.varient,
        quantity: element.quantity,
        amount: element.amount,
        attributeAndValues: element.attribute.map((item) => {
          return { name_en: item.name_en, name_ar: item.name_ar };
      
      }).concat(
        element.value.map((item) => {
          return { name_en: item.name_en, name_ar: item.name_ar };
        }),
      )       
      });
    }
    let query = {
      user: req.user._id,
      inventory: inventories,
      address: userAddress,
      paymentMethod: paymentMethod,
      transactionDate: transactionDate,
      transactionId: transactionId,
      transactionStatus: transactionStatus,
      totalAmount: +cart[0].amount,
      status: "Placed",
    };
    if (promocode) query.promocode = promocode;
    const order = await Order.create(query);
    const user = await User.findById(req.user._id)
      .select(["email", "fullName"])
      .lean();
    if (user?.email) {
      sendMail(
        user.email,
        "Order Placed",
        `Dear ${user.fullName}<br>Your order has been placed`
      );
    }
    sendNotificationUser(
      "ORDER_PLACED",
      { orderId: String(order._id), type: "ORDER_PLACED" },
      req.user._id
    );
    for (const element of cart[0].inventory) {
      await Cart.findByIdAndDelete(element.cart_id);
    }
    res
      .status(200)
      .json(
        success(
          getText("ORDER_PLACED", req.language),
          { order },
          res.statusCode
        )
      );
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

exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.body;
    // const orders = await Order.find({ user: req.user._id });
    const orders = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          status: { $ne: "Cancelled" },
          //isDeleted: false
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          orders: [
            { $skip: (+page - 1) * +pageSize },
            { $limit: +pageSize },
            { $unwind: "$inventory" },
            {
              $lookup: {
                localField: "inventory.product",
                foreignField: "_id",
                from: "inventories",
                as: "inventory.product",
                pipeline: [
                  {
                    $project: {
                      name_en: 1,
                      name_ar: 1,
                      imagesApp: 1,
                      imagesWeb: 1,
                      imagesOrg: 1,
                      // price: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$inventory.product" } },
            {
              $lookup: {
                localField: "inventory.varient",
                foreignField: "_id",
                from: "varients",
                as: "inventory.varient",
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
                            name_en: 1,
                            name_ar: 1,
                            attribute: 1,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      attribute: 1,
                      value: 1,
                      imagesApp: 1,
                      imagesWeb: 1,
                      imagesOrg: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$inventory.varient",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$_id",
                user: { $first: "$user" },
                inventory: {
                  $push: "$inventory",
                },
                address: { $first: "$address" },
                paymentMethod: { $first: "$paymentMethod" },
                transactionDate: { $first: "$transactionDate" },
                transactionId: { $first: "$transactionId" },
                transactionStatus: { $first: "$transactionStatus" },
                status: { $first: "$status" },
                totalAmount: { $first: "$totalAmount" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
              },
            },
          ],
        },
      },
    ]);
    const total = orders[0].metadata.length ? orders[0].metadata[0].total : 0;
    console.log(req.user._id);
    res.status(200).json(
      success(
        getText("MY_ORDER", req.language),
        {
          total: total,
          totalPages: Math.ceil(total / +pageSize),
          page,
          pageSize,
          orders: orders[0].orders,
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
      route: "cart/getMyCart",
    });
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.viewOrder = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params._id) } },
      { $unwind: "$inventory" },
      {
        $lookup: {
          localField: "inventory.product",
          foreignField: "_id",
          from: "inventories",
          as: "inventory.product",
          pipeline: [
            {
              $project: {
                name_en: 1,
                name_ar: 1,
                imagesApp: 1,
                imagesWeb: 1,
                imagesOrg: 1,
                description_en:1,
                description_ar:1,
                // price: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$inventory.product" } },
      {
        $lookup: {
          localField: "inventory.varient",
          foreignField: "_id",
          from: "varients",
          as: "inventory.varient",
          pipeline: [
            {
              $lookup: {
                localField: "attributes",
                foreignField: "_id",
                from: "attributes",
                as: "attributes",
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
            // {
            //   $unwind: {
            //     path: "$attributes",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
            {
              $lookup: {
                localField: "values",
                foreignField: "_id",
                from: "values",
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
            {
              $project: {
                attributes: 1,
                values: 1,
                imagesApp: 1,
                imagesWeb: 1,
                imagesOrg: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$inventory.varient",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          localField: "user",
          foreignField: "_id",
          from: "users", // Ensure this matches your User collection name
          as: "user",
          // pipeline: [
          //   {
          //     $project: {
          //       fullName: 1,
          //       email: 1,
          //       countryCode: 1,
          //       phoneNumber: 1,
          //       createdAt: 1,
          //     },
          //   },
          // ],
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          inventory: {
            $push: "$inventory",
          },
          address: { $first: "$address" },
          paymentMethod: { $first: "$paymentMethod" },
          transactionDate: { $first: "$transactionDate" },
          transactionId: { $first: "$transactionId" },
          transactionStatus: { $first: "$transactionStatus" },
          status: { $first: "$status" },
          totalAmount: { $first: "$totalAmount" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
    ]);
    console.log(req.user._id);
    res
      .status(200)
      .json(
        success(
          getText("MY_ORDER", req.language),
          { orders: orders[0] },
          res.statusCode
        )
      );
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



exports.getAdminOrders = async (req, res) => {
  try {
    const {status,search,paymentMethod, category, page = 1, pageSize = 10 } = req.body;

    console.log("re body", req.body);

    const query = {};
    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    
    const skip = (page - 1) * pageSize;

    const orders = await Order.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "user.fullName": { $regex: search, $options: "i" } },
                  { "user.phoneNumber": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      {
        $project: {
          userName: "$user.fullName",
          phoneNumber: "$user.phoneNumber",
          countryCode: "$user.countryCode",
          amount: "$totalAmount",
          paymentMethod: 1,
          orderDateTime: "$createdAt",
          status: 1,
          inventory: 1,
        },
      },
      {
        $unwind: "$inventory", // Unwind inventory items
      },
      {
        $lookup: {
          from: "varients",
          localField: "inventory.varient",
          foreignField: "_id",
          as: "inventory.varientDetails",
        },
      },
      {
        $unwind: "$inventory.varientDetails",
      },
      {
        $lookup: {
          from: "attributes",
          localField: "inventory.varientDetails.attribute",
          foreignField: "_id",
          as: "inventory.varientDetails.attributeDetails",
        },
      },
    
      {
        $addFields: {
          "inventory.varientDetails.attributes": "$inventory.varientDetails.attributeDetails",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "inventory.varientDetails.attributeDetails.category",
          foreignField: "_id",
          as: "inventory.varientDetails.attributeDetails.categoryDetails",
        },
      },
      { $unwind: "$inventory.varientDetails.attributeDetails.categoryDetails" },
      ...(category &&new mongoose.isValidObjectId(category)
      ? [
          {
            $match: {
              "inventory.varientDetails.attributeDetails.categoryDetails._id":new mongoose.Types.ObjectId(category),
            },
          },
        ]
      : []),
  
     { $unwind: "$inventory.varientDetails" },
      {
        $lookup: {
          from: "values",
          localField: "inventory.varientDetails.value",
          foreignField: "_id",
          as: "inventory.varientDetails.valueDetails",
        },
      },
      {
        $group: {
          _id: "$_id",
          userName: { $first: "$userName" },
          phoneNumber: { $first: "$phoneNumber" },
          countryCode: { $first: "$countryCode" },
          amount: { $first: "$amount" },
          paymentMethod: { $first: "$paymentMethod" },
          orderDateTime: { $first: "$orderDateTime" },
          status: { $first: "$status" },
          inventory: { $push: "$inventory" }, 
        },
      },
      { $sort: { orderDateTime: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]);

  
    const totalOrders = await Order.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { 
        $unwind: { 
          path: "$user", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      ...(search
        ? [
            {
              $match: {
                "user.fullName": { $regex: search, $options: "i" },
              },
            },
          ]
        : []),
      { $count: "total" },
    ]);

    const total = totalOrders.length > 0 ? totalOrders[0].total : 0;

    // orders.map((order) => console.log("Order Status:", order.status));
// console.log("len", orders.length);
// console.log("orders len", await Order.countDocuments({ isDeleted: false }))
// console.log("total order", totalOrders);

    res.status(200).json(
      success(
        "Orders retrieved successfully",
        {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          data: orders,
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Server error", res.statusCode));
  }
};


// exports.viewOrderDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id)
//       .populate("user", "fullName email countryCode phoneNumber createdAt")
//       .populate(
//         "inventory.product",
//         "name_en name_ar price imagesApp imagesWeb imagesOrg"
//       )
//       .populate({
//         path: "inventory.varient",
//         select: "name_en name_ar attribute value",
//       })

//     if (!order) {
//       return res.status(200).json(error("Order not found", res.statusCode));
//     }
//     res
//       .status(200)
//       .json(
//         success(
//           "Order details retrieved successfully",
//           { data: order },
//           res.statusCode
//         )
//       );
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(error("server error", res.statusCode));
//   }
// };

exports.viewOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user", "fullName email countryCode phoneNumber createdAt")
      .populate(
        "inventory.product",
        "name_en name_ar price imagesApp imagesWeb imagesOrg"
      )
      .populate({
        path: "inventory.varient",
        select: "name_en name_ar attribute value quantity", 
      });

    if (!order) {
      return res.status(200).json(error("Order not found", res.statusCode));
    }

    // Calculate remaining quantities for each variant
    order.inventory = order.inventory.map((item) => {
      const variant = item.varient;
      if (variant) {
        const remainingQuantity = (variant.quantity || 0) - item.quantity;
        return {
          ...item._doc, 
          varient: {
            ...variant._doc, 
            remainingQuantity: Math.max(remainingQuantity, 0), 
          },
        };
      }
      return item;
    });

    res.status(200).json(
      success(
        "Order details retrieved successfully",
        { data: order },
        res.statusCode
      )
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Server error", res.statusCode));
  }
};





exports.orderDelete = async (req, res) => {
  try {
    const orderId = req.params._id;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(200).json("Order not found.", res.statusCode);
    }

    res
      .status(200)
      .json("Order deleted successfully", { order }, res.statusCode);
  } catch (err) {
    console.error(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "order/deleteOrder",
    });
    res.status(400).json(error("server error", res.statusCode));
  }
};

exports.orderCancel = async (req, res) => {
  try {
    const { _id } = req.params; 
    const { reason } = req.body; 

    if (!reason) {
      return res
        .status(200)
        .json(error("Cancellation reason is required.", res.statusCode))
    }

    const order = await Order.findById(_id);

    if (!order) {
      return res
        .status(200)
        .json(error("Order not found.", res.statusCode));
    }

    // Update the order fields
    order.status = "Cancelled";
    //order.transactionStatus = "Cancelled";
    order.reason= reason; 
    await order.save();

    res.status(200).json(success("Order canceled successfully.",
     { data:  order },res.statusCode));
  } catch (err) {
    console.error(err);
    await Error.create({
      user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "order/orderCancel",
    });
    res.status(500).json(error( "Server error",res.statusCode));
  }
};
