import { useRef } from "react";
import socket from "@/socket";

const useWebRTC = (receiverId, videoEnabled) => {
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const startCall = async () => {
    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoEnabled
    });

    localStreamRef.current.getTracks().forEach(track => {
      peerRef.current.addTrack(track, localStreamRef.current);
    });

    peerRef.current.onicecandidate = e => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          to: receiverId,
          candidate: e.candidate
        });
      }
    };

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socket.emit("call-user", { to: receiverId, offer });
  };

  return { startCall };
};

export default useWebRTC;
