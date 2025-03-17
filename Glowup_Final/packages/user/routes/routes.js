const express = require("express");
const tokenAdminAuth = require("../../../common/middlewares/tokenAdminAuth");
const {
  getUserDetails,
  userDelete,
  userStatus,
  getUserList,
} = require("../controller/user");
const {
  addAddress,
  editAddress,
  viewAddress,
  getAddresses,
  deleteAddress,
} = require("../controller/address");
const tokenUserAuth = require("../../../common/middlewares/tokenUserAuth");
const {
  getDashboardTotals,
  getOrderList,
  getProductList,
} = require("../controller/dashboard");
const { createReferral, getReferral, useReferralCode, generateReferralLink, trackReferral, getReferredUsers } = require("../controller/referral");
const { addTransaction, getTransactionList, viewTransaction, tranjectionDeleted } = require("../controller/tranjection");
const router = express.Router();

//TODO -> Admin APIs
router.patch("/getUsers", getUserList);
/*
 * @swagger
 * /api/user/getUsers:
 *   patch:
 *     summary: Get the list of users
 *     description: Retrieve a list of users with optional search and date filters (year and month).
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search:
 *                 type: string
 *                 description: Search for users by first name or email (optional).
 *               year:
 *                 type: integer
 *                 description: Filter users by year of creation (optional).
 *               month:
 *                 type: integer
 *                 description: Filter users by month of creation (optional, requires year).
 *     responses:
 *       200:
 *         description: List of users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User list"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-08-15T12:34:56Z"
 *       400:
 *         description: Error retrieving user list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error in user list"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 */

router.get("/userDetails/:id", getUserDetails);
router.delete("/userDelete/:id", userDelete);
router.post("/userStatus/:id", userStatus);

//! Address

/**
 * @swagger
 * /user/addAddress:
 *   post:
 *     summary: Api to add user's address.
 *     tags: [User]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-user
 *         required: true
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               phoneNumber:
 *                 type: string
 *                 required: true
 *               countryCode:
 *                 type: string
 *                 required: true
 *               street:
 *                 type: string
 *                 required: true
 *               city:
 *                 type: string
 *                 required: true
 *               state:
 *                 type: number
 *                 required: true
 *               country:
 *                 type: number
 *                 required: true
 *               pinCode:
 *                 type: number
 *                 required: true
 *     responses:
 *       200:
 *         description: Address added
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 */
router.post("/addAddress", tokenUserAuth, addAddress);

/**
 * @swagger
 * /user/editAddress/{_id}:
 *   put:
 *     summary: Api to edit user's address.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: The _id of the cart. The variable in getMyCart api is "cart_id".
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token-user
 *         required: true
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: false
 *               phoneNumber:
 *                 type: string
 *                 required: false
 *               countryCode:
 *                 type: string
 *                 required: false
 *               street:
 *                 type: string
 *                 required: false
 *               city:
 *                 type: string
 *                 required: false
 *               state:
 *                 type: number
 *                 required: false
 *               country:
 *                 type: number
 *                 required: false
 *               pinCode:
 *                 type: number
 *                 required: false
 *     responses:
 *       200:
 *         description: Address edited
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 */
router.put("/editAddress/:_id", tokenUserAuth, editAddress);
/**
 * @swagger
 * /user/getAddresses:
 *   patch:
 *     summary: Get all addresses added by user.
 *     tags: [User]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-user
 *         required: true
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Product Removed
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *       500:
 *         description: Updated user
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 */
router.patch("/getAddresses", tokenUserAuth, getAddresses);
/**
 * @swagger
 * /user/viewAddress/{_id}:
 *   get:
 *     summary: View addresses added by user.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: The _id of the cart. The variable in getMyCart api is "cart_id".
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token-user
 *         required: true
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Product Removed
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *       500:
 *         description: Updated user
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 */
router.get("/viewAddress/:_id", tokenUserAuth, viewAddress);
/**
 * @swagger
 * /user/deleteAddress/{_id}:
 *   delete:
 *     summary: Delete user's address.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: The _id of the address..
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-auth-token-user
 *         required: true
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Address Deleted
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *       500:
 *         description: Address Deleted
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 */
router.delete("/deleteAddress/:_id", tokenUserAuth, deleteAddress);

//Dashboard
router.get("/getDashboardTotals", getDashboardTotals);
router.put("/getOrderList", getOrderList);
router.put("/getProductList", getProductList);

//referral
// router.post('/createReferral',tokenUserAuth,generateReferralLink);
// router.get('/getReferral',tokenUserAuth,getReferral);
// router.put('/useReferralCode',tokenUserAuth,useReferralCode);
// router.put('/trackReferral',tokenUserAuth,trackReferral)
router.put('/getReferredUsers',getReferredUsers)

//tranjection
router.post('/addTransaction',addTransaction)
router.put('/getTransactionList',getTransactionList);
router.put('/viewTransaction/:id',viewTransaction)
router.delete('/tranjectionDeleted/:id',tranjectionDeleted)

module.exports = router;
