import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

import {
    addNewReel,
    getAllReel,
    getUserReel,
    likeReel,
    dislikeReel,
    addComment,
    getCommentsOfReel,
    deleteReel,
    bookmarkReel
} from "../controllers/reel.controller.js";

const router = express.Router();

// ADD REEL
router.route("/addreel")
    .post(isAuthenticated, upload.single("media"), addNewReel);

// GET ALL REELS (FEED)
router.route("/all")
    .get(isAuthenticated, getAllReel);

// GET USER REELS
router.get("/userreel/:id", isAuthenticated, getUserReel);


// LIKE / DISLIKE
router.route("/:id/like")
    .get(isAuthenticated, likeReel);

router.route("/:id/dislike")
    .get(isAuthenticated, dislikeReel);

// COMMENTS
router.route("/:id/comment")
    .post(isAuthenticated, addComment);

router.route("/:id/comment/all")
    .post(isAuthenticated, getCommentsOfReel);

// DELETE REEL
router.route("/delete/:id")
    .delete(isAuthenticated, deleteReel);

// BOOKMARK REEL
router.route("/:id/bookmark")
    .get(isAuthenticated, bookmarkReel);

export default router;
