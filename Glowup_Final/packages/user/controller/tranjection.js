const { error, success } = require("../../../common/apiResponse/apiResponse");
const Transaction=require('../models/tranjection')
const mongoose=require('mongoose')

exports.addTransaction = async (req, res) => {
    try {
      const { orderId, status } = req.body;
  
      const transaction = await Transaction.create({
        orderId: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
        status: status || "Pending",
      });
  
    
      const transactionDetails = await Transaction.aggregate([
        {
          $match: { _id: transaction._id },
        },
        {
          $lookup: {
            from: "orders", // Collection name for orders
            localField: "orderId",
            foreignField: "_id",
            as: "orderDetails",
          },
        },
        {
          $unwind: {
            path: "$orderDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
        },
      ]);
  
      res.status(201).json(success("Transaction added successfully",
       { data: transactionDetails[0]},res.statusCode));
    } catch (err) {
      console.error(err);
      res.status(500).json(error("Internal server error",res.statusCode));
    }
  };


  exports.getTransactionList = async (req, res) => {
    try {
      const { page = 1, pageSize = 10 } = req.body; 
      const skip = (page - 1) * pageSize; 
  
      const transactions = await Transaction.aggregate([
        {
          $match: {
            isDeleted: false, 
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "orderDetails",
          },
        },
        {
          $unwind: {
            path: "$orderDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "inventories",
            localField: "orderDetails.inventory.product",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "orderDetails.user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            orderId: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            "orderDetails._id": 1,
            "orderDetails.totalAmount": 1,
            "orderDetails.paymentMethod": 1,
            "orderDetails.transactionDate": 1,
            "orderDetails.transactionId": 1,
            "orderDetails.transactionStatus": 1,
            "productDetails._id": 1,
            "productDetails.name_en": 1,
            "productDetails.name_ar": 1,
            "userDetails._id": 1,
            "userDetails.fullName": 1,
          },
        },
        {
          $sort: { createdAt: -1 }, 
        },
        { $skip: skip }, 
        { $limit: pageSize }, 
      ]);

      const totalTransactions = await Transaction.countDocuments({
        isDeleted: false,
      });

      res.status(200).json(
        success(
          "Transaction list fetched successfully",
          {
            total: totalTransactions,
            page,
            pageSize,
            totalPages: Math.ceil(totalTransactions / pageSize),
            transactions,
          },
          res.statusCode
        )
      );
    } catch (err) {
      console.error(err);
      res.status(500).json(error("Internal server error", res.statusCode));
    }
  };



  exports.viewTransaction = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate transactionId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(200).json(error("Invalid transaction ID",res.statusCode));
      }
  
      // Fetch transaction with order details
      const transaction = await Transaction.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id),
            isDeleted: false

           },
        },
        {
          $lookup: {
            from: "orders", 
            localField: "orderId",
            foreignField: "_id",
            as: "orderDetails",
          },
        },
        {
          $unwind: {
            path: "$orderDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
            $lookup: {
              from: "inventories", 
              localField: "orderDetails.inventory.product", 
              foreignField: "_id",
              as: "productDetails",
            },
          },
         
          {
            $lookup: {
              from: "users", 
              localField: "orderDetails.user", 
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
       
          {
            $project: {
              _id: 1,
              orderId: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
              "orderDetails._id": 1,
              "orderDetails.totalAmount": 1,
              "orderDetails.totalAmount": 1,
              "orderDetails.paymentMethod": 1,
              "orderDetails.transactionDate": 1,
              "orderDetails.transactionId": 1,
              "orderDetails.transactionStatus": 1,
              "productDetails._id": 1,
              "productDetails.name_en": 1,
              "productDetails.name_ar": 1,
              "userDetails._id": 1,
              "userDetails.fullName": 1,
            },
          },
          // Sort by creation date
          {
            $sort: { createdAt: -1 },
          },
      ]);
  
    
      if (!transaction || transaction.length === 0) {
        return res.status(200).json(error("Transaction not found",res.statusCode));
      }
  
   
      res.status(200).json(success("Transaction details fetched successfully",
        {data: transaction[0]},res.statusCode ));
    } catch (err) {
      console.log(err);
      res.status(500).json(error("Internal server error",res.statusCode));
    }
  };

  exports.tranjectionDeleted = async (req, res) => {
    try {
      const { id } = req.params; // Get transaction ID from request parameters
  
      // Update the transaction's isDeleted field
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true } // Return the updated document
      );
  
      if (!updatedTransaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }
  
      // Respond with success
      res.status(200).json(success("Transaction marked as not deleted successfully",
       {data: updatedTransaction},
      ));
    } catch (err) {
      console.error(err);
      res.status(500).json(error("Internal server error",res.statusCode));
    }
  };
  