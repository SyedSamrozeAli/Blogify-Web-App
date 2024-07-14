import express from "express";

const router = express.Router();

import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

router.get("/", (req, res) => {
  res.sendFile(__dirname + "/HTML Files/index.html");
});

router.get("/login", (req, res) => {
  // const path = url.parse(req.url).pathname;
  console.log(path);
  if (path == "/register-user") {
    path = "";
    res.render("login.ejs", { successMsg: "User registered successfully!" });
  } else {
    res.render("login.ejs");
  }
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});
