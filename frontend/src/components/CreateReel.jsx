import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setReels } from "@/redux/reelSlice";

const CreateReel = ({ open, setOpen }) => {
  const videoRef = useRef(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const { reels } = useSelector((store) => store.reel);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const dataUrl = await readFileAsDataURL(selected);
    setVideoPreview(dataUrl);
  };

  const createReelHandler = async () => {
    if (!file) return toast.error("Video required");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("media", file);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/reel/addreel",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setReels([res.data.reel, ...reels]));
        toast.success(res.data.message);
        setOpen(false);
        setCaption("");
        setFile(null);
        setVideoPreview("");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload reel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={!loading ? setOpen : undefined}>
      <DialogContent
        className="
          w-[95vw] max-w-lg
          p-0 overflow-hidden
          rounded-2xl
          backdrop-blur-xl
          bg-white/80
        "
      >
        {/* HEADER */}
        <DialogHeader className="text-center py-4 border-b font-semibold">
          Create new reel
        </DialogHeader>

        {/* USER */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-sm font-semibold">{user?.username}</h1>
            <span className="text-xs text-gray-500">Reels</span>
          </div>
        </div>

        {/* CAPTION */}
        <div className="px-4">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="
              resize-none
              border-none
              focus-visible:ring-0
              text-sm
              placeholder:text-gray-400
            "
          />
        </div>

        {/* VIDEO PREVIEW */}
        {videoPreview && (
          <div className="px-4 pt-3">
            <div className="relative rounded-xl overflow-hidden">
              <video
                src={videoPreview}
                controls
                className="
                  w-full h-64 object-cover
                  transition-transform duration-300
                  hover:scale-[1.02]
                "
              />
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="p-4 space-y-3">
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            hidden
            onChange={fileChangeHandler}
          />

          {!videoPreview && (
            <Button
              onClick={() => videoRef.current.click()}
              className="
                w-full
                bg-[#0095F6]
                hover:bg-[#1877f2]
                flex items-center gap-2
              "
            >
              <Video size={18} />
              Select video
            </Button>
          )}

          {videoPreview && (
            <Button
              disabled={loading}
              onClick={createReelHandler}
              className="w-full"
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Share reel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReel;
