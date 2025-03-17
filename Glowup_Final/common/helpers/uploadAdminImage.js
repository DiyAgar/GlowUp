const multer = require("multer");
require("dotenv").config();
// const fs = require("fs");

function createAdminImagePath(req, res, next) {
  console.log("Create Path FUnction");
  // fs.exists(`./public`, function (exists) {
  //   if (exists) {
  //     next();
  //   } else {
  //     fs.mkdir(`./public`, { recursive: true }, function (err) {
  //       if (err) {
  //         console.log("Error in folder creation");
  //         next();
  //       }
  //       next();
  //     });
  //   }
  // });
  next();
}
module.exports.createAdminImagePath = createAdminImagePath;

// const uploadAdminImage = multer({
//   storage: multerS3({
//     s3: s3,
//     acl: "public-read",
//     bucket: config.get("s3_bucket_name"),
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       let extArray = file.mimetype.split("/");
//       let ext = extArray[extArray.length - 1];
//       console.log(`ext ->> `, "avif", ` file.fieldname ->> `, file.fieldname);
//       cb(null, `Admin/` + Date.now().toString() + "." + "avif");
//     },
//   }),
// });

const uploadAdminImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public`);
    },
    filename: function (req, file, cb) {
      console.log(file);
      let extArray = file.mimetype.split("/");
      let ext = extArray[extArray.length - 1];
      cb(null, Date.now().toString() + `.${ext}`);
    },
  }),
});

module.exports.uploadAdminImage = uploadAdminImage;
