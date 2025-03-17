const express = require("express");

const tokenUserAuth = require("../../../common/middlewares/tokenUserAuth");
const { payment } = require("../controller/transactions");

const router = express.Router();

/**
 * @swagger
 * /transaction/payment:
 *   patch:
 *     summary: Api for payment.
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
 *               amount:
 *                 type: number
 *                 required: true
 *     responses:
 *       200:
 *         description: Payment
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
 *         description: Payment
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
router.patch("/payment", tokenUserAuth, payment);

module.exports = router;
