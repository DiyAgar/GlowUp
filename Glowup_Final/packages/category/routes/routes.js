const express = require("express");
const {
  addCategory,
  getCategories,
  editCategory,
  viewCategory,
  deleteCategory,
  changeCategoryStatus,
  categoryDropdown,
  getAllCategories,
} = require("../controller/category");
const {
  addSubCategory,
  getSubCategories,
  viewSubCategory,
  editSubCategory,
  deleteSubCategory,
  changeSubCategoryStatus,
  getAllSubCategories,
  getSubCategoriesList,
} = require("../controller/subCategory");
const {
  addSubSubCategory,
  getSubSubCategories,
  viewSubSubCategory,
  editSubSubCategory,
  deleteSubSubCategory,
  changeSubSubCategoryStatus,
  subSubCategoryDropdown,
  getAllSubSubCategories,
  getSubSubCategoriesList,
} = require("../controller/subSubCategory");
const uploadImage = require("common/helpers/uploadImage");
const tokenUserAuth = require("common/middlewares/tokenUserAuth");
const { subCategoryDropdown } = require("../controller/subCategory");
const {
  addAttribute,
  viewAttribute,
  getAttributes,
  editAttribute,
  changeAttributeStatus,
  deleteAttribute,
  attributeDropdown,
} = require("../controller/attributes");
const {
  addValue,
  getValues,
  editValue,
  changeValueStatus,
  deleteValue,
  valuesDropdown,
  viewValue,
} = require("../controller/values");
const {
  addBrand,
  getBrandList,
  updateBrand,
  viewBrand,
  deleteBrand,
  brandStatus,
  getBrandDropdown,
  getAllBrands,
  brandByProduct,
  getTopDiscountListings,
  getTopDiscountedProducts,
} = require("../controller/brand ");
const router = express.Router();

/**
 * @swagger
 * /user/testAPI:
 *   patch:
 *     summary: this is test api
 *     tags: [Users]
 *     requestBody:
 *       required: false
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
// router.get("/testAPI", testAPI);
// router.post("/signup", signup);

//Category Routes

/**
 *@swagger
 *paths:
 *  /category/addCategory:
 *    post:
 *      summary: Category created
 *      tags: [Category]
 *     description: Category created.
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
 *                name_en:
 *                  type: string
 *                  example: Narendra
 *                name_ar:
 *                  type: string
 *                  format: email
 *                image:
 *                  type: string
 *                  format: binary
 *      responses:
 *        '201':
 *          description: Catgory created  successfully
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
 *      components:
 *        securitySchemes:
 *          x-auth-token-admin:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-admin
 *
 */
router.post("/addCategory", uploadImage.any(), addCategory);

/**
 * @swagger
 * /category/getCategories:
 *   patch:
 *     summary: Retrieve categories based on a search term
 *   tags: [Categories]
 *     requestBody:
 *       required: true
 *             properties:
 *               search:
 *                 type: string
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
router.patch("/getCategories", getCategories);

/**
 *@swagger
 *paths:
 *  /category/viewCategories/:id:
 *    get:
 *      summary: Retrieve category data
 *      tags: [Category]
 *      description: Get category data
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *      responses:
 *        '201':
 *          description:Successfully category get
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
 *         description: Invalid category
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
 *                   example: Invalid category
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
router.get("/viewCategory/:id", viewCategory);

/**
 *@swagger
 *paths:
 *  /auth/editCategories/:id:
 *    post:
 *      summary: Category edit
 *      tags: [Category]
 *     description: Category edit their details.
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
 *                name_en:
 *                  type: string
 *                  example: Narendra
 *                name_ar:
 *                  type: string
 *                  format: email
 *                image:
 *                  type: string
 *                  format: binary
 *      responses:
 *        '201':
 *          description: Catgory updated  successfully
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
 *      components:
 *        securitySchemes:
 *          x-auth-token-admin:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-admin
 *
 */
router.put("/editCategory/:id", uploadImage.any(), editCategory);

/**
 *@swagger
 *paths:
 *  /category/deleteCategories/:id:
 *    get:
 *      summary: Category data  delete
 *      tags: [Category]
 *      description: Deleted category data
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *      responses:
 *        '201':
 *          description:Category data deleted successfully
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
 *         description: Invalid category
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
 *                   example: Invalid category
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
router.delete("/deleteCategory/:id", deleteCategory);

/**
 *@swagger
 *paths:
 *  /category/categoryStatus/:id:
 *    get:
 *      summary: Category enable  disable
 *      tags: []
 *      description:Category enable  disable
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *      responses:
 *        '201':
 *          description:Category enable  disable successfully
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
 *         description: Invalid category
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
 *                   example: Invalid category
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
router.get("/changeCategoryStatus/:id", changeCategoryStatus);
router.get("/categoryDropdown", categoryDropdown);
router.patch("/getAllCategories", getAllCategories);

//Sub Category Routes

/**
 *@swagger
 *paths:
 *  /category/addSubCategory:
 *    post:
 *      summary: Sub Category created
 *      tags: [SubCategory]
 *     description:Sub category created.
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
 *                name_en:
 *                  type: string
 *                  example: Narendra
 *                name_ar:
 *                  type: string
 *                  format: email
 *                image:
 *                  type: string
 *                  format: binary
 *      responses:
 *        '201':
 *          description:Sub Catgory created  successfully
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
 *      components:
 *        securitySchemes:
 *          x-auth-token-admin:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-admin
 *
 */

/**
 * @swagger
 * /category/getSubCategory:
 *   patch:
 *     summary: Retrieve subCategory based on a search term
 *   tags: [subCategory]
 *     requestBody:
 *       required: true
 *             properties:
 *               search:
 *                 type: string
 *                 category:
 *                 type: string
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

/**
 *@swagger
 *paths:
 *  /category/viewSubCategory/:id:
 *    get:
 *      summary: Retrieve sub category data
 *      tags: [SubCategory]
 *      description: Get sub category data
 *      parameters:
 *       - in: header
 *         name: x-auth-token-admin
 *         required: true
 *         description: The authentication token for the admin
 *      responses:
 *        '201':
 *          description:Successfully sub category get
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
 *         description: Invalid Sub category
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
 *                   example: Invalid category
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

/**
 *@swagger
 *paths:
 *  /category/addSubCategory:
 *    post:
 *      summary: Sub Category created
 *      tags: [SubCategory]
 *     description:Sub category created.
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
 *                name_en:
 *                  type: string
 *                  example: Narendra
 *                name_ar:
 *                  type: string
 *                  format: email
 *                image:
 *                  type: string
 *                  format: binary
 *      responses:
 *        '201':
 *          description:Sub Catgory created  successfully
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
 *      components:
 *        securitySchemes:
 *          x-auth-token-admin:
 *            type: apiKey
 *            in: header
 *            name: x-auth-token-admin
 *
 */
router.post("/addSubCategory", uploadImage.any(), addSubCategory);
router.patch("/getSubCategories", getSubCategories);
router.get("/viewSubCategory/:id", viewSubCategory);
router.put("/editSubCategory/:id", uploadImage.any(), editSubCategory);
router.delete("/deleteSubCategory/:id", deleteSubCategory);
router.get("/changeSubCategoryStatus/:id", changeSubCategoryStatus);
router.patch("/subCategoryDropdown", subCategoryDropdown);
router.patch("/getAllSubCategories", getAllSubCategories);
router.put("/getSubCategoriesList",getSubCategoriesList)

///Sub Sub Category Routes

/**
 * @swagger
 * /category/getSubSubCategory:
 *   patch:
 *     summary: Retrieve subSubCategory based on a search term
 *   tags: [subSubcategory]
 *     requestBody:
 *       required: true
 *             properties:
 *               search:
 *                 type: string
 *                 category:
 *                 type: string
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

router.post("/addSubSubCategory", uploadImage.any(), addSubSubCategory);
router.patch("/getSubSubCategory", getSubSubCategories);
router.get("/viewSubSubCategory/:id", viewSubSubCategory);
router.put("/editSubSubCategory/:id", uploadImage.any(), editSubSubCategory);
router.delete("/deleteSubSubCategory/:id", deleteSubSubCategory);
router.get("/changeSubSubCategoryStatus/:id", changeSubSubCategoryStatus);
router.patch("/subSubCategoryDropdown", subSubCategoryDropdown);
router.patch("/getAllSubSubCategories", getAllSubSubCategories);
// router.get("/allSubCategory/:id", allSubCategory);
router.put('/getSubSubCategoriesList',getSubSubCategoriesList)

///Attributes Routes

/**
 * @swagger
 * /category/getAttributes:
 *   patch:
 *     summary: Retrieve attributes based on a search term
 *   tags: [attributes]
 *     requestBody:
 *       required: true
 *             properties:
 *               search:
 *                 type: string
 *                 category:
 *                 type: string
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

router.post("/addAttribute", addAttribute);
router.get("/viewAttribute/:id", viewAttribute);
router.patch("/getAttributes", getAttributes);
router.put("/ediAttribute/:id", editAttribute);
router.get("/changeAttributeStatus/:id", changeAttributeStatus);
router.delete("/deleteAttribute/:id", deleteAttribute);
router.patch("/attributeDropdown", attributeDropdown);

/// Values Routes

/**
 * @swagger
 * /category/getValues:
 *   patch:
 *     summary: Retrieve getValues based on a search term
 *   tags: [values]
 *     requestBody:
 *       required: true
 *             properties:
 *               search:
 *                 type: string
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
router.post("/addValue", addValue);
router.patch("/getValues", getValues);
router.get("/viewValue/:id", viewValue);
router.put("/editValue/:id", editValue);
router.delete("/deleteValue/:id", deleteValue);
router.get("/changeValueStatus/:id", changeValueStatus);
router.patch("/valuesDropdown", valuesDropdown);
// router.patch("/allValues", allValues);

//! User Routes
// router.patch("/get-categories", tokenUserAuth, getAllCategories);
// router.patch("/getAllSubCategories", tokenUserAuth, getAllSubCategories);
// router.patch("/getAllSubSubCategories", tokenUserAuth, getAllSubSubCategories);
// router.get("/get-sub-categories/:id", allSubCategory);
// router.get("/allSubSubCategory/:id", allSubSubCategory);
// router.get("/allAttributes", allAttributes);
// router.get("/allValues", allValues);

//brand management
router.post("/addBrand", uploadImage.any(), addBrand);
router.put("/getBrandList", getBrandList);
router.put("/updateBrand/:id", uploadImage.any(), updateBrand);
router.get("/viewBrand/:id", viewBrand);
router.delete("/deleteBrand/:id", deleteBrand);
router.put("/brandStatus/:id", brandStatus);
router.get("/getBrandDropdown", getBrandDropdown);
router.patch("/getAllBrands", getAllBrands);
router.put('/brandByProduct/:id',brandByProduct)
router.get('/getTopDiscountedProducts',getTopDiscountedProducts)
module.exports = router;
