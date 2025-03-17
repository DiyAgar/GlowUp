const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "user",
    //   required: false,
    // },
    status: {
      type: String,
      enum:["Receive","Pending"],
      default:"Pending",
      required: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
      },
    
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
