import http from "http";
import { Server } from "socket.io";

const activeCalls = new Map(); // callId -> timeout

/* -------------------- SOCKET STORAGE -------------------- */
const userSocketMap = {}; // userId -> socketId
let ioInstance = null;

/* -------------------- EXPORT HELPERS -------------------- */
export const getReceiverSocketId = (receiverId) =>
  userSocketMap[receiverId];

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }
  return ioInstance;
};

/* -------------------- INIT SOCKET -------------------- */
const initSocket = (app) => {
  const server = http.createServer(app);

  ioInstance = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  ioInstance.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    /* -------- REGISTER USER -------- */
    socket.on("register-user", (userId) => {
      userSocketMap[userId] = socket.id;
      console.log("✅ User registered:", userId, "->", socket.id);

      ioInstance.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    /* -------- CALL USER -------- */
    socket.on("call-user", ({ senderId, receiverId, offer, callType }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (!receiverSocketId) return;

      const callId = `${senderId}-${receiverId}-${Date.now()}`;

      ioInstance.to(receiverSocketId).emit("incoming-call", {
        callId,
        from: senderId,
        callType,
        offer
      });

      const timeout = setTimeout(() => {
        ioInstance.to(userSocketMap[senderId])?.emit("call-missed", {
          callId,
          receiverId
        });

        ioInstance.to(receiverSocketId).emit("call-ended", {
          callId,
          reason: "missed"
        });

        activeCalls.delete(callId);
      }, 30000);

      activeCalls.set(callId, timeout);
    });

    /* -------- ACCEPT CALL -------- */
    socket.on("accept-call", ({ callId, senderId, answer }) => {
      clearTimeout(activeCalls.get(callId));
      activeCalls.delete(callId);

      const senderSocket = userSocketMap[senderId];
      if (!senderSocket) return;

      ioInstance.to(senderSocket).emit("call-accepted", {
        callId,
        answer
      });
    });

    /* -------- REJECT CALL -------- */
    socket.on("reject-call", ({ callId, senderId }) => {
      clearTimeout(activeCalls.get(callId));
      activeCalls.delete(callId);

      const senderSocket = userSocketMap[senderId];
      if (!senderSocket) return;

      ioInstance.to(senderSocket).emit("call-rejected", { callId });
    });

    /* -------- ICE CANDIDATE -------- */
    socket.on("ice-candidate", ({ to, candidate }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        ioInstance.to(receiverSocketId).emit("ice-candidate", {
          candidate
        });
      }
    });

    /* -------- END CALL (🔥 NEW FIX) -------- */
    socket.on("end-call", ({ to }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        ioInstance.to(receiverSocketId).emit("end-call");
      }
    });

    /* -------- DISCONNECT -------- */
    socket.on("disconnect", () => {
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          console.log("❌ User disconnected:", userId);
          delete userSocketMap[userId];
          ioInstance.emit("getOnlineUsers", Object.keys(userSocketMap));
          break;
        }
      }
      console.log("🔌 Socket disconnected:", socket.id);
    });
  });

  return server;
};

export default initSocket;
