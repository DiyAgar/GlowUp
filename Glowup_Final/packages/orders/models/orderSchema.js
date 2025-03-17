const { Schema, Types, model } = require("mongoose");

const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    inventory: [
      {
        product: {
          type: Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        varient: {
          type: Types.ObjectId,
          ref: "Varient",
          required: false,
        },
        quantity: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        attributeAndValues: {
          type: [
            {
              name_en: {
                type: String,
                required: false,
              },
              name_ar: {
                type: String,
                required: false,
              },
            },
          ],
          // ref: "Attribute",
          default: [],
        },
        // value: {
        //   type: [
        //     {
        //       name_en: {
        //         type: String,
        //         required: false,
        //       },
        //       name_ar: {
        //         type: String,
        //         required: false,
        //       },
        //     },
        //   ],
        //   // ref: "Value",
        //   default: [],
        // },
      },
    ],
    address: {
      type: Object,
      default: {
        name: "",
        countryCode: "",
        phoneNumber: "",
        street: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
      },
    },
    paymentMethod: {
      type: String,
      enum:["COD","Online","E-Wallet"],
      default: "E-Wallet",
    },
    transactionDate: {
      type: Date,
      default: new Date(),
    },
    transactionId: {
      type: String,
      default: "E-Wallet",
    },
    transactionStatus: {
      type: String,
      enum: ["Paid", "Cancelled", "Pending"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Placed", "Completed", "Cancelled", "Returned"],
      default: "Placed",
    },
    reason:{
      type:String,
      required:false,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: {} },
  { collection: "Order" }
);

const Order = model("Order", schema);

module.exports = Order;
