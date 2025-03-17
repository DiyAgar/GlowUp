const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const initializeFBPassport = require("./helpers/initializePassport");
initializeFBPassport();

const routes = require("./routes/routes");
const swaggerJsdoc = require("swagger-jsdoc");
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(compression());
app.use(express.urlencoded({ extended: true })); //for parsing body of HTML Forms
app.use(express.static("./public")); //for serving static contenct in public folder
// eslint-disable-next-line no-undef
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(morgan("tiny"));
app.use(
  session({
    // eslint-disable-next-line no-undef
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", routes);

app.use(
  morgan("common", {
    // eslint-disable-next-line no-undef
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
      flags: "a",
    }),
  }),
);
app.use(
  morgan("common", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
    // eslint-disable-next-line no-undef
    stream: fs.createWriteStream(path.join(__dirname, "error.log"), {
      flags: "a",
    }),
  }),
);
app.get("/auth", (req, res) => {
  console.log("Hello");
  res.status(200).send("Welcome to Glow up auth service");
});

// Swagger JSDoc configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth Service API",
      version: "1.0.0",
      description: "API documentation for Auth Service",
    },
  },
  tags: [
    {
      name: "Auth",
      description: "API operations related to Authentication",
    },
  ],
  apis: ["./routes/*.js"], // Path to the API docs (JSDoc comments)
};

app.get("/swagger.json", (req, res) => {
  const swaggerSpec = swaggerJsdoc(options);
  res.json(swaggerSpec);
});

module.exports = app;
