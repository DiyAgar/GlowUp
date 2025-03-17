const { getText } = require("common/language/lang");
const Device = require("common/models/deviceSchema");
const UserNotification = require("../models/notificationSchema");
const Error = require("common/models/errorSchema");
// const admin = require("firebase-admin");
// const serviceAccount = require("../config/firebase.json");
// const { getText } = require("common/language/lang");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

exports.sendNotificationUser = async (type, data, userId) => {
  try {
    console.log(getText("WELCOME_TITLE", "English"));
    console.log(getText("ORDER_PLACED_PUSH_TITLE", "English"));
    const devices = await Device.find({ user: userId }).populate({
      path: "user",
      select: "fullName",
    });
    let url = "";
    await UserNotification.create({
      user: userId,
      title_en: getText("ORDER_PLACED_PUSH_TITLE", "English"),
      body_en: getText("ORDER_PLACED_PUSH_BODY", "English"),
      title_ar: getText("ORDER_PLACED_PUSH_TITLE", "Arabic"),
      body_ar: getText("ORDER_PLACED_PUSH_BODY", "Arabic"),
      url: url,
    });

    for (const device of devices) {
      let title = "";
      let body = "";
      let url = "";
      if (type === "LOGIN") {
        title = getText("LOGIN_PUSH_TITLE", device.language);
        body = getText("LOGIN_PUSH_BODY", device.language, {
          name: devices.user.fullName,
        });
      } else if (type === "ORDER_PLACED") {
        title = getText("ORDER_PLACED_PUSH_TITLE", device.language);
        body = getText("ORDER_PLACED_PUSH_BODY", device.language, {
          name: devices.user.fullName,
        });
      } else {
        title = getText("WELCOME_PUSH_TITLE", device.language);
        body = getText("WELCOME_PUSH_BODY", device.language, {
          name: devices.user.fullName,
        });
      }
      // data.count = String(0);
      // if (device.fcmToken) {
      //   const message = {
      //     token: device.fcmToken,
      //     data: { ...data },
      //     notification: {
      //       title: title,
      //       body: body,
      //       // imageUrl: `${process.env.BASEURL}/logo.png`,
      //     },
      //     apns: {
      //       payload: {
      //         aps: {
      //           // badge: (messageCount ?? 0) + count,
      //           sound: "default",
      //           mutableContent: true,
      //           category: "CustomSamplePush",
      //         },
      //       },
      //     },
      //     android: {
      //       priority: "high",
      //       ttl: 60 * 60 * 24,
      //       data: { ...data },
      //       notification: {
      //         title: title,
      //         body: body,
      //         // icon: `${process.env.BASEURL}/logo.png`,
      //         sound: "default",
      //         // channelId: "app_notification",
      //         defaultSound: true,
      //         defaultLightSettings: true,
      //         // notificationCount: (messageCount ?? 0) + count,
      //         visibility: "public",
      //       },
      //     },
      //     webpush: {
      //       data: { ...data, link: url },
      //       notification: {
      //         title: title,
      //         body: body,

      //         // badge: `${process.env.BASEURL}/logo.png`,

      //         // icon: `${process.env.BASEURL}/logo.png`,
      //         dir: "auto",
      //         vibrate: true,
      //         data: { ...data, link: url },
      //       },
      //       fcmOptions: {
      //         link: url,
      //       },
      //     },
      //   };
      //   if (data.url) {
      //     message.apns.fcmOptions = {
      //       imageUrl: data.url,
      //     };
      //     message.android.notification.imageUrl = data.url;
      //     message.webpush.notification.image = data.url;
      //   }
      //   // admin
      //   //   .messaging()
      //   //   .send(message)
      //   //   .then((response) => {
      //   //     console.log(response);
      //   //     return;
      //   //   })
      //   //   .catch((error) => {
      //   //     console.log(error);
      //   //   });
      // }
    }

    return;
  } catch (err) {
    console.log(err);
    await Error.create({
      // user: req?.user?._id,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "/sendNotificationUser",
    });
    return;
  }
};
