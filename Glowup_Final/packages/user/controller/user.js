const { success, error } = require("../../../common/apiResponse/apiResponse");
const Error = require("../../../common/models/errorSchema");
const User = require("../../../common/models/userSchema");
const { default: mongoose } = require("mongoose");
const { getText } = require("../../../common/language/lang");

// exports.getUserList = async (req, res) => {
//   try {
//     const { search, year, month, page, pageSize } = req.body;

//     let query = {};
//     if (search) {
//       query.fullName = { $regex: search, $options: "i" };
//     }

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

//     const skip = ((+page ? +page : 1) - 1) * (+pageSize ? +pageSize : 10);
//     const limit = +pageSize ? +pageSize : 10;

//     const users = await User.aggregate([
//       {
//         $match: query,
//       },
//       { $sort: { createdAt: -1 } },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           data: [{ $skip: skip }, { $limit: limit }],
//         },
//       },
//     ]);

//     const totalPages = users[0].metadata.length
//       ? Math.ceil(users[0].metadata[0].total / (pageSize ?? 10))
//       : 1;
//     res.status(200).json(
//       success(
//         "User listing fetched successfully",
//         {
//           users: users[0].data,
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

exports.getUserList = async (req, res) => {
  try {
    const { search, status, phoneNumber, totalOrders, page = 1, pageSize = 10 } = req.body;

    let query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== undefined) {
      query.status = status === "true" || status === true; 
    }

    if (phoneNumber) {
      query.phoneNumber = phoneNumber;
    }
    // if (year && month) {
    //   const startDate = new Date(`${year}-${month}-01`);
    //   const endDate = new Date(startDate);
    //   endDate.setMonth(endDate.getMonth() + 1);

    //   query.createdAt = {
    //     $gte: startDate,
    //     $lt: endDate,
    //   };
    // } else if (year) {
    //   const startDate = new Date(`${year}-01-01`);
    //   const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    //   query.createdAt = {
    //     $gte: startDate,
    //     $lte: endDate,
    //   };
    // }

    const skip = (page - 1) * pageSize;

    const users = await User.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "orders", 
          localField: "_id", 
          foreignField: "user", 
          as: "orders", 
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$orders" }, 
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          countryCode: 1,
          phoneNumber: 1,
          createdAt: 1,
          status: 1,
          totalOrders: 1, 
        },
      },
    ]);
    let filteredUsers = users;
    if (totalOrders !== undefined) {
      switch (totalOrders) {
        case "0-5":
          filteredUsers = users.filter((user) => user.totalOrders >= 0 && user.totalOrders <= 5);
          break;
        case "5-10":
          filteredUsers = users.filter((user) => user.totalOrders > 5 && user.totalOrders <= 10);
          break;
        case "10-15":
          filteredUsers = users.filter((user) => user.totalOrders > 10 && user.totalOrders <= 15);
          break;
        case "15-20":
          filteredUsers = users.filter((user) => user.totalOrders > 15 && user.totalOrders <= 20);
          break;
        case "20+":
          filteredUsers = users.filter((user) => user.totalOrders > 20);
          break;
        default:
          break;
      }
    }
    const totalUsers = await User.aggregate([
      { $match: query },
      { $count: "total" },
    ]);

    const total = totalUsers.length > 0 ? totalUsers[0].total : 0;

    res.status(200).json(
      success(
        "User listing fetched successfully",
        {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          users:filteredUsers,
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};


exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) },
      },
      {
        $lookup: {
          from: "addresses", 
          localField: "_id", 
          foreignField: "user", 
          as: "address", 
        },
      },
      {
        $unwind: {
          path: "$address",
          preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $lookup: {
          from: "orders", 
          localField: "_id", 
          foreignField: "user", 
          as: "orders", 
        },
      },
      // {
      //   $unwind: {
      //     path: "$orders",
      //     preserveNullAndEmptyArrays: true, 
      //   },
      // },
      {
        $addFields: {
          totalOrders: { $size: "$orders" }, 
        },
      },
    ]);
    res.status(200).json(success("Success", { user }, res.statusCode));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.userDelete = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json(success("User Deleted", {}, res.statusCode));
  } catch (err) {
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};

exports.userStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("status");
    user.status = !user.status;
    await user.save();
    const msg = user.status ? "User Enabled" : "User Disabled";
    res.status(201).json(success(msg, { user }, res.statusCode));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(error(getText("CATCH_ERROR", req.language), res.statusCode));
  }
};
