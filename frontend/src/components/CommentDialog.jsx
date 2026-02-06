import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setReels, setSelectedReel } from "@/redux/reelSlice";

const CommentDialog = ({ open, setOpen, type }) => {
  const dispatch = useDispatch();

  const postState = useSelector(store => store.post);
  const reelState = useSelector(store => store.reel);

  const selectedItem =
    type === "post" ? postState.selectedPost : reelState.selectedReel;

  const items =
    type === "post" ? postState.posts : reelState.reels;

  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (selectedItem) {
      setComments(selectedItem.comments || []);
    }
  }, [selectedItem]);

  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/${type}/${selectedItem._id}/comment`,
        { text },
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedComments = [...comments, res.data.comment];
        setComments(updatedComments);

        const updatedItems = items.map(item =>
          item._id === selectedItem._id
            ? { ...item, comments: updatedComments }
            : item
        );

        if (type === "post") {
          dispatch(setPosts(updatedItems));
          dispatch(setSelectedPost({
            ...selectedItem,
            comments: updatedComments
          }));
        } else {
          dispatch(setReels(updatedItems));
          dispatch(setSelectedReel({
            ...selectedItem,
            comments: updatedComments
          }));
        }

        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl p-0 flex"
      >
        {/* MEDIA */}
        <div className="w-1/2 bg-black">
          {type === "post" ? (
            <img
              src={selectedItem?.image}
              alt="post"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={selectedItem?.media}
              autoPlay
              loop
              muted
              controls
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* COMMENTS */}
        <div className="w-1/2 flex flex-col justify-between">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <Avatar>
                <AvatarImage src={selectedItem?.author?.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Link className="font-semibold text-xs">
                {selectedItem?.author?.username}
              </Link>
            </div>
            <MoreHorizontal className="cursor-pointer" />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {comments.map(c => (
              <Comment key={c._id} comment={c} />
            ))}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border p-2 rounded outline-none"
            />
            <Button disabled={!text.trim()} onClick={sendMessageHandler}>
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
