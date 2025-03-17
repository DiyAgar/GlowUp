// eslint-disable-next-line no-undef
global.__basedir = __dirname;
require("dotenv").config();
const app = require("./App");
require("../../common/databases/mongodb");
require("../../common/helpers/createImageFolder");
// eslint-disable-next-line no-undef
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`User - listening on port ${port}...`);
});
