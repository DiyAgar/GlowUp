const express = require("express");
const passport = require("passport");
const {
  adminSignup,
  adminLogin,
  adminForgetPassword,
  adminVerifyOtp,
  updatePassword,
  getAdminData,
  editProfile,
  changePassword,
} = require("../controller/adminAuth");
const languageToken = require("common/middlewares/languageToken");
const tokenUserAuth = require("common/middlewares/tokenUserAuth");
const tokenAdminAuth = require("common/middlewares/tokenAdminAuth");
const uploadImage = require("common/helpers/uploadImage");
const {
  signin,
  verifyOTP,
  getUser,
  editUserProfile,
  changeLanguage,
  logout,
  updateFCM,
  deleteUser,
  verifyReferralCode,
} = require("../controller/userAuth");
const router = express.Router();

//TODO -> User APIs
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Signup user to platform.
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-auth-language
 *         required: true
 *         description: The token required for user's language
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *                fullName:
 *                  type: string
 *                  example: Rahul
 *                dateOfBirth:
 *                  type: string
 *                  format: date
 *                  example: 2024-12-12
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rahulyadav@techgropse.com
 *                countryCode:
 *                  type: string
 *                  example: "91"
 *                phoneNumber:
 *                  type: string
 *                  example: "9876119876"
 *                gender:
 *                  type: string
 *                  enum: [Male, Female, Other]
 *                  example: Male
 *                password:
 *                  type: string
 *                  format: password
 *                  example: "12345678"
 *                image:
 *                  type: string
 *                  format: binary
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

// router.post("/signup", languageToken, uploadImage.any(), signup);

/**
 *@swagger
 *paths:
 *  /auth/login:
 *    post:
 *      summary: User login
 *      tags: [Auth]
 *      description: Allows a new user to login to Aswaq.
 *      parameters:
 *       - in: header
 *         name: x-auth-language
 *         required: false
 *         enum:
 *            English
 *            Arabic
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                  description: provided by social media profile
 *                provider:
 *                  type: string
 *                  description: provided by social media profile
 *                fullName:
 *                  type: string
 *                  example: Rahul
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rahulyadav@techgropse.com
 *                countryCode:
 *                  type: string
 *                  example: "91"
 *                phoneNumber:
 *                  type: string
 *                  example: "9876119876"
 *                image:
 *                  type: string
 *                  example: url
 *                deviceId:
 *                  type: string
 *                  required: false
 *                deviceOS:
 *                  type: string
 *                  required: false
 *                language:
 *                  type: string
 *                  enum:
 *                    -English
 *                    -Arabic
 *                  required: false
 *                buildNumber:
 *                  type: string
 *                  required: false
 *                deviceName:
 *                  type: string
 *                  required: false
 *                fcmToken:
 *                  type: string
 *                  required: false
 *      responses:
 *        '201':
 *          description: User successfully signed up
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
 *        - x-auth-token-user: []
 *
 *      components:
 *        securitySchemes:
 *          x-auth-token-user:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-user
 *
 */
/**
 *@swagger
 *paths:
 *  /auth/socialLogin:
 *    post:
 *      summary: User social login
 *      tags: [Auth]
 *      description: Allows a new user to login or signup up with their social media profiles.
 *      parameters:
 *       - in: header
 *         name: x-auth-token-user
 *         required: false
 *         description: The authentication token for the user
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                  description: provided by social media profile
 *                provider:
 *                  type: string
 *                  description: provided by social media profile
 *                fullName:
 *                  type: string
 *                  example: Rahul
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rahulyadav@techgropse.com
 *                countryCode:
 *                  type: string
 *                  example: "91"
 *                phoneNumber:
 *                  type: string
 *                  example: "9876119876"
 *                image:
 *                  type: string
 *                  example: url
 *                deviceId:
 *                  type: string
 *                  required: false
 *                deviceOS:
 *                  type: string
 *                  required: false
 *                language:
 *                  type: string
 *                  enum:
 *                    -English
 *                    -Arabic
 *                  required: false
 *                buildNumber:
 *                  type: string
 *                  required: false
 *                deviceName:
 *                  type: string
 *                  required: false
 *                fcmToken:
 *                  type: string
 *                  required: false
 *      responses:
 *        '201':
 *          description: User successfully signed up
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
 *        - x-auth-token-user: []
 *
 *      components:
 *        securitySchemes:
 *          x-auth-token-user:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-user
 *
 */
router.put("/signin", signin);
router.put("/verifyOTP", languageToken, verifyOTP);
router.get("/getUser", tokenUserAuth, getUser);
router.put(
  "/editUserProfile",
  tokenUserAuth,
  uploadImage.any(),
  editUserProfile,
);
router.put("/updateFCM", tokenUserAuth, updateFCM);
router.patch("/changeLanguage", tokenUserAuth, changeLanguage);
router.get("/logout", tokenUserAuth, logout);
router.patch("/deleteUser", tokenUserAuth, deleteUser);
router.put("/verifyReferralCode",verifyReferralCode)

//TODO -> Admin APIs

/**
 *@swagger
 *paths:
 *  /auth/admin-signup:
 *    post:
 *      summary: admin signup
 *      tags: [Auth]
 *     description: Allows a new admin to sign up with their details.
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                fullName:
 *                  type: string
 *                  example: Narendra
 *                email:
 *                  type: string
 *                  format: email
 *      responses:
 *        '201':
 *          description: admin successfully signup
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
router.post("/admin-signup", adminSignup);

/**
 *@swagger
 *paths:
 *  /auth/admin-login:
 *    put:
 *      summary: Admin login
 *      tags: [Auth]
 *      description: Allows a new admin to login to Aswaq.
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: false
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rahulyadav@techgropse.com
 *      responses:
 *        '201':
 *          description: Admin successfully signed up
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
router.put("/admin-login", adminLogin);

/**
 *@swagger
 *paths:
 *  /auth/admin-forgetPassword:
 *    put:
 *      summary: Admin forget password
 *      tags: [Auth]
 *      description: Allows a admin forget password to Aswaq.
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: false
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rahulyadav@techgropse.com
 *      responses:
 *        '201':
 *          description: Admin successfully forget password
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
router.put("/admin-forgetPassword", adminForgetPassword);
router.put('/changePassword',tokenAdminAuth, changePassword)
/**
 *@swagger
 *paths:
 *  /auth/admin-verifyOTP:
 *    put:
 *      summary: Admin verify otp
 *      tags: [Auth]
 *      description: Allows a admin verify otp  to Aswaq.
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: false
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rahulyadav@techgropse.com
 *                  otp:
 *                  type: number
 *                  format: number
 *      responses:
 *        '201':
 *          description: Admin successfully verify otp
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
router.put("/admin-verifyOTP", adminVerifyOtp);

/**
 *@swagger
 *paths:
 *  /auth/admin-updatePassword:
 *    put:
 *      summary: Admin update password
 *      tags: [Auth]
 *      description: Allows a update password   to Aswaq.
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: false
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rahulyadav@techgropse.com
 *      responses:
 *        '201':
 *          description: Admin successfully update password
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
router.put("/admin-updatePassword", updatePassword);

/**
 *@swagger
 *paths:
 *  /auth/getAdmin:
 *    get:
 *      summary: Retrieve admin data by token
 *      tags: [Auth]
 *      description: Get admin data by token
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *      responses:
 *        '201':
 *          description: Admin successfully update password
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
 *         description: Invalid Admin
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
 *                   example: Invalid Admin
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
router.get("/getAdmin", tokenAdminAuth, getAdminData);

/**
 *@swagger
 *paths:
 *  /auth/editAdmin:
 *    post:
 *      summary: admin edit
 *      tags: [Auth]
 *     description: Admin edit their details.
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *          content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  example: Narendra
 *                email:
 *                  type: string
 *                  format: email
 *                mobileNumber:
 *                  type: number
 *                  format: email
 *                image:
 *                  type: string
 *                  format: binary
 *      responses:
 *        '201':
 *          description: admin profile updated
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
router.put("/editAdmin", tokenAdminAuth,uploadImage.any(), editProfile);

module.exports = router;
