import { Notification } from "../models/notification.model.js";
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.id;

    const notifications = await Notification.find({ receiver: userId })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: -1 });

    const formatted = notifications.map(n => ({
      _id: n._id,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,

      senderDetails: n.sender
        ? {
          _id: n.sender._id,
          username: n.sender.username,
          profilePicture: n.sender.profilePicture || null
        }
        : null,

      postId: n.post || null,
      reelId: n.reel || null
    }));

    res.status(200).json({
      success: true,
      notifications: formatted
    });

  } catch (error) {
    console.error("getMyNotifications error:", error);
    res.status(500).json({ success: false });
  }
};
