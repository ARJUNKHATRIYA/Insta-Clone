import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;


        if (!image) return res.status(400).json({ message: 'Image required' });

        // image upload 
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        })

    } catch (error) {
        console.log(error);
    }
}

export const getAllPost = async (req, res) => {
    try {
        const userId = req.id;

        const user = await User.findById(userId).select("following");
        if (!user) {
            return res.status(404).json({ success: false });
        }

        const posts = await Post.find({
            author: { $in: [...user.following, userId] } // 🔥 KEY LINE
        })
            .sort({ createdAt: -1 })
            .populate("author", "username profilePicture")
            .populate({
                path: "comments",
                populate: {
                    path: "author",
                    select: "username profilePicture"
                }
            });

        res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false });
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // ✅ prevent duplicate likes
        if (post.likes.includes(userId)) {
            return res.json({ success: true, message: "Already liked" });
        }

        post.likes.push(userId);
        await post.save();

        // 🔔 send notification only if not self-like
        if (post.author.toString() !== userId) {
            const notification = await Notification.create({
                receiver: post.author,
                sender: userId,
                type: "post_like",
                post: postId
            });

            const socketId = getReceiverSocketId(post.author.toString());
            const io = getIO();

            if (socketId) {
                const populated = await notification.populate(
                    "sender",
                    "username profilePicture"
                );

                io.to(socketId).emit("notification", {
                    _id: populated._id,
                    type: populated.type,
                    senderDetails: populated.sender,
                    postId: postId                 // ✅ consistent key
                });
            }
        }

        return res.json({ success: true, message: "Post liked" });

    } catch (err) {
        console.error("likePost error:", err);
        return res.status(500).json({ success: false });
    }
};

/* ---------------- DISLIKE POST ---------------- */
export const dislikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res
                .status(404)
                .json({ message: "Post not found", success: false });
        }

        await post.updateOne({ $pull: { likes: userId } });

        const postOwnerId = post.author.toString();

        if (postOwnerId !== userId) {
            const io = getIO();
            const receiverSocketId = getReceiverSocketId(postOwnerId);

            if (receiverSocketId) {
                const user = await User.findById(userId).select(
                    "username profilePicture"
                );
            }
        }

        return res.status(200).json({
            message: "Post disliked",
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false });
    }
};

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;
        const { text } = req.body;

        if (!text.trim()) {
            return res.status(400).json({ success: false, message: "Text required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const comment = await Comment.create({
            text,
            author: userId,
            post: postId
        });

        await comment.populate({
            path: "author",
            select: "username profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            success: true,
            message: "Comment Added",
            comment
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
};

export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');

        if (!comments) return res.status(404).json({ message: 'No comments found for this post', success: false });

        return res.status(200).json({ success: true, comments });

    } catch (error) {
        console.log(error);
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // check if the logged-in user is the owner of the post
        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized' });

        // delete post
        await Post.findByIdAndDelete(postId);

        // remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            success: true,
            message: 'Post deleted'
        })

    } catch (error) {
        console.log(error);
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        const user = await User.findById(authorId);
        if (user.bookmarks.includes(post._id)) {
            // already bookmarked -> remove from the bookmark
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'unsaved', message: 'Post removed from bookmark', success: true });

        } else {
            // bookmark krna pdega
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'saved', message: 'Post bookmarked', success: true });
        }

    } catch (error) {
        console.log(error);
    }
}