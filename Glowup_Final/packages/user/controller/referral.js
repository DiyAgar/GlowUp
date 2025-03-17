const { error, success } = require("../../../common/apiResponse/apiResponse");

//const Referral=require('../models/referralSchema')
const User=require('../../../common/models/userSchema')

// const generateReferralCode = (userId) => {
//   return `REF-${userId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
// };


// // exports.createReferral = async (req, res) => {
// //   try {
// //     const userId = req.user._id; 
// //     const existingReferral = await Referral.findOne({ user: userId });
// //     if (existingReferral) {
// //       return res
// //         .status(200)
// //         .json(error('Referral code already exists for this user.', res.statusCode));
// //     }
// //     const referralCode = generateReferralCode(userId);

// //     const referral = await Referral.create({
// //       user: userId,
// //       referralCode,
// //       referredBy: req.body.referredBy || null, 
// //     });

// //     res.status(201).json(success('Referral code created successfully', { referral }, res.statusCode));
// //   } catch (err) {
// //     console.error(err);
// //     await Error.create({
// //       user: req?.user?._id,
// //       arrError: err,
// //       strError: JSON.stringify(err),
// //       objError: err,
// //       route: 'referral/createReferral',
// //     });
// //     res.status(400).json(error('Failed to create referral code', res.statusCode));
// //   }
// // };


// exports.getReferral = async (req, res) => {
//     try {
//       const userId = req.user._id; 
  
//       const referral = await Referral.findOne({ user: userId }).lean();
  
     
//       if (!referral) {
//         return res.status(404).json(error('Referral data not found', res.statusCode));
//       }
  
//       res.status(200).json(success('Referral data retrieved successfully', { referral }, res.statusCode));
//     } catch (err) {
//       console.error(err);
//       await Error.create({
//         user: req?.user?._id,
//         arrError: err,
//         strError: JSON.stringify(err),
//         objError: err,
//         route: 'referral/getReferral',
//       });
//       res.status(400).json(error('server error', res.statusCode));
//     }
// };


// exports.useReferralCode = async (req, res) => {
//     try {
//       const userId = req.user._id; 
//       const { referralCode } = req.body; 
  
     
//       if (!referralCode) {
//         return res.status(200).json(error('Referral code is required', res.statusCode));
//       }
  
      
//       const referralOwner = await Referral.findOne({ referralCode }).populate('user');
//       if (!referralOwner) {
//         return res.status(200).json(error('Invalid referral code', res.statusCode));
//       }
  
      
//       let userReferral = await Referral.findOne({ user: userId });
//       if (!userReferral) {
       
//         userReferral = new Referral({ user: userId, referralCode: null, referredBy: [] });
//       }
  
      
//       if (!userReferral.referredBy.includes(referralOwner.user._id)) {
//         userReferral.referredBy.push(referralOwner.user._id);
//       } else {
//         return res.status(400).json(error('You have already used this referral code', res.statusCode));
//       }
  
     
//       await userReferral.save();
  
//       res.status(200).json(success('Referral code applied successfully', { userReferral }, res.statusCode));
//     } catch (err) {
//       console.error(err);
//       await Error.create({
//         user: req?.user?._id,
//         arrError: err,
//         strError: JSON.stringify(err),
//         objError: err,
//         route: 'referral/useReferralCode',
//       });
//       res.status(400).json(error('Failed to apply referral code', res.statusCode));
//     }
//   };
  

// exports.generateReferralLink = async (req, res) => {
//     try {
//       const userId = req.user._id;
//       const referralCode = `${userId}-${new Date().getTime()}`; 
  
      
//       const referral = new Referral({
//         referredBy: userId,
//         referralCode: referralCode
//       });
//       await referral.save();
  
//       res.status(200).json({
//         success: true,
//         message: "Referral link generated successfully.",
//         referralLink: `www.app.com/register?referralCode=${referralCode}`
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({
//         success: false,
//         message: "Error generating referral link."
//       });
//     }
//   };
  

//   exports.trackReferral = async (req, res) => {
//     try {
//       const { referralCode } = req.body; 
  
//       if (!referralCode) {
//         return res.status(400).json({
//           success: false,
//           message: "Referral code is required."
//         });
//       }
  
//       const referral = await Referral.findOne({ referralCode });
//       if (!referral) {
//         return res.status(404).json({
//           success: false,
//           message: "Invalid referral code."
//         });
//       }
  
//       // Track that the user used the referral link
//       referral.referredUser = req.user._id;
//       referral.usedAt = new Date();
//       await referral.save();
  
//       res.status(200).json({
//         success: true,
//         message: "Referral successfully tracked.",referral
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({
//         success: false,
//         message: "Error tracking referral."
//       });
//     }
//   };
  


//   exports.getReferrals = async (req, res) => {
//     try {
//       const referrals = await Referral.find({ referredBy: req.user._id })
//         .populate('referredUser', 'name email') 
//         .sort({ createdAt: -1 })
//         .lean();
  
//       res.status(200).json({
//         success: true,
//         message: "Referral list fetched successfully.",
//         referrals: referrals
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({
//         success: false,
//         message: "Error fetching referral list."
//       });
//     }
//   };
  

 

  // exports.getReferredUsers = async (req, res) => {
  //   try {
   
  //     const referredUsers = await User.find({ referredBy: { $exists: true, $ne: null } })
  //       .populate({
  //         path: "referredBy",
  //         select: "fullName email phoneNumber", 
  //       })
  //       .select("fullName email phoneNumber referralCode referredBy"); 
  
    
  //     if (!referredUsers.length) {
  //       return res.status(200).json(error("No referred users found.",
  //         {data: []},res.statusCode));
  //     }
  //     res.status(200).json(success("Referred users fetched successfully.",
  //       {data: referredUsers},
  //       res.statusCode));
  //   } catch (err) {
  //     console.log(err);
  //     res.status(400).json(error("Server error.",res.statusCode));
  //   }
  // };
  

// exports.getReferredUsers = async (req, res) => {
//     try {
//       const { search, phoneNumber } = req.body; 

//       const matchConditions = { referredBy: { $exists: true, $ne: null } };
  
     
//       if (search) {
//         matchConditions.fullName = { $regex: search, $options: "i" }; 
//       }
//       if (phoneNumber) {
//         matchConditions.phoneNumber = phoneNumber;
//       }
//       const referredUsers = await User.aggregate([
//         {
//           $match:matchConditions,
//         },
//         {
//           $lookup: {
//             from: "users", 
//             localField: "referredBy",
//             foreignField: "_id",
//             as: "referredByDetails",
//           },
//         },
//         { $unwind: "$referredByDetails" }, 
//         {
//           $lookup: {
//             from: "orders", 
//             localField: "_id",
//             foreignField: "user",
//             as: "userOrders",
//           },
//         },
//         {
//           $addFields: {
//             totalOrders: { $size: "$userOrders" }, 
//             totalAmount: {
//               $sum: "$userOrders.totalAmount", 
//             },
//           },
//         },
//         {
//           $project: {
//             fullName: 1,
//             email: 1,
//             phoneNumber: 1,
//             referralCode: 1,
//             referredBy: "$referredByDetails",
//             totalOrders: 1,
//             totalAmount: 1,
//           },
//         },
//       ]);
  
//       if (!referredUsers.length) {
//         return res.status(200).json(
//           error("No referred users found.", { data: [] }, res.statusCode)
//         );
//       }
  
//       res.status(200).json(
//         success(
//           "Referred users fetched successfully.",
//           { data: referredUsers },
//           res.statusCode
//         )
//       );
//     } catch (err) {
//       console.log(err);
//       res.status(400).json(error("Server error.", res.statusCode));
//     }
//   };

exports.getReferredUsers = async (req, res) => {
  try {
    const { search, phoneNumber, page = 1, pageSize = 10 } = req.body;

    const matchConditions = { referredBy: { $exists: true, $ne: null } };

  
    if (search) {
      matchConditions.fullName = { $regex: search, $options: "i" };
    }
    if (phoneNumber) {
      matchConditions.phoneNumber = phoneNumber;
    }

   
    const skip = (page - 1) * pageSize;

    const referredUsers = await User.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "users",
          localField: "referredBy",
          foreignField: "_id",
          as: "referredByDetails",
        },
      },
      { $unwind: "$referredByDetails" },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "userOrders",
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$userOrders" },
          totalAmount: { $sum: "$userOrders.totalAmount" },
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          phoneNumber: 1,
          referralCode: 1,
          referredBy: "$referredByDetails",
          totalOrders: 1,
          totalAmount: 1,
        },
      },
      { $sort: { fullName: 1 } }, 
      { $skip: skip }, 
      { $limit: pageSize }, 
    ]);

    
    const totalReferredUsers = await User.countDocuments(matchConditions);

    if (!referredUsers.length) {
      return res.status(200).json(
        error("No referred users found.", { data: [], total: 0 }, res.statusCode)
      );
    }

    res.status(200).json(
      success(
        "Referred users fetched successfully.",
        {
          data: referredUsers,
          total: totalReferredUsers,
          page,
          pageSize,
          totalPages: Math.ceil(totalReferredUsers / pageSize),
        },
        res.statusCode
      )
    );
  } catch (err) {
    console.log(err);
    res.status(400).json(error("Server error.", res.statusCode));
  }
};
