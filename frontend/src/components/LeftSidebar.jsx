import React, { useState } from "react";
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
    { icon: <Search />, text: "Search" },
    { icon: <MessageCircle />, text: "Messages", path: "/chat" },
    { icon: <Heart />, text: "Notifications", path: "/notifications" },
    { icon: <PlusSquare />, text: "Create Post" },
    { icon: <PlusSquare />, text: "Create Reel" },
    {
      icon: (
        <Avatar className="w-7 h-7 ring-2 ring-transparent group-hover:ring-black transition">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
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
          bg-gradient-to-b from-slate-50/90 to-slate-100/80
          border-r border-gray-200
          backdrop-blur-xl
        "
      >
        {/* LOGO */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="my-6 flex justify-center lg:justify-start"
        >
          <img
            src="/social_logo.png"
            alt="Logo"
            className="h-14 w-14 rounded-full bg-white p-2 shadow-md hover:scale-105 transition"
          />
        </motion.div>

        {/* MENU */}
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item, index) => {
            const isActive =
              item.path && location.pathname === item.path;

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
                  ${isActive ? "bg-white shadow-sm" : "hover:bg-white"}
                `}
              >
                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-black"
                  />
                )}

                {/* ICON */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 3 }}
                  className="text-gray-700 group-hover:text-black"
                >
                  {item.icon}
                </motion.div>

                {/* TEXT */}
                <span className="hidden lg:block text-sm font-medium">
                  {item.text}
                </span>

                {/* NOTIFICATION BADGE */}
                {item.text === "Notifications" && notifications.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="ml-auto hidden lg:flex h-5 w-5 text-xs items-center justify-center rounded-full bg-red-600 text-white"
                  >
                    {notifications.length}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </nav>
      </motion.aside>

      {/* CREATE MODALS */}
      {createType === "post" && <CreatePost open={open} setOpen={setOpen} />}
      {createType === "reel" && <CreateReel open={open} setOpen={setOpen} />}
    </>
  );
};

export default LeftSidebar;