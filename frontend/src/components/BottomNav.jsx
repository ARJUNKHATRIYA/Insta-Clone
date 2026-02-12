// import {
//   Home,
//   Film,
//   PlusSquare,
//   MessageCircle,
//   User,
//   X,
//   Menu,
//   Heart,
//   Search,
//   LogOut,
//   Sparkles
// } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { useState } from "react";
// import CreatePost from "./CreatePost";
// import CreateReel from "./CreateReel";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { toast } from "sonner";
// import axios from "axios";
// import { setAuthUser } from "@/redux/authSlice";
// import { setPosts, setSelectedPost } from "@/redux/postSlice";
// import { motion, AnimatePresence } from "framer-motion";

// const BottomNav = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { user } = useSelector(store => store.auth);
//   const notifications = useSelector(
//     (store) => store.realTimeNotification.notifications
//   );

//   const [open, setOpen] = useState(false);
//   const [createType, setCreateType] = useState(null);
//   const [showCreateOptions, setShowCreateOptions] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);

//   const isActive = (path) =>
//     location.pathname === path;

//   const handleCreateSelect = (type) => {
//     setCreateType(type);
//     setShowCreateOptions(false);
//     setOpen(true);
//   };

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

//   const menuItems = [
//     { 
//       icon: <Search className="w-6 h-6" />, 
//       text: "Search", 
//       path: "/search",
//       gradient: "from-blue-400 to-cyan-400"
//     },
//     { 
//       icon: <Heart className="w-6 h-6" />, 
//       text: "Notifications", 
//       path: "/notifications", 
//       badge: notifications.length,
//       gradient: "from-pink-400 to-rose-400"
//     },
//     { 
//       icon: <PlusSquare className="w-6 h-6" />, 
//       text: "Create Post", 
//       action: "create-post",
//       gradient: "from-purple-400 to-indigo-400"
//     },
//     { 
//       icon: <Film className="w-6 h-6" />, 
//       text: "Create Reel", 
//       action: "create-reel",
//       gradient: "from-orange-400 to-pink-400"
//     },
//     { 
//       icon: <LogOut className="w-6 h-6" />, 
//       text: "Logout", 
//       action: "logout",
//       gradient: "from-red-400 to-pink-400"
//     },
//   ];

//   const handleMenuClick = (item) => {
//     setShowMenu(false);
    
//     if (item.action === "create-post") {
//       setCreateType("post");
//       setOpen(true);
//     } else if (item.action === "create-reel") {
//       setCreateType("reel");
//       setOpen(true);
//     } else if (item.action === "logout") {
//       logoutHandler();
//     } else if (item.path) {
//       navigate(item.path);
//     }
//   };

//   const navItems = [
//     { icon: Home, path: "/", label: "Home" },
//     { icon: Film, path: "/reels", label: "Reels" },
//     { icon: PlusSquare, action: "create", label: "Create" },
//     { icon: MessageCircle, path: "/chat", label: "Messages" },
//     { icon: Menu, action: "menu", label: "SocialSphere" },
//   ];

//   return (
//     <>
//       {/* BOTTOM NAVIGATION */}
//       <motion.nav
//         initial={{ y: 100 }}
//         animate={{ y: 0 }}
//         transition={{ type: "spring", stiffness: 260, damping: 20 }}
//         className="
//           fixed bottom-0 left-0 right-0
//           bg-white/80 backdrop-blur-xl border-t border-gray-200/50
//           flex justify-around items-center
//           h-16
//           md:hidden
//           z-50
//           shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
//         "
//       >
//         {navItems.map((item, index) => {
//           const Icon = item.icon;
//           const active = item.path && isActive(item.path);
          
//           return (
//             <motion.div
//               key={index}
//               whileTap={{ scale: 0.85 }}
//               className="relative flex flex-col items-center justify-center"
//               onClick={() => {
//                 if (item.action === "create") setShowCreateOptions(true);
//                 else if (item.action === "menu") setShowMenu(true);
//                 else if (item.path) navigate(item.path);
//               }}
//             >
//               {/* Active Indicator */}
//               {active && (
//                 <motion.div
//                   layoutId="bottomNavActive"
//                   className="absolute -top-4 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
//                   transition={{ type: "spring", stiffness: 380, damping: 30 }}
//                 />
//               )}

//               <motion.div
//                 whileHover={{ scale: 1.1, rotate: active ? 0 : 5 }}
//                 className={`
//                   p-2 rounded-2xl transition-all cursor-pointer
//                   ${active ? "bg-gradient-to-br from-blue-50 to-purple-50" : ""}
//                 `}
//               >
//                 <Icon 
//                   className={`
//                     transition-all
//                     ${active ? "text-black scale-110" : "text-gray-500"}
//                   `}
//                   size={24}
//                 />
//               </motion.div>

//               {/* Notification Badge for Menu */}
//               {item.action === "menu" && notifications.length > 0 && (
//                 <motion.span
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold shadow-lg"
//                 >
//                   {notifications.length}
//                 </motion.span>
//               )}
//             </motion.div>
//           );
//         })}
//       </motion.nav>

//       {/* SIDE MENU MODAL */}
//       <AnimatePresence>
//         {showMenu && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
//               onClick={() => setShowMenu(false)}
//             />

//             {/* Menu Panel */}
//             <motion.div
//               initial={{ x: "100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "100%" }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               className="fixed right-0 top-0 bottom-0 w-80 bg-gradient-to-br from-white via-gray-50 to-purple-50/30 shadow-2xl z-50"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* HEADER */}
//               <div className="relative p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-xl">
//                 <div className="flex justify-between items-center">
//                   <motion.div
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.1 }}
//                   >
//                     <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                      SocialSphere
//                     </h2>
//                   </motion.div>
//                   <motion.div
//                     whileHover={{ rotate: 90, scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <X
//                       className="cursor-pointer text-gray-500 hover:text-black transition-colors"
//                       onClick={() => setShowMenu(false)}
//                       size={24}
//                     />
//                   </motion.div>
//                 </div>
//               </div>

//               {/* PROFILE SECTION */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.15 }}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="m-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 cursor-pointer shadow-lg hover:shadow-xl transition-all"
//                 onClick={() => {
//                   setShowMenu(false);
//                   navigate(`/profile/${user?._id}`);
//                 }}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="relative">
//                     <Avatar className="w-14 h-14 ring-4 ring-white/50">
//                       <AvatarImage src={user?.profilePicture} />
//                       <AvatarFallback className="bg-white text-purple-600 font-bold">
//                         {user?.username?.[0]?.toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                     <motion.div
//                       animate={{ scale: [1, 1.2, 1] }}
//                       transition={{ repeat: Infinity, duration: 2 }}
//                       className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"
//                     />
//                   </div>
//                   <div className="text-white">
//                     <p className="font-bold text-lg">{user?.username}</p>
//                     <p className="text-sm text-white/80 flex items-center gap-1">
//                       View Profile
//                       <Sparkles size={12} />
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* MENU ITEMS */}
//               <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-240px)]">
//                 {menuItems.map((item, index) => (
//                   <motion.div
//                     key={index}
//                     initial={{ opacity: 0, x: 50 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.2 + index * 0.05 }}
//                     whileHover={{ x: 8, scale: 1.02 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => handleMenuClick(item)}
//                     className={`
//                       group relative
//                       flex items-center gap-4
//                       p-4 rounded-xl
//                       cursor-pointer
//                       transition-all
//                       overflow-hidden
//                       ${item.path && location.pathname === item.path 
//                         ? "bg-white shadow-md" 
//                         : "bg-white/50 hover:bg-white hover:shadow-lg"
//                       }
//                     `}
//                   >
//                     {/* Gradient Background on Hover */}
//                     <div className={`
//                       absolute inset-0 bg-gradient-to-r ${item.gradient}
//                       opacity-0 group-hover:opacity-10 transition-opacity duration-300
//                     `} />

//                     {/* Icon Container */}
//                     <motion.div
//                       whileHover={{ rotate: [0, -10, 10, -10, 0] }}
//                       transition={{ duration: 0.5 }}
//                       className={`
//                         relative z-10 p-2 rounded-lg bg-gradient-to-br ${item.gradient}
//                         shadow-md
//                       `}
//                     >
//                       <div className="text-white">
//                         {item.icon}
//                       </div>
//                     </motion.div>

//                     {/* Text */}
//                     <span className="relative z-10 font-semibold text-gray-700 group-hover:text-black transition-colors flex-1">
//                       {item.text}
//                     </span>

//                     {/* Notification Badge */}
//                     {item.badge > 0 && (
//                       <motion.span
//                         initial={{ scale: 0 }}
//                         animate={{ scale: 1 }}
//                         whileHover={{ scale: 1.15 }}
//                         className="relative z-10 h-7 w-7 text-xs flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold shadow-lg"
//                       >
//                         {item.badge}
//                       </motion.span>
//                     )}

//                     {/* Active Indicator */}
//                     {item.path && location.pathname === item.path && (
//                       <motion.div
//                         layoutId="activeMenuItem"
//                         className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.gradient} rounded-r-full`}
//                         transition={{ type: "spring", stiffness: 380, damping: 30 }}
//                       />
//                     )}
//                   </motion.div>
//                 ))}
//               </nav>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* CREATE OPTIONS MODAL */}
//       <AnimatePresence>
//         {showCreateOptions && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50"
//               onClick={() => setShowCreateOptions(false)}
//             >
//               {/* Modal */}
//               <motion.div
//                 initial={{ y: "100%", opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: "100%", opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                 className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-t-3xl md:rounded-2xl w-full md:w-96 p-6 shadow-2xl"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="flex justify-between items-center mb-6">
//                   <motion.h2
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
//                   >
//                     Create Something Amazing
//                   </motion.h2>
//                   <motion.div
//                     whileHover={{ rotate: 90, scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <X
//                       className="cursor-pointer text-gray-500 hover:text-black"
//                       onClick={() => setShowCreateOptions(false)}
//                     />
//                   </motion.div>
//                 </div>

//                 <div className="space-y-3">
//                   <motion.button
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.1 }}
//                     whileHover={{ scale: 1.03, x: 8 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => handleCreateSelect("post")}
//                     className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl transition-all text-white shadow-lg hover:shadow-xl group"
//                   >
//                     <motion.div
//                       whileHover={{ rotate: 360 }}
//                       transition={{ duration: 0.5 }}
//                       className="p-2 bg-white/20 rounded-lg"
//                     >
//                       <PlusSquare className="w-6 h-6" />
//                     </motion.div>
//                     <div className="text-left flex-1">
//                       <span className="font-bold text-lg block">Create Post</span>
//                       <span className="text-sm text-white/80">Share your moments</span>
//                     </div>
//                     <motion.div
//                       animate={{ x: [0, 5, 0] }}
//                       transition={{ repeat: Infinity, duration: 1.5 }}
//                       className="opacity-0 group-hover:opacity-100 transition-opacity"
//                     >
//                       →
//                     </motion.div>
//                   </motion.button>

//                   <motion.button
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.2 }}
//                     whileHover={{ scale: 1.03, x: 8 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => handleCreateSelect("reel")}
//                     className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl transition-all text-white shadow-lg hover:shadow-xl group"
//                   >
//                     <motion.div
//                       whileHover={{ rotate: 360 }}
//                       transition={{ duration: 0.5 }}
//                       className="p-2 bg-white/20 rounded-lg"
//                     >
//                       <Film className="w-6 h-6" />
//                     </motion.div>
//                     <div className="text-left flex-1">
//                       <span className="font-bold text-lg block">Create Reel</span>
//                       <span className="text-sm text-white/80">Make it viral</span>
//                     </div>
//                     <motion.div
//                       animate={{ x: [0, 5, 0] }}
//                       transition={{ repeat: Infinity, duration: 1.5 }}
//                       className="opacity-0 group-hover:opacity-100 transition-opacity"
//                     >
//                       →
//                     </motion.div>
//                   </motion.button>
//                 </div>
//               </motion.div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* MODALS */}
//       {createType === "post" && (
//         <CreatePost open={open} setOpen={setOpen} />
//       )}
//       {createType === "reel" && (
//         <CreateReel open={open} setOpen={setOpen} />
//       )}
//     </>
//   );
// };

// export default BottomNav;

import {
  Home,
  Film,
  PlusSquare,
  MessageCircle,
  User,
  X,
  Menu,
  Heart,
  Search,
  LogOut,
  Sparkles
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import CreateReel from "./CreateReel";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { setAuthUser } from "@/redux/authSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { motion, AnimatePresence } from "framer-motion";

// Animated Logo Component
const AnimatedLogo = () => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      // Phase 1: Show circles and text
      setAnimationPhase(1);
      
      // Phase 2: Fade out after delay
      setTimeout(() => {
        setAnimationPhase(2);
      }, 2800);

      // Phase 3: Reset and loop
      setTimeout(() => {
        setAnimationPhase(0);
      }, 4200);
    };

    const interval = setInterval(sequence, 4500);
    sequence(); // Start immediately

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
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
        className="absolute w-12 h-12 border-2 border-dashed border-white rounded-full"
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
          className="w-11 h-11 border-2 border-dashed border-purple-600 rounded-full bg-transparent"
        />
      </motion.div>

      {/* Dark Solid Circle */}
      <motion.div
        key={`dark-${animationPhase}`}
        initial={{ scale: 0 }}
        animate={animationPhase >= 1 ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.5 }}
        className="absolute w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full z-10"
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
          className="text-white font-black text-2xl leading-none relative -right-1 -top-1"
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
          className="text-white font-black text-3xl ml-0.5"
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
        className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"
      />
    </div>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);
  const notifications = useSelector(
    (store) => store.realTimeNotification.notifications
  );

  const [open, setOpen] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path) =>
    location.pathname === path;

  const handleCreateSelect = (type) => {
    setCreateType(type);
    setShowCreateOptions(false);
    setOpen(true);
  };

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

  const menuItems = [
    { 
      icon: <Search className="w-6 h-6" />, 
      text: "Search", 
      path: "/search",
      gradient: "from-blue-400 to-cyan-400"
    },
    { 
      icon: <Heart className="w-6 h-6" />, 
      text: "Notifications", 
      path: "/notifications", 
      badge: notifications.length,
      gradient: "from-pink-400 to-rose-400"
    },
    { 
      icon: <PlusSquare className="w-6 h-6" />, 
      text: "Create Post", 
      action: "create-post",
      gradient: "from-purple-400 to-indigo-400"
    },
    { 
      icon: <Film className="w-6 h-6" />, 
      text: "Create Reel", 
      action: "create-reel",
      gradient: "from-orange-400 to-pink-400"
    },
    { 
      icon: <LogOut className="w-6 h-6" />, 
      text: "Logout", 
      action: "logout",
      gradient: "from-red-400 to-pink-400"
    },
  ];

  const handleMenuClick = (item) => {
    setShowMenu(false);
    
    if (item.action === "create-post") {
      setCreateType("post");
      setOpen(true);
    } else if (item.action === "create-reel") {
      setCreateType("reel");
      setOpen(true);
    } else if (item.action === "logout") {
      logoutHandler();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Film, path: "/reels", label: "Reels" },
    { icon: PlusSquare, action: "create", label: "Create" },
    { icon: MessageCircle, path: "/chat", label: "Messages" },
    { icon: Menu, action: "menu", label: "SocialSphere" },
  ];

  return (
    <>
      {/* BOTTOM NAVIGATION */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="
          fixed bottom-0 left-0 right-0
          bg-white/80 backdrop-blur-xl border-t border-gray-200/50
          flex justify-around items-center
          h-16
          md:hidden
          z-50
          shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
        "
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = item.path && isActive(item.path);
          
          return (
            <motion.div
              key={index}
              whileTap={{ scale: 0.85 }}
              className="relative flex flex-col items-center justify-center"
              onClick={() => {
                if (item.action === "create") setShowCreateOptions(true);
                else if (item.action === "menu") setShowMenu(true);
                else if (item.path) navigate(item.path);
              }}
            >
              {/* Active Indicator */}
              {active && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute -top-4 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <motion.div
                whileHover={{ scale: 1.1, rotate: active ? 0 : 5 }}
                className={`
                  p-2 rounded-2xl transition-all cursor-pointer
                  ${active ? "bg-gradient-to-br from-blue-50 to-purple-50" : ""}
                `}
              >
                <Icon 
                  className={`
                    transition-all
                    ${active ? "text-black scale-110" : "text-gray-500"}
                  `}
                  size={24}
                />
              </motion.div>

              {/* Notification Badge for Menu */}
              {item.action === "menu" && notifications.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold shadow-lg"
                >
                  {notifications.length}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </motion.nav>

      {/* SIDE MENU MODAL */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-gradient-to-br from-white via-gray-50 to-purple-50/30 shadow-2xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER WITH ANIMATED LOGO */}
              <div className="relative p-6 border-b border-gray-200/50 bg-gradient-to-br from-purple-600 to-pink-600 backdrop-blur-xl">
                <div className="flex justify-between items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <AnimatedLogo />
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        SocialSphere
                      </h2>
                      <p className="text-xs text-white/70">Connect & Share</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X
                      className="cursor-pointer text-white hover:text-white/80 transition-colors"
                      onClick={() => setShowMenu(false)}
                      size={24}
                    />
                  </motion.div>
                </div>
              </div>

              {/* PROFILE SECTION */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="m-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  setShowMenu(false);
                  navigate(`/profile/${user?._id}`);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-14 h-14 ring-4 ring-white/50">
                      <AvatarImage src={user?.profilePicture} />
                      <AvatarFallback className="bg-white text-purple-600 font-bold">
                        {user?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"
                    />
                  </div>
                  <div className="text-white">
                    <p className="font-bold text-lg">{user?.username}</p>
                    <p className="text-sm text-white/80 flex items-center gap-1">
                      View Profile
                      <Sparkles size={12} />
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* MENU ITEMS */}
              <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    whileHover={{ x: 8, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMenuClick(item)}
                    className={`
                      group relative
                      flex items-center gap-4
                      p-4 rounded-xl
                      cursor-pointer
                      transition-all
                      overflow-hidden
                      ${item.path && location.pathname === item.path 
                        ? "bg-white shadow-md" 
                        : "bg-white/50 hover:bg-white hover:shadow-lg"
                      }
                    `}
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r ${item.gradient}
                      opacity-0 group-hover:opacity-10 transition-opacity duration-300
                    `} />

                    {/* Icon Container */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`
                        relative z-10 p-2 rounded-lg bg-gradient-to-br ${item.gradient}
                        shadow-md
                      `}
                    >
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </motion.div>

                    {/* Text */}
                    <span className="relative z-10 font-semibold text-gray-700 group-hover:text-black transition-colors flex-1">
                      {item.text}
                    </span>

                    {/* Notification Badge */}
                    {item.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.15 }}
                        className="relative z-10 h-7 w-7 text-xs flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold shadow-lg"
                      >
                        {item.badge}
                      </motion.span>
                    )}

                    {/* Active Indicator */}
                    {item.path && location.pathname === item.path && (
                      <motion.div
                        layoutId="activeMenuItem"
                        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.gradient} rounded-r-full`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE OPTIONS MODAL */}
      <AnimatePresence>
        {showCreateOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50"
              onClick={() => setShowCreateOptions(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-t-3xl md:rounded-2xl w-full md:w-96 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    Create Something Amazing
                  </motion.h2>
                  <motion.div
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X
                      className="cursor-pointer text-gray-500 hover:text-black"
                      onClick={() => setShowCreateOptions(false)}
                    />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.03, x: 8 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCreateSelect("post")}
                    className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl transition-all text-white shadow-lg hover:shadow-xl group"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="p-2 bg-white/20 rounded-lg"
                    >
                      <PlusSquare className="w-6 h-6" />
                    </motion.div>
                    <div className="text-left flex-1">
                      <span className="font-bold text-lg block">Create Post</span>
                      <span className="text-sm text-white/80">Share your moments</span>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      →
                    </motion.div>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.03, x: 8 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCreateSelect("reel")}
                    className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl transition-all text-white shadow-lg hover:shadow-xl group"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="p-2 bg-white/20 rounded-lg"
                    >
                      <Film className="w-6 h-6" />
                    </motion.div>
                    <div className="text-left flex-1">
                      <span className="font-bold text-lg block">Create Reel</span>
                      <span className="text-sm text-white/80">Make it viral</span>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      →
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODALS */}
      {createType === "post" && (
        <CreatePost open={open} setOpen={setOpen} />
      )}
      {createType === "reel" && (
        <CreateReel open={open} setOpen={setOpen} />
      )}
    </>
  );
};

export default BottomNav;