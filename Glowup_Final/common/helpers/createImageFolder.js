const fs = require("fs");

fs.exists("./public", function (exist) {
  if (exist) {
    // console.log("File created");
    return;
  } else {
    fs.mkdir("./public", { recursive: true }, function (err) {
      if (err) {
        console.log(err);
        console.log("Error in file creation");
      }
    });
    return;
  }
});
