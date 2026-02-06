import {
  Home,
  Film,
  PlusSquare,
  MessageCircle,
  User
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import CreatePost from "./CreatePost";
import CreateReel from "./CreateReel";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(store => store.auth);

  const [open, setOpen] = useState(false);
  const [createType, setCreateType] = useState(null);

  const isActive = (path) =>
    location.pathname === path ? "text-black" : "text-gray-500";

  return (
    <>
      <nav
        className="
          fixed bottom-0 left-0 right-0
          bg-white border-t border-gray-200
          flex justify-around items-center
          h-14
          md:hidden
          z-50
        "
      >
        {/* HOME */}
        <Home
          className={`cursor-pointer ${isActive("/")}`}
          onClick={() => navigate("/")}
        />

        {/* REELS */}
        <Film
          className={`cursor-pointer ${isActive("/reels")}`}
          onClick={() => navigate("/reels")}
        />

        {/* CREATE */}
        <PlusSquare
          className="cursor-pointer"
          onClick={() => {
            setCreateType("post");
            setOpen(true);
          }}
        />

        {/* MESSAGES */}
        <MessageCircle
          className={`cursor-pointer ${isActive("/chat")}`}
          onClick={() => navigate("/chat")}
        />

        {/* PROFILE */}
        <User
          className={`cursor-pointer ${isActive(`/profile/${user?._id}`)}`}
          onClick={() => navigate(`/profile/${user?._id}`)}
        />
      </nav>

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
