import express from "express";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import url from "url";
import cookieParser from "cookie-parser";
import connectMongoDb from "./MongooseConnection.js";

import { restrictToLoggedInUserOnly } from "./middleware/auth.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import loginRegisterRoutes from "./routes/login-register-routes.js";
import homeRoutes from "./routes/home-routes.js";

connectMongoDb("mongodb://127.0.0.1:27017/Blogify-Database");

const app = express();
const PORT = 8000;
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// STATIC Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/HTML Files/index.html");
});

app.get("/login", (req, res) => {
  const queryPara = url.parse(req.url, true).query;

  if (queryPara.sucess)
    //if /login/?sucess=true
    res.render("login.ejs", { successMsg: "User registered successfully!" });

  res.render("login.ejs");

  //false wala case router mei handle krdia ha
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.use("/user", loginRegisterRoutes);
app.use("/dashboard", restrictToLoggedInUserOnly, dashboardRoutes);
app.use("/home", restrictToLoggedInUserOnly, homeRoutes);

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
