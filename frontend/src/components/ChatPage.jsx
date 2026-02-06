import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/chatSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import useGetFollowingUsers from "@/hooks/useGetFollowingUsers";
import ChatHeader from "./ChatHeader";

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
      {callState === "ringing" && incomingCall && (
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
      )}

      {/* VIDEO */}
      {callState === "in-call" && callType === "video" && (
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
      )}
    </div>
  );
};

export default ChatPage;
