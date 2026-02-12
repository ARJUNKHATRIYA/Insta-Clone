// import React, { useRef, useState } from "react";
// import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Textarea } from "./ui/textarea";
// import { Button } from "./ui/button";
// import { readFileAsDataURL } from "@/lib/utils";
// import { Loader2, Video } from "lucide-react";
// import { toast } from "sonner";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import { setReels } from "@/redux/reelSlice";

// const CreateReel = ({ open, setOpen }) => {
//   const videoRef = useRef(null);
//   const [file, setFile] = useState(null);
//   const [caption, setCaption] = useState("");
//   const [videoPreview, setVideoPreview] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { user } = useSelector((store) => store.auth);
//   const { reels } = useSelector((store) => store.reel);
//   const dispatch = useDispatch();

//   const fileChangeHandler = async (e) => {
//     const selected = e.target.files?.[0];
//     if (!selected) return;

//     setFile(selected);
//     const dataUrl = await readFileAsDataURL(selected);
//     setVideoPreview(dataUrl);
//   };

//   const createReelHandler = async () => {
//     if (!file) return toast.error("Video required");

//     const formData = new FormData();
//     formData.append("caption", caption);
//     formData.append("media", file);

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         "http://localhost:8000/api/v1/reel/addreel",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           withCredentials: true,
//         }
//       );

//       if (res.data.success) {
//         dispatch(setReels([res.data.reel, ...reels]));
//         toast.success(res.data.message);
//         setOpen(false);
//         setCaption("");
//         setFile(null);
//         setVideoPreview("");
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to upload reel");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={!loading ? setOpen : undefined}>
//       <DialogContent
//         className="
//           w-[95vw] max-w-lg
//           p-0 overflow-hidden
//           rounded-2xl
//           backdrop-blur-xl
//           bg-white/80
//         "
//       >
//         {/* HEADER */}
//         <DialogHeader className="text-center py-4 border-b font-semibold">
//           Create new reel
//         </DialogHeader>

//         {/* USER */}
//         <div className="flex items-center gap-3 px-4 py-3">
//           <Avatar className="w-9 h-9">
//             <AvatarImage src={user?.profilePicture} />
//             <AvatarFallback>CN</AvatarFallback>
//           </Avatar>
//           <div>
//             <h1 className="text-sm font-semibold">{user?.username}</h1>
//             <span className="text-xs text-gray-500">Reels</span>
//           </div>
//         </div>

//         {/* CAPTION */}
//         <div className="px-4">
//           <Textarea
//             value={caption}
//             onChange={(e) => setCaption(e.target.value)}
//             placeholder="Write a caption..."
//             className="
//               resize-none
//               border-none
//               focus-visible:ring-0
//               text-sm
//               placeholder:text-gray-400
//             "
//           />
//         </div>

//         {/* VIDEO PREVIEW */}
//         {videoPreview && (
//           <div className="px-4 pt-3">
//             <div className="relative rounded-xl overflow-hidden">
//               <video
//                 src={videoPreview}
//                 controls
//                 className="
//                   w-full h-64 object-cover
//                   transition-transform duration-300
//                   hover:scale-[1.02]
//                 "
//               />
//             </div>
//           </div>
//         )}

//         {/* ACTIONS */}
//         <div className="p-4 space-y-3">
//           <input
//             ref={videoRef}
//             type="file"
//             accept="video/*"
//             hidden
//             onChange={fileChangeHandler}
//           />

//           {!videoPreview && (
//             <Button
//               onClick={() => videoRef.current.click()}
//               className="
//                 w-full
//                 bg-[#0095F6]
//                 hover:bg-[#1877f2]
//                 flex items-center gap-2
//               "
//             >
//               <Video size={18} />
//               Select video
//             </Button>
//           )}

//           {videoPreview && (
//             <Button
//               disabled={loading}
//               onClick={createReelHandler}
//               className="w-full"
//             >
//               {loading && (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               )}
//               Share reel
//             </Button>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreateReel;

import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, Video, X, Film, Sparkles } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setReels } from "@/redux/reelSlice";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={!loading ? setOpen : undefined}>
          <DialogContent className="w-[95vw] max-w-lg p-0 rounded-3xl bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 border-0 shadow-2xl overflow-hidden">
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 opacity-30 pointer-events-none"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(251, 146, 60, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 100%, rgba(251, 146, 60, 0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />

            {/* HEADER */}
            <DialogHeader className="relative z-10 text-center py-5 border-b border-gray-200/50 bg-white/50 backdrop-blur-xl">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <Film className="text-orange-500" size={20} />
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Create New Reel
                </h2>
              </motion.div>
            </DialogHeader>

            <div className="relative z-10">
              {/* USER INFO */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 px-6 py-4"
              >
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Avatar className="w-10 h-10 ring-2 ring-orange-500/20">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white font-bold">
                      {user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <h1 className="text-sm font-semibold text-gray-800">
                    {user?.username}
                  </h1>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    Reels
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="inline-block w-1 h-1 rounded-full bg-orange-500"
                    />
                  </span>
                </div>
              </motion.div>

              {/* CAPTION */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-6"
              >
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a catchy caption..."
                  className="resize-none border-none focus-visible:ring-0 bg-transparent text-sm placeholder:text-gray-400 min-h-[100px]"
                />
              </motion.div>

              {/* VIDEO PREVIEW */}
              <AnimatePresence>
                {videoPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-6 pt-3 relative"
                  >
                    <div className="relative rounded-2xl overflow-hidden group">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Remove video button */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setVideoPreview("");
                          setFile(null);
                        }}
                        className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-all"
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ACTIONS */}
              <div className="p-6 space-y-3">
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={fileChangeHandler}
                />

                {!videoPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => videoRef.current.click()}
                      className="w-full py-8 border-2 border-dashed border-orange-300 rounded-2xl bg-orange-50/50 hover:bg-orange-100/50 transition-all flex flex-col items-center gap-3 group"
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="p-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full"
                      >
                        <Video className="text-white" size={24} />
                      </motion.div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                          Select Video
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Max 60 seconds • MP4, MOV
                        </p>
                      </div>
                    </motion.button>
                  </motion.div>
                )}

                {videoPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      onClick={createReelHandler}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Share Reel
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default CreateReel;