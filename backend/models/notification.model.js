// import mongoose from "mongoose";
// const notificationSchema = new mongoose.Schema(
//   {
//     receiver: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     type: {
//       type: String,
//       enum: [
//         "post_like",
//         "reel_like",
//         "follow_request",
//         "follow_accept",
//         "call_missed",
//         "call_rejected"
//       ],
//       required: true
//     },

//     post: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Post",
//       default: null
//     },

//     reel: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Reel",
//       default: null
//     },

//     isRead: {
//       type: Boolean,
//       default: false
//     }
//   },
//   { timestamps: true }
// );
// export const Notification = mongoose.model("Notification", notificationSchema);

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "post_like",
        "reel_like",
        "follow_request",
        "follow_accept",
        "follow_back",      // ✅ Add this
        "call_missed",
        "call_rejected"
      ],
      required: true
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null
    },

    reel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reel",
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);