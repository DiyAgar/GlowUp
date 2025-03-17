// const fs = require("fs");
// const path = require("path");
// const detectPlatforms = require("./detectors.js");
// require("dotenv").config();
// // eslint-disable-next-line no-undef
// const staticFolder = path.join(__dirname, "../templates");

// const dynamicLink = async (req, res, type, id) => {
//   const config = [
//     {
//       path: `/user/${id}`,
//       targets: {
//         android: {
//           appName: "OfferYard",
//           // eslint-disable-next-line no-undef
//           appPackage: process.env.ANDROID_PACKAGE_NAME,
//           appPath: `user?id=${id}`,
//           fallback: "https://play.google.com/store/games",
//         },
//         ios: {
//           appName: "OfferYard",
//           appPath: `user?id=${id}`,
//           fallback: "https://www.apple.com/in/app-store/",
//         },
//         // eslint-disable-next-line no-undef
//         default: `${process.env.WEBBASEURL}/public-profile/${user._id}`,
//       },
//     },
//   ];
//   // const config = JSON.parse(process.env.CONFIG ?? '[]')

//   if (config.length === 0) {
//     throw new Error("CONFIG environment variable must be set");
//   }
//   console.log(req.path);
//   const targets = config.find(({ path }) => path === req.path)?.targets;
//   if (!targets) {
//     console.log(`No targets for path ${req.path}`);
//     return res.empty();
//   }
//   console.log(`Found targets for path ${req.path}`);

//   const platforms = detectPlatforms(req.headers["user-agent"]);
//   console.log(`Detected platforms: ${platforms.join(", ")}`);

//   for (const platform of platforms) {
//     const target = targets[platform];
//     if (!target) {
//       console.log(`No redirect for platform ${platform}`);
//       continue;
//     }

//     if (platform === "default") {
//       console.log(`Default for platform ${platform}`);
//       return res.redirect(targets.default);
//     }

//     if (typeof target === "string") {
//       console.log(`Simple redirect to ${target}`);
//       return res.redirect(target);
//     }

//     if (typeof target === "object" && target.appName) {
//       console.log(
//         `Deep link to app=${target.appName} package=${target.appPackage} path=${target.appPath}`,
//       );

//       const template = fs
//         .readFileSync(path.join(staticFolder, "deeplink.html"))
//         .toString();

//       const html = template
//         .split("{{APP_NAME}}")
//         .join(target.appName)
//         .split("{{APP_PATH}}")
//         .join(target.appPath)
//         .split("{{APP_PACKAGE}}")
//         .join(target.appPackage ?? "")
//         .split("{{FALLBACK}}")
//         .join(target.fallback ?? target.default ?? "");

//       return res.send(html, 200, {
//         "Content-Type": "text/html; charset=utf-8",
//       });
//     }
//   }

//   console.log(`Out of ideas, returning empty response`);
//   return res.empty();
// };

// module.exports = { dynamicLink };
