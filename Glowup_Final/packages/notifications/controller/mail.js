const nodemailer = require("nodemailer");

const sendMail = async (to, subject, body, attachments) => {
  const transporter = nodemailer.createTransport({
    // eslint-disable-next-line no-undef
    host: process.env.MAIL_SERVER_HOST,
    port: 587,
    secure: false,
    // console: true,
    // ignoreTLS: false,
    requireTLS: true,
    tls: { rejectUnauthorized: false },
    auth: {
      // eslint-disable-next-line no-undef
      user: process.env.MAIL_SERVER_ID,
      // eslint-disable-next-line no-undef
      pass: process.env.MAIL_SERVER_PASSWORD,
    },
  });

  console.debug("To " + to);
  console.debug("Subject " + subject);
  console.debug("Body " + body);

  var mailOptions = {
    // eslint-disable-next-line no-undef
    from: { name: "Glow Up", address: process.env.MAIL_SERVER_ID },
    to: to,
    subject: subject,
    text: body,
    html: body,
  };
  if (attachments) mailOptions.attachments = JSON.parse(attachments);

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      console.error("Exception", error);
    } else {
      console.info("Email sent: " + info.response);
    }
    return;
  });
};

module.exports = { sendMail };
