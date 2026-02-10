import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email }).select("-password");
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            // followers: user.followers,
            // following: user.following,
            followers: user.followers.map(id => id.toString()),
            following: user.following.map(id => id.toString()),
            posts: populatedPosts,
            bookmarks: user.bookmarks || [],
            reelBookmarks: user.reelBookmarks || []
        }
        return res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });



    } catch (error) {
        console.log(error);
    }
};

export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId)
            .select("-password")

            // POSTS
            .populate({
                path: "posts",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "comments",
                    populate: {
                        path: "author",
                        select: "username profilePicture"
                    }
                }
            })

            // REELS
            .populate({
                path: "reels",
                options: { sort: { createdAt: -1 } },
                populate: [
                    {
                        path: "author",
                        select: "username profilePicture"
                    },
                    {
                        path: "comments",
                        populate: {
                            path: "author",
                            select: "username profilePicture"
                        }
                    }
                ]
            })
            .populate("followers", "username profilePicture")
            .populate("following", "username profilePicture")
            // SAVED POSTS
            .populate("bookmarks")

            // SAVED REELS
            .populate({
                path: "reelBookmarks",
                populate: {
                    path: "author",
                    select: "username profilePicture"
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.log("getProfile error:", error);
        res.status(500).json({ success: false });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;

        // get logged-in user
        const loggedInUser = await User.findById(loggedInUserId);

        if (!loggedInUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const suggestedUsers = await User.find({
            _id: {
                $ne: loggedInUserId,              // not me
                $nin: loggedInUser.following      // not already followed
            }
        }).select("-password");

        return res.status(200).json({
            success: true,
            users: suggestedUsers,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
// controller

export const sendFollowRequest = async (req, res) => {
    const senderId = req.id;
    const receiverId = req.params.id;

    if (senderId === receiverId) {
        return res.status(400).json({ success: false });
    }

    const receiver = await User.findById(receiverId);

    if (receiver.followRequests.includes(senderId)) {
        return res.json({ success: false, message: "Already requested" });
    }

    // receiver.followRequests.push(senderId);
    // await receiver.save();
    await User.updateOne(
        { _id: receiverId },
        { $addToSet: { followRequests: senderId } }
    );


    // ✅ SAVE NOTIFICATION
    const notification = await Notification.create({
        receiver: receiverId,
        sender: senderId,
        type: "follow_request"
    });

    // 🔔 REALTIME SOCKET
    const io = getIO();
    const socketId = getReceiverSocketId(receiverId);
    if (socketId) {
        const populatedNotification = await Notification.findById(notification._id)
            .populate("sender", "username profilePicture");

        io.to(socketId).emit("notification", {
            _id: populatedNotification._id,
            type: populatedNotification.type,
            senderDetails: populatedNotification.sender
        });

    }

    res.json({ success: true, message: "Follow request sent" });
};

// export const acceptFollowRequest = async (req, res) => {
//     try {
//         const receiverId = req.id;      // User B
//         const senderId = req.params.id; // User A

//         // remove request
//         await User.updateOne(
//             { _id: receiverId },
//             { $pull: { followRequests: senderId } }
//         );

//         // one-way follow A → B
//         await Promise.all([
//             User.updateOne(
//                 { _id: receiverId },
//                 { $addToSet: { followers: senderId } }
//             ),
//             User.updateOne(
//                 { _id: senderId },
//                 { $addToSet: { following: receiverId } }
//             )
//         ]);

//         // fetch BOTH users (important)
//         const receiver = await User.findById(receiverId)
//             .populate("followers", "username profilePicture")
//             .populate("following", "username profilePicture");

//         const sender = await User.findById(senderId)
//             .populate("followers", "username profilePicture")
//             .populate("following", "username profilePicture");

//         const notification = await Notification.create({
//             receiver: senderId,   // User A
//             sender: receiverId,   // User B
//             type: "follow_accept"
//         });

//         const io = getIO();
//         const socketId = getReceiverSocketId(senderId);
//         if (socketId) {
//             io.to(socketId).emit("notification", {
//                 _id: notification._id,
//                 type: "follow_accept",
//                 senderDetails: {
//                     _id: receiverId,
//                     username: receiver.username,
//                     profilePicture: receiver.profilePicture
//                 }
//             });
//         }


//         return res.json({
//             success: true,
//             receiver,
//             sender
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false });
//     }
// };


export const rejectFollowRequest = async (req, res) => {
    try {
        const userId = req.id;
        const senderId = req.params.id;

        if (!senderId) {
            return res.status(400).json({
                success: false,
                message: "Invalid sender id"
            });
        }

        await User.updateOne(
            { _id: userId },
            { $pull: { followRequests: senderId } }
        );

        await Notification.deleteMany({
            receiver: userId,
            sender: senderId,
            type: "follow_request"
        });

        res.json({ success: true, message: "Follow request rejected" });

    } catch (err) {
        console.error("rejectFollowRequest error:", err);
        res.status(500).json({ success: false });
    }
};

export const unfollowUser = async (req, res) => {
    const userId = req.id;          // A
    const targetId = req.params.id; // B

    await Promise.all([
        // A unfollows B
        User.updateOne(
            { _id: userId },
            { $pull: { following: targetId } }
        ),

        // B loses follower A
        User.updateOne(
            { _id: targetId },
            { $pull: { followers: userId } }
        )
    ]);

    res.json({ success: true });
};

export const getFollowingUsers = async (req, res) => {
    try {
        const user = await User.findById(req.id)
            .populate("following", "-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            users: user.following,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// GET FOLLOWERS OF A USER
export const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("followers", "username profilePicture");

        if (!user) {
            return res.status(404).json({ success: false });
        }

        res.json({
            success: true,
            users: user.followers
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
};

// GET FOLLOWING OF A USER
export const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("following", "username profilePicture");

        if (!user) {
            return res.status(404).json({ success: false });
        }

        res.json({
            success: true,
            users: user.following
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
};

// export const followBackUser = async (req, res) => {
//     try {
//         const userId = req.id;        // B
//         const targetId = req.params.id; // A

//         await Promise.all([
//             User.updateOne(
//                 { _id: userId },
//                 { $addToSet: { following: targetId } }
//             ),
//             User.updateOne(
//                 { _id: targetId },
//                 { $addToSet: { followers: userId } }
//             )
//         ]);

//         const updatedUser = await User.findById(userId)
//             .populate("followers", "username profilePicture")
//             .populate("following", "username profilePicture");

//         res.json({ success: true, user: updatedUser });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false });
//     }
// };

// export const acceptFollowRequest = async (req, res) => {
//     try {
//         const receiverId = req.id;      // User B (who accepts)
//         const senderId = req.params.id; // User A (who sent request)

//         console.log("=== ACCEPT FOLLOW REQUEST ===");
//         console.log("User B (receiver):", receiverId);
//         console.log("User A (sender):", senderId);

//         // Remove follow request
//         await User.updateOne(
//             { _id: receiverId },
//             { $pull: { followRequests: senderId } }
//         );

//         // Create one-way follow (A → B)
//         await Promise.all([
//             User.updateOne(
//                 { _id: receiverId },
//                 { $addToSet: { followers: senderId } }
//             ),
//             User.updateOne(
//                 { _id: senderId },
//                 { $addToSet: { following: receiverId } }
//             )
//         ]);

//         console.log("✅ User A now follows User B");

//         // ✅ CRITICAL FIX: Fetch FRESH data from database
//         const receiver = await User.findById(receiverId)
//             .select("-password -__v");

//         console.log("User B followers (after accept):", receiver.followers.map(f => f.toString()));
//         console.log("User B following (after accept):", receiver.following.map(f => f.toString()));

//         // ✅ Format for frontend - PLAIN IDs ONLY
//         const formattedReceiver = {
//             _id: receiver._id.toString(),
//             username: receiver.username,
//             email: receiver.email,
//             profilePicture: receiver.profilePicture,
//             bio: receiver.bio,
//             gender: receiver.gender,
//             followers: receiver.followers.map(f => f.toString()),
//             following: receiver.following.map(f => f.toString()),
//             posts: receiver.posts,
//             reels: receiver.reels,
//             bookmarks: receiver.bookmarks || [],
//             reelBookmarks: receiver.reelBookmarks || []
//         };

//         console.log("Formatted receiver followers:", formattedReceiver.followers);

//         return res.json({
//             success: true,
//             receiver: formattedReceiver
//         });

//     } catch (error) {
//         console.error("acceptFollowRequest error:", error);
//         res.status(500).json({ 
//             success: false,
//             message: "Server error" 
//         });
//     }
// };
export const acceptFollowRequest = async (req, res) => {
    try {
        const receiverId = req.id;      // User B (who accepts)
        const senderId = req.params.id; // User A (who sent request)

        console.log("=== ACCEPT FOLLOW REQUEST ===");
        console.log("User B (receiver):", receiverId);
        console.log("User A (sender):", senderId);

        // Remove follow request
        await User.updateOne(
            { _id: receiverId },
            { $pull: { followRequests: senderId } }
        );

        // Create one-way follow (A → B)
        await Promise.all([
            User.updateOne(
                { _id: receiverId },
                { $addToSet: { followers: senderId } }
            ),
            User.updateOne(
                { _id: senderId },
                { $addToSet: { following: receiverId } }
            )
        ]);

        console.log("✅ User A now follows User B");

        // ✅ CREATE NOTIFICATION FOR USER A
        const notification = await Notification.create({
            receiver: senderId,   // User A gets notified
            sender: receiverId,   // User B accepted
            type: "follow_accept"
        });

        // ✅ SEND SOCKET NOTIFICATION TO USER A
        const io = getIO();
        const socketId = getReceiverSocketId(senderId);
        
        if (socketId) {
            const populatedNotification = await Notification.findById(notification._id)
                .populate("sender", "username profilePicture");

            io.to(socketId).emit("notification", {
                _id: populatedNotification._id,
                type: populatedNotification.type,
                senderDetails: populatedNotification.sender
            });
            
            console.log("✅ Sent follow_accept notification to User A");
        }

        // Fetch FRESH data from database
        const receiver = await User.findById(receiverId)
            .select("-password -__v");

        console.log("User B followers (after accept):", receiver.followers.map(f => f.toString()));
        console.log("User B following (after accept):", receiver.following.map(f => f.toString()));

        // Format for frontend - PLAIN IDs ONLY
        const formattedReceiver = {
            _id: receiver._id.toString(),
            username: receiver.username,
            email: receiver.email,
            profilePicture: receiver.profilePicture,
            bio: receiver.bio,
            gender: receiver.gender,
            followers: receiver.followers.map(f => f.toString()),
            following: receiver.following.map(f => f.toString()),
            posts: receiver.posts,
            reels: receiver.reels,
            bookmarks: receiver.bookmarks || [],
            reelBookmarks: receiver.reelBookmarks || []
        };

        console.log("Formatted receiver followers:", formattedReceiver.followers);

        return res.json({
            success: true,
            receiver: formattedReceiver
        });

    } catch (error) {
        console.error("acceptFollowRequest error:", error);
        res.status(500).json({ 
            success: false,
            message: "Server error" 
        });
    }
};

export const followBackUser = async (req, res) => {
    try {
        const userId = req.id;          // User B (logged-in)
        const targetId = req.params.id; // User A

        console.log("=== FOLLOW BACK ===");
        console.log("User B (logged-in):", userId);
        console.log("User A (target):", targetId);

        if (userId === targetId) {
            console.log("❌ Cannot follow yourself");
            return res.status(400).json({ 
                success: false,
                message: "Cannot follow yourself" 
            });
        }

        // Fetch logged-in user (User B)
        const loggedInUser = await User.findById(userId);
        
        if (!loggedInUser) {
            console.log("❌ Logged-in user not found");
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        console.log("User B followers (raw):", loggedInUser.followers);
        console.log("User B following (raw):", loggedInUser.following);

        // Convert to strings for comparison
        const followerIds = loggedInUser.followers.map(f => f.toString());
        const followingIds = loggedInUser.following.map(f => f.toString());

        console.log("User B followers (strings):", followerIds);
        console.log("User B following (strings):", followingIds);
        console.log("Looking for User A:", targetId);

        // Check if target (User A) follows logged-in user (User B)
        const targetFollowsMe = followerIds.includes(targetId);

        console.log("Does User A follow User B?", targetFollowsMe);

        if (!targetFollowsMe) {
            console.log("❌ User A doesn't follow User B");
            return res.status(400).json({ 
                success: false, 
                message: "User doesn't follow you",
                debug: {
                    userBFollowers: followerIds,
                    userAId: targetId,
                    match: targetFollowsMe
                }
            });
        }

        // Check if already following
        const alreadyFollowing = followingIds.includes(targetId);

        console.log("Does User B already follow User A?", alreadyFollowing);

        if (alreadyFollowing) {
            console.log("❌ Already following");
            return res.status(400).json({ 
                success: false, 
                message: "Already following" 
            });
        }

        // Add follow (B → A)
        await Promise.all([
            User.updateOne(
                { _id: userId },
                { $addToSet: { following: targetId } }
            ),
            User.updateOne(
                { _id: targetId },
                { $addToSet: { followers: userId } }
            )
        ]);

        console.log("✅ User B now follows User A");

        // Create notification for User A
        const notification = await Notification.create({
            receiver: targetId,
            sender: userId,
            type: "follow_back"
        });

        console.log("✅ Notification created");

        // Send socket notification
        const io = getIO();
        const socketId = getReceiverSocketId(targetId);
        
        if (socketId) {
            const populatedNotification = await Notification.findById(notification._id)
                .populate("sender", "username profilePicture");

            io.to(socketId).emit("notification", {
                _id: populatedNotification._id,
                type: populatedNotification.type,
                senderDetails: populatedNotification.sender
            });

            console.log("✅ Socket notification sent");
        }

        // Fetch updated user
        const updatedUser = await User.findById(userId)
            .select("-password")
            .populate("followers", "username profilePicture")
            .populate("following", "username profilePicture");

        const formattedUser = {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            bio: updatedUser.bio,
            gender: updatedUser.gender,
            followers: updatedUser.followers.map(f => f._id.toString()),
            following: updatedUser.following.map(f => f._id.toString()),
            posts: updatedUser.posts,
            reels: updatedUser.reels,
            bookmarks: updatedUser.bookmarks || [],
            reelBookmarks: updatedUser.reelBookmarks || []
        };

        console.log("✅ Returning updated user");

        res.json({ success: true, user: formattedUser });

    } catch (err) {
        console.error("❌ followBack error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error" 
        });
    }
};