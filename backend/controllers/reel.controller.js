
import cloudinary from "../utils/cloudinary.js";
import { Reel } from "../models/reel.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";
import { Notification } from "../models/notification.model.js";


export const addNewReel = async (req, res) => {
  try {
    const { caption } = req.body;
    const file = req.file;
    const authorId = req.id;

    if (!file) {
      return res.status(400).json({
        message: "Video required",
        success: false
      });
    }

    // 🔥 BUFFER → BASE64 DATA URI (NO sharp)
    const fileUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const cloudResponse = await cloudinary.uploader.upload(fileUri, {
      resource_type: "video"
    });

    const reel = await Reel.create({
      caption,
      media: cloudResponse.secure_url,
      author: authorId
    });

    const user = await User.findById(authorId);
    if (user) {
      user.reels.push(reel._id);
      await user.save();
    }

    await reel.populate({
      path: "author",
      select: "-password"
    });

    return res.status(201).json({
      message: "Reel uploaded successfully",
      reel,
      success: true
    });

  } catch (error) {
    console.error("Reel upload error:", error);
    return res.status(500).json({
      message: "Failed to upload reel",
      success: false
    });
  }
};

export const getAllReel = async (req, res) => {
  try {
    const userId = req.id;

    const user = await User.findById(userId).select("following");
    if (!user) {
      return res.status(404).json({ success: false });
    }

    const reels = await Reel.find({
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
      reels
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserReel = async (req, res) => {
  try {
    const authorId = req.params.id || req.id;

    const reels = await Reel.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username profilePicture"
        }
      });

    res.status(200).json({ reels, success: true });
  } catch (err) {
    console.log(err);
  }
};

export const likeReel = async (req, res) => {
  try {
    const userId = req.id;
    const reelId = req.params.id;

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ success: false, message: "Reel not found" });
    }

    // ✅ prevent duplicate likes
    if (reel.likes.includes(userId)) {
      return res.json({ success: true, message: "Already liked" });
    }

    reel.likes.push(userId);
    await reel.save();

    // 🔔 send notification only if not self-like
    if (reel.author.toString() !== userId) {
      const notification = await Notification.create({
        receiver: reel.author,
        sender: userId,
        type: "reel_like",
        reel: reelId
      });

      const socketId = getReceiverSocketId(reel.author.toString());
      const io = getIO();

      if (socketId) {
        const populated = await notification.populate(
          "sender",
          "username profilePicture"
        );

        io.to(socketId).emit("notification", {
          _id: populated._id,
          type: populated.type,
          senderDetails: populated.sender, // ✅ profile pic comes from here
          reelId: reelId                  // ✅ consistent key
        });
      }
    }

    return res.json({ success: true, message: "Reel liked" });

  } catch (err) {
    console.error("likeReel error:", err);
    return res.status(500).json({ success: false });
  }
};

export const dislikeReel = async (req, res) => {
  try {
    const userId = req.id;
    const reelId = req.params.id;
    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res
        .status(404)
        .json({ message: "Reel not found", success: false });
    }
    await reel.updateOne({ $pull: { likes: userId } });
    const reelOwnerId = reel.author.toString();
    if (reelOwnerId !== userId) {
      const io = getIO();
      const receiverSocketId = getReceiverSocketId(reelOwnerId);
      if (receiverSocketId) {
        const user = await User.findById(userId).select(
          "username profilePicture");

        io.to(receiverSocketId).emit("notification",
          {
            type: 'dislike',
            userId,
            userDetails: user,
            reelId,
            message: "Your Reel was disliked"
          }
        )
      }
    }
    return res.status(200).json({
      message: "Reel disliked",
      success: true
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
}

export const addComment = async (req, res) => {
  try {
    const reelId = req.params.id;
    const commentKrneWalaUserKiId = req.id;
    const { text } = req.body;
    const reel = await Reel.findById(reelId);
    if (!text) return res.status(400).json({ message: 'Text is required', success: false });

    const comment = await Comment.create({
      text,
      author: commentKrneWalaUserKiId,
      reel: reelId
    })

    await comment.populate({
      path: 'author',
      select: 'username profilePicture'
    })

    reel.comments.push(comment._id);
    await reel.save();
    return res.status(201).json({
      message: 'Comment Added',
      comment,
      success: true
    })
  } catch (error) {
    console.log(error);
  }
}

export const getCommentsOfReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    const comments = await Comment.find({ reel: reelId }).populate('author', 'username profilePicture');
    if (!comments) return res.status(404).json({ success: false, message: 'No comments found for this Reel' });
    return res.status(200).json({
      comments,
      success: true
    })
  } catch (error) {
    console.log(error);
  }
}

export const deleteReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    const authorId = req.id;

    const reel = await Reel.findById(reelId);
    if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });

    if (reel.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized' });

    await Reel.findByIdAndDelete(reelId);

    let user = await User.findById(authorId);
    user.reels = user.reels.filter(id => id.toString() !== reelId);
    await user.save();

    await Comment.deleteMany({ reel: reelId });
    return res.status(200).json({
      success: true,
      message: 'Reel deleted'
    })
  } catch (error) {
    console.log(error);
  }
}

export const bookmarkReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.id;

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found"
      });
    }

    const user = await User.findById(userId);

    const alreadyBookmarked = user.reelBookmarks.some(
      id => id.toString() === reelId
    );

    if (alreadyBookmarked) {
      await user.updateOne({
        $pull: { reelBookmarks: reelId }
      });

      return res.status(200).json({
        type: "unsaved",
        message: "Reel removed from bookmarks",
        success: true
      });
    } else {
      await user.updateOne({
        $addToSet: { reelBookmarks: reelId }
      });

      return res.status(200).json({
        type: "saved",
        message: "Reel saved",
        success: true
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Bookmark failed"
    });
  }
};
