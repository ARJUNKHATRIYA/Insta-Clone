import http from "http";
import { Server } from "socket.io";

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
        console.log("Socket connected:", socket.id);

        socket.on("register-user", (userId) => {
            userSocketMap[userId] = socket.id;
            console.log("✅ User registered:", userId, "->", socket.id);
            console.log("👥 Online users:", Object.keys(userSocketMap));
            
            // Emit online users to all clients
            ioInstance.emit('getOnlineUsers', Object.keys(userSocketMap));
        });

        socket.on("call-user", ({ senderId, receiverId, offer, callType }) => {
            console.log(`📞 Call from ${senderId} to ${receiverId} (${callType})`);
            const receiverSocketId = userSocketMap[receiverId];

            if (receiverSocketId) {
                console.log("✅ Forwarding call to socket:", receiverSocketId);
                ioInstance.to(receiverSocketId).emit("incoming-call", {
                    from: senderId,
                    offer,
                    callType
                });
            } else {
                console.log("❌ Receiver not found:", receiverId);
            }
        });

        socket.on("answer-call", ({ senderId, to, answer }) => {
            console.log(`✅ Answer from ${senderId} to ${to}`);
            const receiverSocketId = userSocketMap[to];

            if (receiverSocketId) {
                console.log("✅ Forwarding answer to socket:", receiverSocketId);
                ioInstance.to(receiverSocketId).emit("call-accepted", {
                    from: senderId,
                    answer
                });
            } else {
                console.log("❌ Caller not found:", to);
            }
        });

        socket.on("ice-candidate", ({ senderId, to, candidate }) => {
            console.log(`🧊 ICE from ${senderId} to ${to}`);
            const receiverSocketId = userSocketMap[to];

            if (receiverSocketId) {
                ioInstance.to(receiverSocketId).emit("ice-candidate", {
                    from: senderId,
                    candidate
                });
            }
        });
        
        /* ----------- DISCONNECT ----------- */
        socket.on("disconnect", () => {
            for (const userId in userSocketMap) {
                if (userSocketMap[userId] === socket.id) {
                    console.log("❌ User disconnected:", userId);
                    delete userSocketMap[userId];
                    // Emit updated online users
                    ioInstance.emit('getOnlineUsers', Object.keys(userSocketMap));
                    break;
                }
            }
            console.log("Socket disconnected:", socket.id);
        });
    });

    return server;
};

export default initSocket;