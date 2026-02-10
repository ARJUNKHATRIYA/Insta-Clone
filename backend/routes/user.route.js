import express from "express";
import { editProfile,sendFollowRequest,acceptFollowRequest,followBackUser, searchUsers,rejectFollowRequest,unfollowUser, getProfile, getSuggestedUsers, login, logout, register,getFollowingUsers,getFollowers,getFollowing } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getMyNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePhoto'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route("/following").get(isAuthenticated, getFollowingUsers);
router.route("/follow/request/:id").post(isAuthenticated, sendFollowRequest);
router.route("/follow/accept/:id").post(isAuthenticated, acceptFollowRequest);
router.route("/follow/reject/:id").post(isAuthenticated, rejectFollowRequest);
router.route("/unfollow/:id").post(isAuthenticated, unfollowUser);
router.route("/notifications").get(isAuthenticated, getMyNotifications);
router.get("/:id/followers", isAuthenticated, getFollowers);
router.get("/:id/following", isAuthenticated, getFollowing);
router.post("/follow/back/:id", isAuthenticated, followBackUser);
// routes/user.route.js
router.get("/search", isAuthenticated, searchUsers);



export default router;