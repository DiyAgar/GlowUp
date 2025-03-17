const tokenUserAuth = require("../../../common/middlewares/tokenUserAuth");
const express = require("express");
const {
  addToCart,
  getMyCart,
  removeProduct,
  countCartItems,
  updateCart,
  viewCart,
} = require("../controller/cart");

const router = express.Router();
//! Cart
/**
 * @swagger
 * /cart/addToCart:
 *   post:
 *     summary: Add products to the user's cart.
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
 *               product:
 *                 type: string
 *                 description: _id of the product
 *                 required: true
 *               varient:
 *                 type: string
 *                 description: _id of the product
 *                 required: false
 *               quantity:
 *                 type: number
 *                 required: false
 *                 description: Number of quantity users want to add. By default 1
 *     responses:
 *       200:
 *         description: Add to cart
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
router.post("/addToCart", tokenUserAuth, addToCart);
/**
 * @swagger
 * /cart/getMyCart:
 *   get:
 *     summary: Get products from the user's cart.
 *     tags: [Order]
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
 *         description: My cart
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
router.get("/getMyCart", tokenUserAuth, getMyCart);
router.put('/viewCart/:id',viewCart)
/**
 * @swagger
 * /cart/removeProduct/{_id}:
 *   patch:
 *     summary: Remove or delete product from cart.
 *     tags: [Order]
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
 *               deleteProduct:
 *                 type: number
 *                 description: To delete the product deleteProduct = 1
 *                 required: false
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
router.patch("/removeProduct", tokenUserAuth, removeProduct);
router.patch("/updateCart", tokenUserAuth, updateCart);

/**
 * @swagger
 * /cart/countCartItems:
 *   get:
 *     summary: Count the number of product in cart.
 *     tags: [Order]
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
router.get("/countCartItems", tokenUserAuth, countCartItems);
module.exports = router;
