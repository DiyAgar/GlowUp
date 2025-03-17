const { I18n } = require("i18n");
const path = require("path");

const i18n = new I18n({
  locales: ["en", "ar"],
  defaultLocale: "en",
  directory: path.join("./", "locales"),
});

const getText = (text, language, data) => {
  try {
    const lang = language == "Arabic" ? "ar" : "en";
    if (data) {
      return i18n.__(
        {
          phrase: text,
          locale: lang,
        },
        data,
      );
    } else {
      return i18n.__({
        phrase: text,
        locale: lang,
      });
    }
  } catch (err) {
    console.log(err);
    return "";
  }
};

module.exports = { getText };
