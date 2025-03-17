const multer = require("multer");

const uploadImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public`);
    },
    filename: function (req, file, cb) {
      console.log(file);
      const name = file.originalname.split(" ").join("-").split(".")[0];
      let extArray = file.mimetype.split("/");
      let ext = extArray[extArray.length - 1];
      if (ext == "*") {
        extArray = file.originalname.split(".");
        ext = extArray[extArray.length - 1];
      }
      cb(null, name + Date.now().toString() + `.${ext}`);
    },
  }),
});

module.exports = uploadImage;
