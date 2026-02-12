// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import useGetFollowingUsers from "@/hooks/useGetFollowingUsers";
// const ChatList = () => {
//    useGetFollowingUsers();
//   const navigate = useNavigate();
//   const { followingUsers } = useSelector(store => store.auth);
//   const { onlineUsers } = useSelector(store => store.chat);

//   return (
//     <div className="h-full bg-white">
//       {/* HEADER */}
//       <div className="px-4 py-3 border-b font-semibold text-lg">
//         Messages
//       </div>

//       {/* USERS LIST */}
//       <div className="divide-y">
//         {followingUsers.map(user => {
//           const isOnline = onlineUsers.includes(user._id);

//           return (
//             <div
//               key={user._id}
//               onClick={() => navigate(`/chat/${user._id}`)}
//               className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-100"
//             >
//               <Avatar className="h-12 w-12">
//                 <AvatarImage src={user.profilePicture} />
//                 <AvatarFallback>
//                   {user.username[0].toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>

//               <div className="flex-1">
//                 <p className="font-medium">{user.username}</p>
//                 <p className="text-xs text-gray-500">
//                   {isOnline ? "online" : "offline"}
//                 </p>
//               </div>

//               {isOnline && (
//                 <span className="h-2 w-2 rounded-full bg-green-500" />
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ChatList;

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetFollowingUsers from "@/hooks/useGetFollowingUsers";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search } from "lucide-react";
import { useState } from "react";

const ChatList = () => {
  useGetFollowingUsers();
  const navigate = useNavigate();
  const { followingUsers } = useSelector(store => store.auth);
  const { onlineUsers } = useSelector(store => store.chat);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = followingUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-gradient-to-b from-white to-gray-50/50 flex flex-col">
      {/* HEADER */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-10"
      >
        <div className="flex items-center justify-between mb-3">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Messages
          </motion.h1>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
          >
            <MessageCircle className="text-white" size={20} />
          </motion.div>
        </div>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </motion.div>
      </motion.div>

      {/* ONLINE COUNT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="h-2 w-2 rounded-full bg-green-500"
        />
        {onlineUsers.length} online
      </motion.div>

      {/* USERS LIST */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-64 text-gray-400"
            >
              <MessageCircle size={48} className="mb-2" />
              <p>No conversations found</p>
            </motion.div>
          ) : (
            filteredUsers.map((user, index) => {
              const isOnline = onlineUsers.includes(user._id);

              return (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4, backgroundColor: "rgba(243, 244, 246, 0.8)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/chat/${user._id}`)}
                  className="
                    flex items-center gap-4 px-4 py-3 
                    cursor-pointer 
                    border-b border-gray-100
                    transition-all
                    relative
                    overflow-hidden
                  "
                >
                  {/* Gradient hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-transparent transition-all">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    
                    {/* Online status indicator */}
                    {isOnline && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-white"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="h-full w-full rounded-full bg-green-400"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex-1 relative z-10">
                    <motion.p
                      className="font-semibold text-gray-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {user.username}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className={`text-xs font-medium ${
                        isOnline ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {isOnline ? "Active now" : "Offline"}
                    </motion.p>
                  </div>

                  {/* Arrow indicator */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="text-purple-500"
                  >
                    →
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatList;