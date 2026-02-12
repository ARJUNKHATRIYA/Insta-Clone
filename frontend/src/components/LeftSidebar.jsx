// import React, { useState } from "react";
// import {
//   Heart,
//   Home,
//   LogOut,
//   MessageCircle,
//   PlusSquare,
//   Search,
// } from "lucide-react";
// import { Film } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { toast } from "sonner";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { setAuthUser } from "@/redux/authSlice";
// import { setPosts, setSelectedPost } from "@/redux/postSlice";
// import CreatePost from "./CreatePost";
// import CreateReel from "./CreateReel";
// import { motion } from "framer-motion";

// const sidebarVariants = {
//   hidden: { x: -40, opacity: 0 },
//   visible: {
//     x: 0,
//     opacity: 1,
//     transition: { staggerChildren: 0.06, ease: "easeOut" },
//   },
// };

// const itemVariants = {
//   hidden: { x: -20, opacity: 0 },
//   visible: { x: 0, opacity: 1 },
// };

// const LeftSidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { user } = useSelector((store) => store.auth);

//   const notifications = useSelector(
//     (store) => store.realTimeNotification.notifications
//   );

//   const [open, setOpen] = useState(false);
//   const [createType, setCreateType] = useState(null);

//   const logoutHandler = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:8000/api/v1/user/logout",
//         { withCredentials: true }
//       );
//       if (res.data.success) {
//         dispatch(setAuthUser(null));
//         dispatch(setSelectedPost(null));
//         dispatch(setPosts([]));
//         navigate("/login");
//         toast.success(res.data.message);
//       }
//     } catch {
//       toast.error("Logout failed");
//     }
//   };

//   const sidebarHandler = (type) => {
//     if (type === "Logout") logoutHandler();
//     else if (type === "Home") navigate("/");
//     else if (type === "Reels") navigate("/reels");
//     else if (type === "Search") navigate("/search");
//     else if (type === "Messages") navigate("/chat");
//     else if (type === "Notifications") navigate("/notifications");
//     else if (type === "Profile") navigate(`/profile/${user?._id}`);
//     else if (type === "Create Post") {
//       setCreateType("post");
//       setOpen(true);
//     } else if (type === "Create Reel") {
//       setCreateType("reel");
//       setOpen(true);
//     }
//   };

//   const sidebarItems = [
//     { icon: <Home />, text: "Home", path: "/" },
//     { icon: <Film />, text: "Reels", path: "/reels" },
//     { icon: <Search />, text: "Search" },
//     { icon: <MessageCircle />, text: "Messages", path: "/chat" },
//     { icon: <Heart />, text: "Notifications", path: "/notifications" },
//     { icon: <PlusSquare />, text: "Create Post" },
//     { icon: <PlusSquare />, text: "Create Reel" },
//     {
//       icon: (
//         <Avatar className="w-7 h-7 ring-2 ring-transparent group-hover:ring-black transition">
//           <AvatarImage src={user?.profilePicture} />
//           <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
//         </Avatar>
//       ),
//       text: "Profile",
//       path: `/profile/${user?._id}`,
//     },
//     { icon: <LogOut />, text: "Logout" },
//   ];

//   return (
//     <>
//       <motion.aside
//         variants={sidebarVariants}
//         initial="hidden"
//         animate="visible"
//         className="
//           h-screen
//           sticky top-0
//           flex flex-col
//           px-4
//           bg-gradient-to-b from-slate-50/90 to-slate-100/80
//           border-r border-gray-200
//           backdrop-blur-xl
//         "
//       >
//         {/* LOGO */}
//         <motion.div
//           initial={{ scale: 0.8, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 120 }}
//           className="my-6 flex justify-center lg:justify-start"
//         >
//           <img
//             src="/social_logo.png"
//             alt="Logo"
//             className="h-14 w-14 rounded-full bg-white p-2 shadow-md hover:scale-105 transition"
//           />
//         </motion.div>

//         {/* MENU */}
//         <nav className="flex flex-col gap-1">
//           {sidebarItems.map((item, index) => {
//             const isActive =
//               item.path && location.pathname === item.path;

//             return (
//               <motion.div
//                 key={index}
//                 variants={itemVariants}
//                 whileHover={{ x: 6 }}
//                 whileTap={{ scale: 0.96 }}
//                 onClick={() => sidebarHandler(item.text)}
//                 className={`
//                   group relative
//                   flex items-center gap-4
//                   p-3 rounded-xl
//                   cursor-pointer
//                   transition-all
//                   ${isActive ? "bg-white shadow-sm" : "hover:bg-white"}
//                 `}
//               >
//                 {/* ACTIVE INDICATOR */}
//                 {isActive && (
//                   <motion.span
//                     layoutId="active-pill"
//                     className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-black"
//                   />
//                 )}

//                 {/* ICON */}
//                 <motion.div
//                   whileHover={{ scale: 1.15, rotate: 3 }}
//                   className="text-gray-700 group-hover:text-black"
//                 >
//                   {item.icon}
//                 </motion.div>

//                 {/* TEXT */}
//                 <span className="hidden lg:block text-sm font-medium">
//                   {item.text}
//                 </span>

//                 {/* NOTIFICATION BADGE */}
//                 {item.text === "Notifications" && notifications.length > 0 && (
//                   <motion.span
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ type: "spring", stiffness: 200 }}
//                     className="ml-auto hidden lg:flex h-5 w-5 text-xs items-center justify-center rounded-full bg-red-600 text-white"
//                   >
//                     {notifications.length}
//                   </motion.span>
//                 )}
//               </motion.div>
//             );
//           })}
//         </nav>
//       </motion.aside>

//       {/* CREATE MODALS */}
//       {createType === "post" && <CreatePost open={open} setOpen={setOpen} />}
//       {createType === "reel" && <CreateReel open={open} setOpen={setOpen} />}
//     </>
//   );
// };

// export default LeftSidebar;

import React, { useState, useEffect } from "react";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
} from "lucide-react";
import { Film } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import CreatePost from "./CreatePost";
import CreateReel from "./CreateReel";
import { motion } from "framer-motion";

const sidebarVariants = {
  hidden: { x: -40, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { staggerChildren: 0.06, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

// Animated Logo Component for Desktop Sidebar
const AnimatedSidebarLogo = () => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      setAnimationPhase(1);
      
      setTimeout(() => {
        setAnimationPhase(2);
      }, 2800);

      setTimeout(() => {
        setAnimationPhase(0);
      }, 4200);
    };

    const interval = setInterval(sequence, 4500);
    sequence();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center lg:items-start gap-3">
      {/* Animated Icon */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* White Dashed Circle - expands and fades */}
        <motion.div
          key={`white-${animationPhase}`}
          initial={{ scale: 0, opacity: 1 }}
          animate={
            animationPhase === 1
              ? { scale: 3, opacity: 0, rotate: 360 }
              : { scale: 0, opacity: 1 }
          }
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute w-10 h-10 border-2 border-dashed border-purple-400 rounded-full"
        />

        {/* Container for dark dashed circle */}
        <motion.div
          key={`container-${animationPhase}`}
          initial={{ scale: 0 }}
          animate={animationPhase >= 1 ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut", delay: 0.1 }}
          className="absolute"
        >
          {/* Dark Dashed Circle - rotates continuously */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            className="w-9 h-9 border-2 border-dashed border-purple-500 rounded-full bg-transparent"
          />
        </motion.div>

        {/* Dark Solid Circle */}
        <motion.div
          key={`dark-${animationPhase}`}
          initial={{ scale: 0 }}
          animate={animationPhase >= 1 ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.5 }}
          className="absolute w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full z-10 shadow-lg"
        />

        {/* Text */}
        <motion.div
          key={`text-${animationPhase}`}
          initial={{ scale: 0 }}
          animate={animationPhase >= 1 ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 1.2, delay: 0.55 }}
          className="absolute z-20 flex items-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={animationPhase >= 1 ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 1.2, delay: 0.55 }}
            className="text-white font-black text-xl leading-none relative -right-0.5 -top-0.5"
          >
            SS
          </motion.span>
          <motion.span
            initial={{ scale: 0, rotate: 45 }}
            animate={
              animationPhase >= 1
                ? { scale: 1, rotate: 15 }
                : { scale: 0, rotate: 45 }
            }
            transition={{ duration: 1.2, delay: 0 }}
            className="text-white font-black text-2xl ml-0.5"
          >
            !
          </motion.span>
        </motion.div>

        {/* Fade out overlay */}
        <motion.div
          key={`fade-${animationPhase}`}
          initial={{ opacity: 0 }}
          animate={animationPhase === 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"
        />
      </div>

      {/* Brand Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        className="hidden lg:block"
      >
        <motion.h1
          className="text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% auto",
          }}
        >
          SocialSphere
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] text-gray-500 font-medium tracking-wider"
        >
          CONNECT & SHARE
        </motion.p>
      </motion.div>
    </div>
  );
};

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const notifications = useSelector(
    (store) => store.realTimeNotification.notifications
  );

  const [open, setOpen] = useState(false);
  const [createType, setCreateType] = useState(null);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/logout",
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  const sidebarHandler = (type) => {
    if (type === "Logout") logoutHandler();
    else if (type === "Home") navigate("/");
    else if (type === "Reels") navigate("/reels");
    else if (type === "Search") navigate("/search");
    else if (type === "Messages") navigate("/chat");
    else if (type === "Notifications") navigate("/notifications");
    else if (type === "Profile") navigate(`/profile/${user?._id}`);
    else if (type === "Create Post") {
      setCreateType("post");
      setOpen(true);
    } else if (type === "Create Reel") {
      setCreateType("reel");
      setOpen(true);
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home", path: "/" },
    { icon: <Film />, text: "Reels", path: "/reels" },
    { icon: <Search />, text: "Search", path: "/search" },
    { icon: <MessageCircle />, text: "Messages", path: "/chat" },
    { icon: <Heart />, text: "Notifications", path: "/notifications" },
    { icon: <PlusSquare />, text: "Create Post" },
    { icon: <PlusSquare />, text: "Create Reel" },
    {
      icon: (
        <Avatar className="w-7 h-7 ring-2 ring-transparent group-hover:ring-purple-500 transition-all">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            {user?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
      path: `/profile/${user?._id}`,
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <>
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="
          h-screen
          sticky top-0
          flex flex-col
          px-4
          bg-gradient-to-b from-slate-50/90 via-purple-50/20 to-slate-100/80
          border-r border-gray-200
          backdrop-blur-xl
          overflow-hidden
        "
      >
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 opacity-30 pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 0%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* LOGO */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
          className="my-6 flex justify-center lg:justify-start relative z-10"
        >
          <AnimatedSidebarLogo />
        </motion.div>

        {/* MENU */}
        <nav className="flex flex-col gap-1 relative z-10">
          {sidebarItems.map((item, index) => {
            const isActive = item.path && location.pathname === item.path;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => sidebarHandler(item.text)}
                className={`
                  group relative
                  flex items-center gap-4
                  p-3 rounded-xl
                  cursor-pointer
                  transition-all
                  overflow-hidden
                  ${
                    isActive
                      ? "bg-white shadow-md shadow-purple-100/50"
                      : "hover:bg-white/80"
                  }
                `}
              >
                {/* Gradient Background on Hover/Active */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                  animate={isActive ? { opacity: 0.1 } : { opacity: 0 }}
                />

                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* ICON */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 3 }}
                  className={`
                    relative z-10 transition-all
                    ${
                      isActive
                        ? "text-purple-600"
                        : "text-gray-700 group-hover:text-purple-600"
                    }
                  `}
                >
                  {item.icon}
                </motion.div>

                {/* TEXT */}
                <span
                  className={`
                  hidden lg:block text-sm font-medium relative z-10 transition-colors
                  ${
                    isActive
                      ? "text-purple-700 font-semibold"
                      : "text-gray-700 group-hover:text-purple-700"
                  }
                `}
                >
                  {item.text}
                </span>

                {/* NOTIFICATION BADGE */}
                {item.text === "Notifications" && notifications.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="ml-auto hidden lg:flex h-5 w-5 text-xs items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold shadow-lg relative z-10"
                  >
                    {notifications.length}
                  </motion.span>
                )}

                {/* Sparkle Effect on Hover */}
                {!isActive && (
                  <motion.div
                    className="absolute right-2 opacity-0 group-hover:opacity-100"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Floating Particles Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-300 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.aside>

      {/* CREATE MODALS */}
      {createType === "post" && <CreatePost open={open} setOpen={setOpen} />}
      {createType === "reel" && <CreateReel open={open} setOpen={setOpen} />}
    </>
  );
};

export default LeftSidebar;