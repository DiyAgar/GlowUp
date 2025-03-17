const express = require("express");
const {
  placeOrder,
  getMyOrders,
  viewOrder,
  getAdminOrders,
  viewOrderDetails,
  orderDelete,
  orderCancel,
} = require("../controller/order");
const tokenUserAuth = require("../../../common/middlewares/tokenUserAuth");

const router = express.Router();

/**
 * @swagger
 * /order/placeOrder:
 *   post:
 *     summary: Api to place order user side.
 *     tags: [Order]
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
 *               address:
 *                 type: string
 *                 required: true
 *               paymentMethod:
 *                 type: string
 *                 required: true
 *               transactionDate:
 *                 type: string
 *                 required: true
 *               transactionId:
 *                 type: string
 *                 required: true
 *               transactionStatus:
 *                 type: string
 *                 required: true
 *               totalAmount:
 *                 type: number
 *                 required: true
 *     responses:
 *       200:
 *         description: Order Place
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
 *         description: Order Place
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
router.post("/placeOrder", tokenUserAuth, placeOrder);

/**
 * @swagger
 * /order/getMyOrders:
 *   patch:
 *     summary: Api to all user's order.
 *     tags: [Order]
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
 *               page:
 *                 type: number
 *                 required: true
 *               pageSzie:
 *                 type: number
 *                 required: true
 *     responses:
 *       200:
 *         description: All Orders
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
 *         description: Order Place
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
router.patch("/getMyOrders", tokenUserAuth, getMyOrders);

/**
 * @swagger
 * /order/viewOrder/{_id}:
 *   get:
 *     summary: Api to fetch user's order detail.
 *     tags: [Order]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-user
 *         required: true
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *       - in: path
 *         name: _id
 *         required: true
 *         description: Order _id to fetch order detail
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Order
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
 *         description: Order
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

router.get("/viewOrder/:_id",tokenUserAuth,  viewOrder);
router.put("/getAdminOrders", getAdminOrders);
router.get("/viewOrderDetails/:id", viewOrderDetails);
router.delete("/orderDelete/:_id", orderDelete);
router.put('/orderCancel/:_id',orderCancel);
module.exports = router;
