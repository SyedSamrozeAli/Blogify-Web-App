import express from "express";
import {
  handleOpenDashboard,
  handleCreatePost,
  handleViewPost,
  renderToCreatePost,
  renderToDeletePost,
  handleDeletePost,
  renderToUpdatePost,
  handleGetUpdatePostForm,
  handleUpdatePost,
  handleUpdateProfile,
  renderToUpdateProfile,
} from "../controllers/dashboard.js";

const router = express.Router();


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

router.get("/:username", handleOpenDashboard);

//POST Creation
router.post("/create-post/:username", handleCreatePost);
router.get("/create-post/:username", renderToCreatePost);

// POST View
router.get("/view-post/:username", handleViewPost);

//POST Update
router.post("/update-post/:username/:blogId", handleUpdatePost);
router.post("/update-post-form/:username", handleGetUpdatePostForm);
router.get("/update-post/:username", renderToUpdatePost);

//POST Delete
router.get("/delete-post/:username", renderToDeletePost);
router.post("/delete-post/:username", handleDeletePost);

router.get("/update-profile/:username", renderToUpdateProfile);
router.post("/update-profile/:username", upload.single("profileImg"), handleUpdateProfile);

export default router;
