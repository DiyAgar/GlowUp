const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", false);
mongoose
  // eslint-disable-next-line no-undef
  .connect(process.env.MONGO_URL, {
    maxPoolSize: 100,
  })
  .then(() => console.log("connected to MongoDB database"));
