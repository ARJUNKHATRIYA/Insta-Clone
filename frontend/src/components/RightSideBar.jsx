import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);

  return (
    <aside
      className="
  sticky top-24
  w-[320px]
  self-start
  rounded-xl
  p-5
  bg-white
  border border-gray-200
  shadow-sm
"

    >
      {/* FULL PROFILE CLICKABLE */}
      <Link
        to={`/profile/${user?._id}`}
        className="
          flex items-center gap-3 mb-6
          group cursor-pointer
        "
      >
        {/* AVATAR */}
        <div
          className="
            p-[2px]
            rounded-full
            bg-gradient-to-tr from-blue-400 to-purple-500
            transition-transform duration-300
            group-hover:scale-105
          "
        >
          <Avatar className="w-12 h-12 bg-white">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        {/* USER INFO */}
        <div className="leading-tight">
          <h1
            className="
              font-semibold text-sm
              relative inline-block
              after:absolute after:left-0 after:-bottom-0.5
              after:h-[2px] after:w-0 after:bg-black
              after:transition-all after:duration-300
              group-hover:after:w-full
            "
          >
            {user?.username}
          </h1>

          <span className="text-gray-600 text-sm block">
            {user?.bio || "Bio here..."}
          </span>
        </div>
      </Link>

      {/* DIVIDER */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300/60 to-transparent mb-4" />

      {/* SUGGESTED USERS */}
      <SuggestedUsers />
    </aside>
  );
};

export default RightSidebar;
