import express from "express";

import {
    handleViewBlog,
    handleSaveComments,
    handleViewAllBlogs,
    handleMyBlogs,
    handleMyComments,
    handleViewSearchPage,
    handleSearchBlogs,
    handleViewProfile,
    handleFollowProfie,
    handleUnfollowProfie,
} from "../controllers/home.js";


const router = express.Router();

router.get("/", handleViewAllBlogs);
router.get("/view-blog/:blogId", handleViewBlog);
router.post("/comments/:blogId", handleSaveComments);
router.get("/view-all-blogs/:username", handleViewAllBlogs);
router.get("/view-my-blogs/:username", handleMyBlogs);
router.get("/view-my-comments/:username", handleMyComments);
router.get("/search-page/:username", handleViewSearchPage);
router.post("/search", handleSearchBlogs);
router.get("/:username/view-profile/:profileId", handleViewProfile);
router.get("/:username/follow-profile/:profileId", handleFollowProfie);
router.get("/:username/unfollow-profile/:profileId", handleUnfollowProfie);


export default router;