import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { BsBookmarkFill } from "react-icons/bs";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import { setReels, setSelectedReel } from "@/redux/reelSlice";

const Reel = ({ reel }) => {
  const videoRef = useRef(null);
  const dispatch = useDispatch();

  const { user } = useSelector(store => store.auth);
  const { reels } = useSelector(store => store.reel);

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundIcon, setShowSoundIcon] = useState(false);

  const toggleSound = () => {
    setIsMuted(prev => !prev);
    setShowSoundIcon(true);

    setTimeout(() => {
      setShowSoundIcon(false);
    }, 900); // Instagram-like delay
  };


  const likeCount = reel.likes?.length || 0;
  const commentCount = reel.comments?.length || 0;

  if (!user) return null;

  /* 🔁 AUTOPLAY / PAUSE */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        entry.isIntersecting
          ? videoRef.current.play()
          : videoRef.current.pause();
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  /* ❤️ LIKE STATE */
  useEffect(() => {
    setLiked(reel.likes?.includes(user._id));
  }, [reel.likes, user._id]);

  /* 🔖 BOOKMARK STATE */
  useEffect(() => {
    setBookmarked(user.reelBookmarks?.includes(reel._id));
  }, [user.reelBookmarks, reel._id]);

  /* ❤️ LIKE / DISLIKE */
  const likeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";

      const res = await axios.get(
        `http://localhost:8000/api/v1/reel/${reel._id}/${action}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedReels = reels.map(r =>
          r._id === reel._id
            ? {
              ...r,
              likes: liked
                ? r.likes.filter(id => id !== user._id)
                : [...r.likes, user._id],
            }
            : r
        );

        dispatch(setReels(updatedReels));
        setLiked(!liked);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* 💬 COMMENT */
  const commentHandler = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/reel/${reel._id}/comment`,
        { text },
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedReels = reels.map(r =>
          r._id === reel._id
            ? { ...r, comments: [...(r.comments || []), res.data.comment] }
            : r
        );

        dispatch(setReels(updatedReels));
        setText("");
        toast.success(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* 🗑 DELETE */
  const deleteReelHandler = async () => {
    const res = await axios.delete(
      `http://localhost:8000/api/v1/reel/delete/${reel._id}`,
      { withCredentials: true }
    );

    if (res.data.success) {
      dispatch(setReels(reels.filter(r => r._id !== reel._id)));
      toast.success(res.data.message);
    }
  };

  /* 🔖 BOOKMARK */
  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/reel/${reel._id}/bookmark`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const current = user.reelBookmarks || [];

        const updated =
          res.data.type === "saved"
            ? [...current, reel._id]
            : current.filter(id => id !== reel._id);

        dispatch(setAuthUser({ ...user, reelBookmarks: updated }));
        setBookmarked(res.data.type === "saved");
        toast.success(res.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] my-8 w-full max-w-sm mx-auto bg-black relative rounded-xl overflow-hidden">

      {/* 🎥 VIDEO */}
      <video
        ref={videoRef}
        src={reel.media}
        loop
        muted={isMuted}
        className="h-full w-full object-cover cursor-pointer"
        onClick={toggleSound}
      />


      {/* 🔊 SOUND ICON */}
      {showSoundIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 p-4 rounded-full">
            {isMuted ? (
              <VolumeX size={36} className="text-white" />
            ) : (
              <Volume2 size={36} className="text-white" />
            )}
          </div>
        </div>
      )}


      {/* HEADER */}
      <div className="absolute top-4 left-4 right-4 flex justify-between text-white">
        <div className="flex gap-2 items-center">
          <Avatar>
            <AvatarImage src={reel.author.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>{reel.author.username}</span>
        </div>

        {user._id === reel.author._id && (
          <Dialog>
            <DialogTrigger>
              <MoreHorizontal className="cursor-pointer" />
            </DialogTrigger>

            <DialogContent className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirm("Delete this reel?")) {
                    deleteReelHandler();
                  }
                }}
              >
                Delete
              </Button>

            </DialogContent>
          </Dialog>
        )}

      </div>

      {/* ACTIONS */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 text-white">

        <div className="flex flex-col items-center gap-1 cursor-pointer">
          {liked ? (
            <FaHeart size={28} className="text-red-600" onClick={likeHandler} />
          ) : (
            <FaRegHeart size={26} onClick={likeHandler} />
          )}
          <span className="text-xs">{likeCount}</span>
        </div>

        <div
          className="flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => {
            dispatch(setSelectedReel(reel));
            setOpen(true);
          }}
        >
          <MessageCircle size={26} />
          <span className="text-xs">{commentCount}</span>
        </div>

        <div className="cursor-pointer">
          {bookmarked ? (
            <BsBookmarkFill onClick={bookmarkHandler} />
          ) : (
            <Bookmark onClick={bookmarkHandler} />
          )}
        </div>
      </div>

      {/* CAPTION */}
      <div className="absolute bottom-10 left-4 text-white max-w-sm">
        <span className="font-semibold">{reel.author.username}</span>{" "}
        {reel.caption}
      </div>

      {/* COMMENT INPUT */}
      <div className="absolute bottom-2 left-4 right-4 flex gap-2 text-white">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
          className="bg-transparent outline-none flex-1"
        />
        {text && <Send onClick={commentHandler} />}
      </div>

      <CommentDialog open={open} setOpen={setOpen} type="reel" />
    </div>
  );
};

export default Reel;
