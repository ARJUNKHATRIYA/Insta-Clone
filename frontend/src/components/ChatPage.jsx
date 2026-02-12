import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/chatSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode, Phone, Video } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import useGetFollowingUsers from "@/hooks/useGetFollowingUsers";
import ChatHeader from "./ChatHeader";
import { motion } from "framer-motion";

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();

  const { user, followingUsers } = useSelector(s => s.auth);
  const { onlineUsers, selectedUser } = useSelector(s => s.chat);
  const { socket } = useSelector(s => s.socketio);

  const [textMessage, setTextMessage] = useState("");

  /* ================= CALL STATE ================= */
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  /* ================= WEBRTC REFS ================= */
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidates = useRef([]);

  // 🔐 HARD LOCK (MOST IMPORTANT FIX)
  const acquiringMediaRef = useRef(false);

  useGetFollowingUsers();

  /* ================= MEDIA ================= */
  const getLocalStream = async (video) => {
    if (localStreamRef.current) return localStreamRef.current;
    if (acquiringMediaRef.current) throw new Error("Media busy");

    acquiringMediaRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video
      });
      localStreamRef.current = stream;
      return stream;
    } finally {
      acquiringMediaRef.current = false;
    }
  };

  const releaseMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  /* ================= CLEANUP ================= */
  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    releaseMedia();
    pendingCandidates.current = [];
    setIncomingCall(null);
    setCallType(null);
    setCallState("idle");
  };

  useEffect(() => () => cleanupCall(), []);

  /* ================= ROUTE ================= */
  useEffect(() => {
    if (!userId) navigate("/chat");
  }, [userId]);

  /* ================= START CALL ================= */
  const startCall = async (type) => {
    if (!selectedUser || !socket || peerRef.current) return;

    setCallType(type);
    setCallState("calling");

    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    try {
      const stream = await getLocalStream(type === "video");

      stream.getTracks().forEach(track =>
        peerRef.current.addTrack(track, stream)
      );

      if (type === "video" && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Media error:", err);
      cleanupCall();
      return;
    }

    peerRef.current.ontrack = e => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    peerRef.current.onicecandidate = e => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          to: selectedUser._id,
          candidate: e.candidate
        });
      }
    };

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socket.emit("call-user", {
      senderId: user._id,
      receiverId: selectedUser._id,
      offer,
      callType: type
    });
  };

  /* ================= INCOMING ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", data => {
      if (callState !== "idle") return;
      setIncomingCall(data);
      setCallType(data.callType);
      setCallState("ringing");
    });
    // socket.emit("reject-call", {
    //   callId: incomingCall.callId,
    //   senderId: incomingCall.from
    // });
    // cleanupCall();

    socket.on("call-missed", cleanupCall);

    return () => {
      socket.off("incoming-call");
      socket.off("call-rejected");
      socket.off("call-missed");
    };
  }, [socket, callState]);

  /* ================= ACCEPT ================= */
  const acceptCall = async () => {
    if (!incomingCall) return;
    if (peerRef.current) return;
    if (acquiringMediaRef.current) return;

    const { callId, from, offer, callType } = incomingCall;

    setCallState("in-call");

    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    try {
      const stream = await getLocalStream(callType === "video");

      stream.getTracks().forEach(track =>
        peerRef.current.addTrack(track, stream)
      );

      if (callType === "video" && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Media error:", err);
      cleanupCall();
      return;
    }

    peerRef.current.ontrack = e => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    peerRef.current.onicecandidate = e => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          to: from,
          candidate: e.candidate
        });
      }
    };

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    for (const c of pendingCandidates.current) {
      await peerRef.current.addIceCandidate(c);
    }
    pendingCandidates.current = [];

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socket.emit("accept-call", {
      callId,
      senderId: from,
      answer
    });
  };
  useEffect(() => {
    if (!socket) return;

    socket.on("end-call", () => {
      cleanupCall();
    });

    return () => socket.off("end-call");
  }, [socket]);


  /* ================= ACCEPTED ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("call-accepted", async ({ answer }) => {
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setCallState("in-call");
    });

    return () => socket.off("call-accepted");
  }, [socket]);

  /* ================= ICE ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!peerRef.current) return;

      if (peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(candidate);
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    return () => socket.off("ice-candidate");
  }, [socket]);

  /* ================= MESSAGE ================= */
  const sendMessageHandler = async () => {
    if (!textMessage.trim()) return;

    await axios.post(
      `http://localhost:8000/api/v1/message/send/${selectedUser._id}`,
      { textMessage },
      { withCredentials: true }
    );
    setTextMessage("");
  };

  /* ================= SELECT ================= */
  useEffect(() => {
    if (!userId || !followingUsers.length) return;
    const u = followingUsers.find(x => x._id === userId);
    if (u) dispatch(setSelectedUser(u));
  }, [userId, followingUsers]);

  /* ================= UI ================= */
  return (
    <div className="h-screen flex bg-gray-100">
      <aside className="hidden lg:flex w-[320px] border-r bg-white">
        <div className="w-full">
          <h1 className="font-bold p-4">{user?.username}</h1>
          {followingUsers.map(u => (
            <div
              key={u._id}
              onClick={() => dispatch(setSelectedUser(u))}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100"
            >
              <Avatar>
                <AvatarImage src={u.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{u.username}</p>
                <p className={`text-xs ${onlineUsers.includes(u._id) ? "text-green-600" : "text-gray-400"}`}>
                  {onlineUsers.includes(u._id) ? "online" : "offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            <ChatHeader startCall={startCall} />
            <div className="flex-1 overflow-y-auto">
              <Messages selectedUser={selectedUser} />
            </div>
            <div className="border-t p-3 flex gap-2">
              <Input value={textMessage} onChange={e => setTextMessage(e.target.value)} />
              <Button onClick={sendMessageHandler}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <MessageCircleCode size={64} />
          </div>
        )}
      </main>

      {/* INCOMING */}
      {/* {callState === "ringing" && incomingCall && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center w-[300px]">
            <p className="font-bold mb-4">
              Incoming {incomingCall.callType} call
            </p>
            <div className="flex gap-4 justify-center">
              <Button disabled={callState !== "ringing"} onClick={acceptCall}>
                Accept
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!incomingCall) return;

                  socket.emit("reject-call", {
                    callId: incomingCall.callId,
                    senderId: incomingCall.from
                  });

                  cleanupCall();
                }}
              >
                Reject
              </Button>

            </div>
          </div>
        </div>
      )} */}

      {/* VIDEO */}
      {/* {callState === "in-call" && callType === "video" && (
        <div className="fixed inset-0 bg-black z-50">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full" />
          <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 w-40 h-28 border" />
          <Button variant="destructive"
            onClick={() => {
              socket.emit("end-call", {
                to: incomingCall?.from || selectedUser?._id
              });
              cleanupCall();
            }} className="absolute top-4 right-4">
            End Call
          </Button>
        </div>
      )} */}

      {/* INCOMING CALL - ENHANCED */}
      {callState === "ringing" && incomingCall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white p-8 rounded-3xl text-center w-[340px] shadow-2xl relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
                  "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))",
                  "linear-gradient(225deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0"
            />

            {/* Caller avatar */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="relative z-10 mb-6"
            >
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                <Avatar className="h-full w-full">
                  <AvatarImage src={selectedUser?.profilePicture} />
                  <AvatarFallback className="bg-white text-purple-600 font-bold text-2xl">
                    {selectedUser?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <h3 className="font-bold text-xl mb-2">{selectedUser?.username}</h3>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-gray-600 mb-6 flex items-center justify-center gap-2"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Incoming {incomingCall.callType} call...
              </motion.p>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={callState !== "ringing"}
                  onClick={acceptCall}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  Accept
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!incomingCall) return;
                    socket.emit("reject-call", {
                      callId: incomingCall.callId,
                      senderId: incomingCall.from
                    });
                    cleanupCall();
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl"
                >
                  Decline
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* VIDEO CALL - ENHANCED */}
      {callState === "in-call" && callType === "video" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black z-50 flex flex-col"
        >
          {/* Remote video (full screen) */}
          <div className="flex-1 relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* User name overlay */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold"
            >
              {selectedUser?.username}
            </motion.div>

            {/* Call duration */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm"
            >
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2"
              />
              Recording
            </motion.div>
          </div>

          {/* Local video (picture-in-picture) */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            drag
            dragConstraints={{ top: 0, bottom: 200, left: 0, right: 200 }}
            className="absolute bottom-24 right-6 w-40 h-56 rounded-2xl overflow-hidden border-4 border-white shadow-2xl cursor-move"
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Control buttons */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
          >
            <div className="flex justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
              >
                <Video size={24} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
              >
                <Phone size={24} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  socket.emit("end-call", {
                    to: incomingCall?.from || selectedUser?._id
                  });
                  cleanupCall();
                }}
                className="p-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Phone size={24} className="rotate-135" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatPage;
