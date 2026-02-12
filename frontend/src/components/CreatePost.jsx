// import React, { useRef, useState } from "react";
// import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Textarea } from "./ui/textarea";
// import { Button } from "./ui/button";
// import { readFileAsDataURL } from "@/lib/utils";
// import { Loader2, ImagePlus } from "lucide-react";
// import { toast } from "sonner";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import { addPost } from "@/redux/postSlice";

// const CreatePost = ({ open, setOpen }) => {
//   const imageRef = useRef(null);
//   const [file, setFile] = useState(null);
//   const [caption, setCaption] = useState("");
//   const [imagePreview, setImagePreview] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { user } = useSelector((store) => store.auth);
//   const dispatch = useDispatch();

//   const fileChangeHandler = async (e) => {
//     const selected = e.target.files?.[0];
//     if (!selected) return;

//     setFile(selected);
//     const dataUrl = await readFileAsDataURL(selected);
//     setImagePreview(dataUrl);
//   };

//   const createPostHandler = async () => {
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("caption", caption);
//     formData.append("image", file);

//     try {
//       setLoading(true);

//       const res = await axios.post(
//         "http://localhost:8000/api/v1/post/addpost",
//         formData,
//         { withCredentials: true }
//       );

//       if (res.data.success) {
//         // ✅ INSTANT UI UPDATE
//         dispatch(addPost(res.data.post));

//         toast.success("Post created");
//         setOpen(false);
//         setCaption("");
//         setImagePreview("");
//         setFile(null);
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={!loading ? setOpen : undefined}>
//       <DialogContent className="w-[95vw] max-w-lg p-0 rounded-2xl bg-white/90">
//         <DialogHeader className="text-center py-4 border-b font-semibold">
//           Create new post
//         </DialogHeader>

//         {/* USER */}
//         <div className="flex items-center gap-3 px-4 py-3">
//           <Avatar className="w-9 h-9">
//             <AvatarImage src={user?.profilePicture} />
//             <AvatarFallback>CN</AvatarFallback>
//           </Avatar>
//           <div>
//             <h1 className="text-sm font-semibold">{user?.username}</h1>
//             <span className="text-xs text-gray-500">Sharing publicly</span>
//           </div>
//         </div>

//         {/* CAPTION */}
//         <div className="px-4">
//           <Textarea
//             value={caption}
//             onChange={(e) => setCaption(e.target.value)}
//             placeholder="Write a caption..."
//             className="resize-none border-none focus-visible:ring-0"
//           />
//         </div>

//         {/* PREVIEW */}
//         {imagePreview && (
//           <div className="px-4 pt-3">
//             <img
//               src={imagePreview}
//               className="w-full h-64 object-cover rounded-xl"
//             />
//           </div>
//         )}

//         {/* ACTIONS */}
//         <div className="p-4 space-y-3">
//           <input
//             ref={imageRef}
//             type="file"
//             accept="image/*"
//             hidden
//             onChange={fileChangeHandler}
//           />

//           {!imagePreview && (
//             <Button onClick={() => imageRef.current.click()} className="w-full">
//               <ImagePlus size={18} /> Select image
//             </Button>
//           )}

//           {imagePreview && (
//             <Button disabled={loading} onClick={createPostHandler} className="w-full">
//               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Share
//             </Button>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreatePost;

import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, ImagePlus, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "@/redux/postSlice";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={!loading ? setOpen : undefined}>
          <DialogContent className="w-[95vw] max-w-lg p-0 rounded-3xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-0 shadow-2xl overflow-hidden">
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 opacity-30 pointer-events-none"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
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
                <Sparkles className="text-purple-500" size={20} />
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Create New Post
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
                  <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                      {user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <h1 className="text-sm font-semibold text-gray-800">
                    {user?.username}
                  </h1>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    Sharing publicly
                    <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
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
                  placeholder="What's on your mind?"
                  className="resize-none border-none focus-visible:ring-0 bg-transparent text-sm placeholder:text-gray-400 min-h-[100px]"
                />
              </motion.div>

              {/* IMAGE PREVIEW */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-6 pt-3 relative"
                  >
                    <div className="relative rounded-2xl overflow-hidden group">
                      <img
                        src={imagePreview}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        alt="Preview"
                      />
                      {/* Remove image button */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setImagePreview("");
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
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={fileChangeHandler}
                />

                {!imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => imageRef.current.click()}
                      className="w-full py-8 border-2 border-dashed border-purple-300 rounded-2xl bg-purple-50/50 hover:bg-purple-100/50 transition-all flex flex-col items-center gap-3 group"
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"
                      >
                        <ImagePlus className="text-white" size={24} />
                      </motion.div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                          Select Image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Drag & drop or click to browse
                        </p>
                      </div>
                    </motion.button>
                  </motion.div>
                )}

                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      onClick={createPostHandler}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Share Post
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

export default CreatePost;