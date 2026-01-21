import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser, setMessages } from '@/redux/chatSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import useGetFollowingUsers from '@/hooks/useGetFollowingUsers';
import socket from "@/lib/socket";
import ChatHeader from "./ChatHeader";

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const dispatch = useDispatch();
    const { userId } = useParams();
    const { user, followingUsers } = useSelector((store) => store.auth);
    const { onlineUsers, messages, selectedUser } = useSelector((store) => store.chat);
    
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [inCall, setInCall] = useState(false);
    const [callType, setCallType] = useState(null);

    useGetFollowingUsers();

    // Socket connection
    useEffect(() => {
        console.log("🔌 Connecting socket for user:", user?._id);
        if (user?._id) {
            socket.connect();
            socket.emit("register-user", user._id);
            console.log("✅ User registered:", user._id);
        }

        return () => {
            console.log("🔌 Disconnecting socket");
            socket.disconnect();
        };
    }, [user?._id]);

    // Start call function
    const startCall = async (type) => {
        if (!selectedUser) return;

        console.log(`📞 Starting ${type} call to:`, selectedUser._id);
        setCallType(type);
        setInCall(true);

        try {
            // Get media FIRST
            localStreamRef.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === "video"
            });
            console.log("✅ Got local media stream");

            // Create peer connection
            peerRef.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            // Monitor connection state
            peerRef.current.onconnectionstatechange = () => {
                console.log("🔗 Connection state:", peerRef.current.connectionState);
            };

            // Add tracks
            localStreamRef.current.getTracks().forEach(track => {
                peerRef.current.addTrack(track, localStreamRef.current);
                console.log("✅ Added track:", track.kind);
            });

            // Local video
            if (type === "video" && localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }

            // Remote stream
            peerRef.current.ontrack = (e) => {
                console.log("📹 Received remote track:", e.track.kind);
                if (remoteVideoRef.current && e.streams[0]) {
                    remoteVideoRef.current.srcObject = e.streams[0];

                    remoteVideoRef.current.onloadedmetadata = () => {
                        console.log("📹 Video metadata loaded:",
                            remoteVideoRef.current.videoWidth,
                            remoteVideoRef.current.videoHeight);
                        console.log("✅ Video should be playing");
                    };
                }
            };

            // ICE candidates
            peerRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("🧊 Sending ICE candidate");
                    socket.emit("ice-candidate", {
                        senderId: user._id,
                        to: selectedUser._id,
                        candidate: event.candidate
                    });
                }
            };

            // Create offer
            const offer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(offer);
            console.log("✅ Created offer");

            // Send call
            socket.emit("call-user", {
                senderId: user._id,
                receiverId: selectedUser._id,
                offer,
                callType: type
            });
        } catch (error) {
            console.error("❌ Error starting call:", error);
            endCall();
        }
    };

    // Handle incoming call
    useEffect(() => {
        const handleIncomingCall = async ({ from, offer, callType }) => {
            console.log(`📞 Incoming ${callType} call from:`, from);
            
            const accept = window.confirm(`Incoming ${callType} call. Accept?`);
            if (!accept) return;

            // Set call state FIRST to render video elements
            setCallType(callType);
            setInCall(true);

            // Wait for video elements to render
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log("📹 Video refs status after render:", {
                localVideoRef: !!localVideoRef.current,
                remoteVideoRef: !!remoteVideoRef.current
            });

            try {
                // Get media
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: callType === "video"
                });
                console.log("✅ Got local media stream");

                // Create peer
                peerRef.current = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
                });

                peerRef.current.onconnectionstatechange = () => {
                    console.log("🔗 Connection state:", peerRef.current.connectionState);
                };

                // Add tracks
                localStreamRef.current.getTracks().forEach(track => {
                    peerRef.current.addTrack(track, localStreamRef.current);
                    console.log("✅ Added track:", track.kind);
                });

                // Setup local video
                if (callType === "video" && localVideoRef.current) {
                    localVideoRef.current.srcObject = localStreamRef.current;
                }

                // Remote stream handler
                peerRef.current.ontrack = (event) => {
                    console.log("📹 Received remote track:", event.track.kind);
                    
                    if (event.streams && event.streams[0]) {
                        console.log("📹 Got stream:", event.streams[0].id);
                        
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = event.streams[0];
                            
                            remoteVideoRef.current.onloadedmetadata = () => {
                                console.log("📹 Video metadata loaded:", 
                                    remoteVideoRef.current.videoWidth, 
                                    remoteVideoRef.current.videoHeight);
                                console.log("✅ Video should be playing");
                            };
                        } else {
                            console.error("❌ remoteVideoRef is STILL null!");
                        }
                    }
                };

                // ICE
                peerRef.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log("🧊 Sending ICE candidate");
                        socket.emit("ice-candidate", {
                            senderId: user._id,
                            to: from,
                            candidate: event.candidate
                        });
                    }
                };

                // Set remote description
                await peerRef.current.setRemoteDescription(
                    new RTCSessionDescription(offer)
                );
                console.log("✅ Set remote description");

                // Create answer
                const answer = await peerRef.current.createAnswer();
                await peerRef.current.setLocalDescription(answer);
                console.log("✅ Created answer");

                // Send answer
                socket.emit("answer-call", {
                    senderId: user._id,
                    to: from,
                    answer
                });
            } catch (error) {
                console.error("❌ Error accepting call:", error);
                endCall();
            }
        };

        socket.on("incoming-call", handleIncomingCall);
        return () => socket.off("incoming-call");
    }, [user]);

    // Handle call accepted
    useEffect(() => {
        const handleCallAccepted = async ({ answer }) => {
            console.log("✅ Call accepted");
            try {
                await peerRef.current.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );
            } catch (error) {
                console.error("❌ Error setting remote description:", error);
            }
        };

        socket.on("call-accepted", handleCallAccepted);
        return () => socket.off("call-accepted");
    }, []);

    // Handle ICE candidates
    useEffect(() => {
        const handleIceCandidate = async ({ candidate }) => {
            console.log("🧊 Received ICE candidate");
            if (peerRef.current && candidate) {
                try {
                    await peerRef.current.addIceCandidate(
                        new RTCIceCandidate(candidate)
                    );
                    console.log("✅ Added ICE candidate");
                } catch (error) {
                    console.error("❌ Error adding ICE candidate:", error);
                }
            }
        };

        socket.on("ice-candidate", handleIceCandidate);
        return () => socket.off("ice-candidate");
    }, []);

    // End call function
    const endCall = () => {
        console.log("📴 Ending call");
        
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setInCall(false);
        setCallType(null);
    };

    // Message handler
    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(
                `http://localhost:8000/api/v1/message/send/${receiverId}`,
                { textMessage },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Select user from URL
    useEffect(() => {
        if (!userId || !followingUsers.length) return;
        const userToChat = followingUsers.find((u) => u._id === userId);
        if (userToChat) {
            dispatch(setSelectedUser(userToChat));
        }
    }, [userId, followingUsers, dispatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => dispatch(setSelectedUser(null));
    }, [dispatch]);

    return (
        <div className='flex ml-[16%] h-screen'>
            <section className='w-full md:w-1/4 my-8'>
                <h1 className='font-bold mb-4 px-3 text-xl'>{user?.username}</h1>
                <hr className='mb-4 border-gray-300' />
                <div className='overflow-y-auto h-[80vh]'>
                    {followingUsers.map((followedUser) => {
                        const isOnline = onlineUsers.includes(followedUser._id);
                        return (
                            <div
                                key={followedUser._id}
                                onClick={() => dispatch(setSelectedUser(followedUser))}
                                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
                            >
                                <Avatar className="w-14 h-14">
                                    <AvatarImage src={followedUser.profilePicture} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{followedUser.username}</span>
                                    <span className={`text-xs font-bold ${isOnline ? "text-green-600" : "text-red-600"}`}>
                                        {isOnline ? "online" : "offline"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {selectedUser ? (
                <section className='flex-1 border-l border-l-gray-300 flex flex-col h-full'>
                    <ChatHeader startCall={startCall} />

                    {/* AUDIO CALL UI */}
                    {inCall && callType === "audio" && (
                        <div className="fixed bottom-6 right-6 bg-white shadow-xl p-4 rounded-xl z-50 w-64">
                            <p className="font-semibold text-center">
                                Audio call with {selectedUser?.username}
                            </p>
                            <div className="flex justify-center gap-4 mt-4">
                                <Button variant="destructive" onClick={endCall}>
                                    End Call
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* VIDEO CALL UI */}
                    {inCall && callType === "video" && (
                        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                            {/* Remote video - FULL SCREEN */}
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                muted={false}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    backgroundColor: 'black'
                                }}
                            />

                            {/* Local video - SMALL CORNER */}
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    right: '20px',
                                    width: '200px',
                                    height: '150px',
                                    borderRadius: '8px',
                                    border: '2px solid white',
                                    objectFit: 'cover',
                                    backgroundColor: 'black'
                                }}
                            />

                            <Button
                                variant="destructive"
                                onClick={endCall}
                                className="absolute top-4 right-4 z-10"
                            >
                                End Call
                            </Button>
                        </div>
                    )}

                    <Messages selectedUser={selectedUser} />
                    <div className='flex items-center p-4 border-t border-t-gray-300'>
                        <Input 
                            value={textMessage} 
                            onChange={(e) => setTextMessage(e.target.value)} 
                            type="text" 
                            className='flex-1 mr-2 focus-visible:ring-transparent' 
                            placeholder="Messages..." 
                        />
                        <Button onClick={() => sendMessageHandler(selectedUser?._id)}>
                            Send
                        </Button>
                    </div>
                </section>
            ) : (
                <div className='flex flex-col items-center justify-center mx-auto'>
                    <MessageCircleCode className='w-32 h-32 my-4' />
                    <h1 className='font-medium'>Your messages</h1>
                    <span>Send a message to start a chat.</span>
                </div>
            )}
        </div>
    );
};

export default ChatPage;