import express from "express";
import {
  handleRegisterUser,
  handleLoginUser,
  handleLogoutUser,
} from "../controllers/login-register.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, path.resolve(`./public/uploads/profile-images`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
})
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/register-user", upload.single("profileImg"), handleRegisterUser);
router.post("/login-user", handleLoginUser);
router.get("/logout", handleLogoutUser);

export default router;
