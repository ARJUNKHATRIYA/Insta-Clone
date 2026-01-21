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
        <span className="font-medium cursor-pointer">See All</span>
      </div>

      {/* Scrollable container */}
      <div className="mt-4 max-h-[320px] overflow-y-auto space-y-5 pr-1">
        <AnimatePresence>
          {suggestedUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
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

              <motion.span
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]"
              >
                Follow
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuggestedUsers;
