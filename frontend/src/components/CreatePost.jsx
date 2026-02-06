import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const dataUrl = await readFileAsDataURL(selected);
    setImagePreview(dataUrl);
  };

  const createPostHandler = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/v1/post/addpost",
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        // ✅ INSTANT UI UPDATE
        dispatch(addPost(res.data.post));

        toast.success("Post created");
        setOpen(false);
        setCaption("");
        setImagePreview("");
        setFile(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={!loading ? setOpen : undefined}>
      <DialogContent className="w-[95vw] max-w-lg p-0 rounded-2xl bg-white/90">
        <DialogHeader className="text-center py-4 border-b font-semibold">
          Create new post
        </DialogHeader>

        {/* USER */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-sm font-semibold">{user?.username}</h1>
            <span className="text-xs text-gray-500">Sharing publicly</span>
          </div>
        </div>

        {/* CAPTION */}
        <div className="px-4">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="resize-none border-none focus-visible:ring-0"
          />
        </div>

        {/* PREVIEW */}
        {imagePreview && (
          <div className="px-4 pt-3">
            <img
              src={imagePreview}
              className="w-full h-64 object-cover rounded-xl"
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="p-4 space-y-3">
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            hidden
            onChange={fileChangeHandler}
          />

          {!imagePreview && (
            <Button onClick={() => imageRef.current.click()} className="w-full">
              <ImagePlus size={18} /> Select image
            </Button>
          )}

          {imagePreview && (
            <Button disabled={loading} onClick={createPostHandler} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Share
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
