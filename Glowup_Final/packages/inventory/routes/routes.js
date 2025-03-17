const express = require("express");
const {
  addVarients,
  getVarient,
  editVarients,
  deleteVarient,
  viewVarient,
  addInventory,
  viewInventory,
  deleteInventory,
  editInventory,
  changeInventoryStatus,
  uploadProductImage,
  getInventories,
  isProductLive,
  isFeaturedProduct,
  getSearch,
  editVarient,
} = require("../controller/inventory");
const {
  getProducts,
  viewProduct,
  bestSellersProduct,
  getFilters,
} = require("../controller/userProducts");
const tokenUserAuth = require("common/middlewares/tokenUserAuth");
const uploadImage = require("common/helpers/uploadImage");
const tokenGuestAuth = require("common/middlewares/guestUserToken");
const {
  addRatingAndReview,
  getUserRatings,
  ratingDelete,
} = require("../controller/ratings");
const router = express.Router();
// router.post("/signup", signup);

///Products Rouetes

router.post("/uploadProductImage", uploadImage.any(), uploadProductImage);
router.post("/addInventory", addInventory);

/**
 * @swagger
 * /inventory/getInventory:
 *   patch:
 *     summary: Get all the inventories.
 *     tags: [Inventory]
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
 *               search:
 *                 type: string
 *                 required: false
 *               category:
 *                 type: string
 *                 required: false
 *               type:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Blog detail
 *         content:
 *           application/json:
 *            schema:
 *             type: object
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
router.patch("/getInventories", getInventories);
router.get("/viewInventory/:id", viewInventory);
router.delete("/deleteInventory/:id", deleteInventory);
router.put("/editInventory/:_id", uploadImage.any(), editInventory);
router.get("/inventoryStatus/:id", changeInventoryStatus);
router.get("/isFeaturedProduct/:id", isFeaturedProduct);
router.get("/isProductLive/:id", isProductLive);
router.put("/getSearch", getSearch);
router.patch("/getFilters", getFilters);

// router.post("/addVarients", uploadImage.any(), addVarients);
// router.get("/getVarients/:id", getVarient);

router.put("/editVarients/:id", editVarients);
router.delete("/deleteVarients/:id", deleteVarient);
router.get("/viewVarients/:id", viewVarient);
//router.put('/editVarient/:id',uploadImage.any(),editVarient)

//! User Routes
/**
 * @swagger
 * /inventory/getProducts:
 *   patch:
 *     summary: Get products user side by category, sub category ans sub sub category.
 *     tags: [Inventory]
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
 *                 required: false
 *               pageSize:
 *                 type: number
 *                 required: false
 *                 description: Number of documents on page
 *               category:
 *                 type: string
 *                 required: false
 *     responses:
 *       200:
 *         description: Blog detail
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
router.patch("/getProducts", tokenGuestAuth, getProducts);
/**
 * @swagger
 * /inventory/viewProduct/{_id}:
 *   get:
 *     summary: Get detail of products user side.
 *     tags: [Inventory]
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
 *         description: Blog detail
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
router.get("/viewProduct/:_id", tokenGuestAuth, viewProduct);
router.get("/bestSellersProduct", tokenGuestAuth, bestSellersProduct);

// rating
router.post(
  "/addRatingAndReview",
  tokenGuestAuth,
  uploadImage.any(),
  addRatingAndReview
);
router.get("/getUserRatings", tokenGuestAuth, getUserRatings);
router.delete("/ratingDelete/:id", ratingDelete);
module.exports = router;
