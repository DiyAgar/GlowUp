const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
require("dotenv").config();
const s3Client = new S3Client({
  // eslint-disable-next-line no-undef
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    // eslint-disable-next-line no-undef
    accessKeyId: process.env.S3_ACCESS_KEY,
    // eslint-disable-next-line no-undef
    secretAccessKey: process.env.S3_ACCESS_SECRET,
  },
  sslEnabled: false,
  forcePathStyle: true,
  signatureVersion: "v4",
});

const uploadFileToS3 = async (param) => {
  try {
    param.CacheControl = "max-age=31536000";
    const command = new PutObjectCommand(param);
    const data = await s3Client.send(command);
    // data.Location = data.Location.replace(
    //   "http://s3.me-south-1.amazonaws.com/offeryard-media",
    //   // eslint-disable-next-line no-undef
    //   process.env.CLOUDFRONTURL,
    // );
    // eslint-disable-next-line no-undef
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${param.Key}`;
    return {
      ...data,
      ...{ Location: url },
    };
  } catch (err) {
    console.log(err);
  }
};

const deleteFileWithRetry = (path, retries = 3, delay = 1000) => {
  fs.unlink(path, (err) => {
    if (err) {
      if (err.code === "EBUSY" && retries > 0) {
        console.log(`Retrying to delete ${path}...`);
        setTimeout(() => deleteFileWithRetry(path, retries - 1, delay), delay);
      } else {
        console.error(`Failed to delete ${path}:`, err);
      }
    } else {
      console.log(`${path} deleted successfully`);
    }
  });
};

const compressImage = async (file, size, format, quality) => {
  try {
    if (format == "jpg") {
      const jpg = await sharp(path.join("./public/", file.filename))
        .jpeg({ quality: 80 })
        .toBuffer();
      return jpg;
    } else {
      let webp;
      if (size == 200) {
        webp = await sharp(path.join("./public/", file.filename))
          .resize({
            width: 200,
            height: 200,
          })
          .webp({ quality: 40 })
          .toBuffer();
      } else if (size == 300) {
        webp = await sharp(path.join("./public/", file.filename))
          .resize({
            width: 300,
            height: 300,
          })
          .webp({ quality: 40 })
          .toBuffer();
      } else if (size == 1) {
        webp = await sharp(path.join("./public/", file.filename))
          .webp({ quality: +quality })
          .toBuffer();
      } else {
        webp = await sharp(path.join("./public/", file.filename))
          .webp({ quality: 40 })
          .toBuffer();
      }
      return webp;
    }
  } catch (err) {
    console.log(err);
  }
};

const getImageMetaData = async (file) => {
  try {
    const metadata = await sharp(
      path.join("./public/", file.filename),
    ).metadata();
    return metadata;
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  uploadFileToS3,
  compressImage,
  getImageMetaData,
  deleteFileWithRetry,
};
