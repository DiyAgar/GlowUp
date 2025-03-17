const express = require("express");
const {
  addBanner,
  getUserBanner,
  getBanners,
  viewBanners,
  changeBanners,
  deleteBanner,
  editBanner,
  getProducts,
} = require("../controller/banner");
const uploadImage = require("../../../common/helpers/uploadImage");
const tokenUserAuth = require("../../../common/middlewares/tokenUserAuth");
const {
  createContent,
  getContent,
  contentDelete,
  getUserContent,
  editContent,
  addContent,
} = require("../controller/content");
const {
  raiseTicket,
  getUserQueary,
  getUserFeedback,
  viewQueary,
  deleteQueary,
  getUserTickets,
  viewTickets,
} = require("../controller/helpAndSupport");
const { addWishlist, getWishList, removeWishList } = require("../controller/wishlist");
const {
  addNews,
  editNews,
  getNews,
  deleteNews,
  viewNews,
} = require("../controller/news");
const {
  addWebinar,
  getWebinar,
  viewWebinar,
  deleteWebinar,
  editWebinar,
} = require("../controller/webinar");
const {
  addCampaign,
  getCampaign,
  viewCampaign,
  deleteCampaign,
  editCampaign,
  getAffiliates,
} = require("../controller/campaign");

const router = express.Router();

// Admin routes---------

//Banners routes admin side

/**
 * @swagger
 * /platform/addBanner:
 *   post:
 *     summary: Add banner to platform.
 *     tags: [Banner]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 required: false
 *               subCategory:
 *                 type: string
 *                 required: false
 *               subSubCategory:
 *                 type: string
 *                 required: false
 *               products:
 *                 type: Array
 *                 required: false
 *               url:
 *                 type: string
 *                 required: false
 *               text:
 *                 type: string
 *                 required: false
 *             position:
 *                 type: string
 *                 required: false
 *               image:
 *                 type: binary
 *                 example: file.jpeg
 *     responses:
 *       200:
 *         description: Updated User
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *                 properties:
 *                  user:
 *                    type: object
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
router.post("/addBanner", uploadImage.any(), addBanner);

/**
 * @swagger
 * /platform/getsBanners:
 *   patch:
 *     summary:Get All Banners Admin Side
 *   tags: [Banner]
 *     requestBody:
 *       required: true
 *             properties:
 *               search:
 *                 type: string
 *                 category:
 *                 type: string
 *                 page:
 *                 type: number
 *                 pageSize: number
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Logo
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *       500:
 *         description: Logo
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
router.patch("/getsBanners", getBanners);

/**
 * @swagger
 * /platform/viewBanners/{_id}:
 *   get:
 *     summary: View Banner admin side.
 *     tags: [Banner]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Banner detail
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *       500:
 *         description: view banner
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
router.get("/viewBanners/:id", viewBanners);

/**
 *@swagger
 *paths:
 *  /platform/changeBanners/:_id:
 *    put:
 *      summary: Banner enable  disable
 *      tags: [Banner]
 *      description:Banner enable  disable
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *      responses:
 *        '201':
 *          description:Banner enable  disable successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: boolean
 *                    example: false
 *                  message:
 *                    type: string
 *                  results:
 *                    type: object
 *         201:
 *         description: Invalid Banner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Invalid Banner
 *        '500':
 *          description: Logo
 *          content:
 *            application/json:
 *             schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: boolean
 *                message:
 *                  type: string
 *                results:
 *                  type: object
 *
 *      security:
 *        - x-auth-token-admin: []
 *
 *      components:
 *        securitySchemes:
 *          x-auth-token-admin:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-admin
 *
 */
router.put("/changeBanners/:id", changeBanners);

/**
 *@swagger
 *paths:
 *  /platform/deleteBanners/:id:
 *    delete:
 *      summary: Banner data  delete
 *      tags: [Banner]
 *      description: Deleted Banner data
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *      responses:
 *        '201':
 *          description:Banner data deleted successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: boolean
 *                    example: false
 *                  message:
 *                    type: string
 *                  results:
 *                    type: object
 *         201:
 *         description: Invalid Banner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Invalid Banner
 *        '500':
 *          description: Logo
 *          content:
 *            application/json:
 *             schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: boolean
 *                message:
 *                  type: string
 *                results:
 *                  type: object
 *
 *      security:
 *        - x-auth-token-admin: []
 *
 *      components:
 *        securitySchemes:
 *          x-auth-token-admin:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-admin
 *
 */
router.delete("/deleteBanners/:id", deleteBanner);

/**
 * @swagger
 * /platform/editBanners/:_id
 *   put:
 *     summary: Edit Banner to platform.
 *     tags: [Blogs]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 required: false
 *               subCategory:
 *                 type: string
 *                 required: false
 *               subSubCategory:
 *                 type: string
 *                 required: false
 *               products:
 *                 type: Array
 *                 required: false
 *               url:
 *                 type: string
 *                 required: false
 *               text:
 *                 type: string
 *                 required: false
 *             position:
 *                 type: string
 *                 required: false
 *               image:
 *                 type: binary
 *                 example: file.jpeg
 *     responses:
 *       200:
 *         description: Updated Banner
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *                 properties:
 *                  user:
 *                    type: object
 *       500:
 *         description: Updated Banner
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
router.put("/editBanners/:id", uploadImage.any(), editBanner);

/**
 *@swagger
 *paths:
 *  /platform/getProducts:
 *    put:
 *      summary: Get products admin side
 *      tags: [Banner]
 *      description:Get products admin side
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *      responses:
 *        '201':
 *          description:Get products admin side successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: boolean
 *                    example: false
 *                  message:
 *                    type: string
 *                  results:
 *                    type: object
 *        '500':
 *          description: Logo
 *          content:
 *            application/json:
 *             schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: boolean
 *                message:
 *                  type: string
 *                results:
 *                  type: object
 *
 *      security:
 *        - x-auth-token-admin: []
 *
 *      components:
 *        securitySchemes:
 *          x-auth-token-admin:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-admin
 *
 */
router.get("/getProducts", getProducts);

// Content routes
router.post("/addContent", addContent);
router.put("/editContent/:id", editContent);
router.patch("/getContents", getContent);
router.delete("/deleteContent/:id", contentDelete);
router.patch("/getQueary", getUserQueary);
router.patch("/getFeedback", getUserFeedback);
router.get("/viewQueary/:id", viewQueary);
router.delete("/deleteQueary/:id", deleteQueary);

///News and Beauty  admin Side
/**
 * @swagger
 * /platform/addNews:
 *   post:
 *     summary: Add News to platform.
 *     tags: [News]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title_en:
 *                 type: string
 *                 required: false
 *               title_ar:
 *                 type: string
 *                 required: false
 *               description_en:
 *                 type: string
 *                 required: false
 *               description_ar:
 *                 type: Array
 *                 required: false
 *               type:
 *                 type: string
 *                 required: false
 *               image:
 *                 type: binary
 *                 example: file.jpeg
 *     responses:
 *       200:
 *         description: Created News
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *                 properties:
 *                  user:
 *                    type: object
 *       500:
 *         description: Updated News
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
router.post("/addNews", uploadImage.any(), addNews);

/**
 * @swagger
 * /platform/editNews/:_id:
 *   post:
 *     summary: Update News to platform.
 *     tags: [News]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title_en:
 *                 type: string
 *                 required: false
 *               title_ar:
 *                 type: string
 *                 required: false
 *               description_en:
 *                 type: string
 *                 required: false
 *               description_ar:
 *                 type: Array
 *                 required: false
 *               type:
 *                 type: string
 *                 required: false
 *               image:
 *                 type: binary
 *                 example: file.jpeg
 *     responses:
 *       200:
 *         description: Updated News
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *                 properties:
 *                  user:
 *                    type: object
 *       500:
 *         description: Updated News
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
router.put("/editNews/:id", uploadImage.any(), editNews);

/**
 * @swagger
 * /platform/getNews:
 *   patch:
 *     summary:Get All News Admin Side
 *   tags: [News]
 *     requestBody:
 *       required: true
 *             properties:
 *               search:
 *                 type: string
 *                 type:
 *                 type: string
 *                 page:
 *                 type: number
 *                 pageSize:
 *                 type: number
 *
 *     responses:
 *       200:
 *         description: Get News
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *       500:
 *         description: Logo
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
router.patch("/getNews", getNews);

/**
 * @swagger
 * /platform/deleteNews/{_id}:
 *   delete:
 *     summary: Delete News admin side.
 *     tags: [News]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: News deleted
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *       500:
 *         description: deleted News
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
router.delete("/deleteNews/:id", deleteNews);

/**
 * @swagger
 * /platform/viewNews/{_id}:
 *   get:
 *     summary: View News admin side.
 *     tags: [News]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: News detail
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *       500:
 *         description: view News
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
router.get("/viewNews/:id", viewNews);

///-----Webinar Raoutes admin side

/**
 * @swagger
 * /platform/addWebinar/:
 *   post:
 *     summary: Create Webinar admin side.
 *     tags: [Webinar]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *      requestBody:
 *    required: true
 *    content:
 *        application/json:
 *         schema:
 *            type: object
 *           properties:
 *             products:
 *                type: []
 *            url:
 *            type: string
 *           startDate:
 *             type: string
 *             endDate:
 *                 type: string
 *               date:
 *                type: Date
 *                title_en:
 *                 type: string
 *               title_ar:
 *                 type: string
 *                description: Webinar title in Arabic
 *                 example: "مقدمة في تطوير الويب"
 *     responses:
 *       200:
 *         description: Create webinar
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *       500:
 *         description: view News
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
router.post("/addWebinar", addWebinar);

/**
 * @swagger
 * /platform/getWebinar:
 *   patch:
 *     summary:Get All Webinar  Admin Side
 *   tags: [Webinar]
 *     requestBody:
 *       required: true
 *             properties:
 *               search:
 *                 type: string
 *                 page:
 *                 type: number
 *                 pageSize:
 *                 type: number
 *
 *     responses:
 *       200:
 *         description: Get Webinar
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               results:
 *                 type: object
 *       500:
 *         description: Logo
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
router.patch("/getWebinar", getWebinar);

/**
 * @swagger
 * /platform/viewWebinar/{_id}:
 *   get:
 *     summary: View Webinar admin side.
 *     tags: [Webinar]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description:View Webinar detail
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *       500:
 *         description: view Webinar
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
router.get("/viewWebinar/:id", viewWebinar);

/**
 * @swagger
 * /platform/deleteWebinar/{_id}:
 *   delete:
 *     summary: Delete Webinar admin side.
 *     tags: [Webinar]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Webinar deleted
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *       500:
 *         description: deleted Webinar
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
router.delete("/deleteWebinar/:id", deleteWebinar);

/**
 * @swagger
 * /platform/editWebinar/{_id}:
 *   put:
 *     summary: Update Webinar admin side.
 *     tags: [Webinar]
 *     parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *      requestBody:
 *    required: true
 *    content:
 *        application/json:
 *         schema:
 *            type: object
 *           properties:
 *             products:
 *                type: []
 *                required: false
 *            url:
 *                 type: string
 *               required: false
 *           startDate:
 *             type: string
 *               required: false
 *             endDate:
 *                 type: string
 *                 required: false
 *               date:
 *                type: Date
 *                required: false
 *                title_en:
 *                 type: string
 *                 required: false
 *               title_ar:
 *                 type: string
 *                  required: false
 *                description: Webinar title in Arabic
 *                 example: "مقدمة في تطوير الويب"
 *     responses:
 *       200:
 *         description: Update webinar
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *       500:
 *         description: Update Webinar
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
router.put("/editWebinar/:id", editWebinar);

///Campaign  Routes  admin side
router.post("/addCampaign", addCampaign);
router.patch("/getCampaign", getCampaign);
router.get("/viewCampaign/:id", viewCampaign);
router.delete("/deleteCampaign/:id", deleteCampaign);
router.put("/editCampaign/:id", editCampaign);
router.get("/getAffaliates", getAffiliates);

//! User Side apis
router.patch("/getUserBanner", tokenUserAuth, getUserBanner);
router.patch("/getUserContent", getUserContent);
router.post("/raiseTicket", uploadImage.any(), raiseTicket);
router.patch("/getUserTickets", tokenUserAuth, getUserTickets);

//! Wishlist
/**
 * @swagger
 * /platform/addWishlist/{_id}:
 *   get:
 *     summary: Add product to wish list or delete from wishlist.
 *     tags: [Platform]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: The _id of the product
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
 *         description: Products
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
router.post("/addWishlist", tokenUserAuth, addWishlist);
/**
 * @swagger
 * /platform/getWishList:
 *   patch:
 *     summary: Get products which users added in his wishlist.
 *     tags: [Platform]
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
 *     responses:
 *       200:
 *         description: Products
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
router.patch("/getWishList", tokenUserAuth, getWishList);
router.patch("/removeWishList", tokenUserAuth, removeWishList);

module.exports = router;
