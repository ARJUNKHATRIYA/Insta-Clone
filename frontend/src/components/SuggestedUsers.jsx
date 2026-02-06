import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector((store) => store.auth);

  return (
    <div className="my-10">

      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        {suggestedUsers?.length > 0 && (
          <span className="font-medium cursor-pointer">See All</span>
        )}
      </div>

      {/* EMPTY STATE */}
      {(!suggestedUsers || suggestedUsers.length === 0) ? (
        <div className="flex items-center justify-center h-80">
          <p className="text-lg font-bold text-black-500 text-center">
            You have no more suggestions
          </p>
        </div>
      ) : (
        /* SUGGESTED USERS LIST */
        <div className="mt-4 h-[320px] overflow-hidden relative">
          <motion.div
            className="space-y-5 absolute w-full"
            animate={{ y: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: suggestedUsers.length * 2,
              ease: "linear",
            }}
          >
            {[...suggestedUsers, ...suggestedUsers].map((user, index) => (
              <div
                key={`${user._id}-${index}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${user._id}`}>
                    <Avatar>
                      <AvatarImage src={user.profilePicture} alt="profile" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Link>

                  <div>
                    <h1 className="font-semibold text-sm">
                      <Link to={`/profile/${user._id}`}>
                        {user.username}
                      </Link>
                    </h1>
                    <span className="text-gray-600 text-sm">
                      {user.bio || "Bio here..."}
                    </span>
                  </div>
                </div>

                <span className="text-[#3BADF8] text-xs font-bold cursor-pointer">
                  Follow
                </span>
              </div>
            ))}
          </motion.div>
        </div>

      )}
    </div>
  );
};

export default SuggestedUsers;

