// import React from "react";
// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { motion, AnimatePresence } from "framer-motion";

// const SuggestedUsers = () => {
//   const { suggestedUsers } = useSelector((store) => store.auth);

//   return (
//     <div className="my-10">

//       <div className="flex items-center justify-between text-sm">
//         <h1 className="font-semibold text-gray-600">Suggested for you</h1>
//         {suggestedUsers?.length > 0 && (
//           <span className="font-medium cursor-pointer">See All</span>
//         )}
//       </div>

//       {/* EMPTY STATE */}
//       {(!suggestedUsers || suggestedUsers.length === 0) ? (
//         <div className="flex items-center justify-center h-80">
//           <p className="text-lg font-bold text-black-500 text-center">
//             You have no more suggestions
//           </p>
//         </div>
//       ) : (
//         /* SUGGESTED USERS LIST */
//         <div className="mt-4 h-[320px] overflow-hidden relative">
//           <motion.div
//             className="space-y-5 absolute w-full"
//             animate={{ y: ["0%", "-50%"] }}
//             transition={{
//               repeat: Infinity,
//               duration: suggestedUsers.length * 2,
//               ease: "linear",
//             }}
//           >
//             {[...suggestedUsers, ...suggestedUsers].map((user, index) => (
//               <div
//                 key={`${user._id}-${index}`}
//                 className="flex items-center justify-between"
//               >
//                 <div className="flex items-center gap-2">
//                   <Link to={`/profile/${user._id}`}>
//                     <Avatar>
//                       <AvatarImage src={user.profilePicture} alt="profile" />
//                       <AvatarFallback>CN</AvatarFallback>
//                     </Avatar>
//                   </Link>

//                   <div>
//                     <h1 className="font-semibold text-sm">
//                       <Link to={`/profile/${user._id}`}>
//                         {user.username}
//                       </Link>
//                     </h1>
//                     <span className="text-gray-600 text-sm">
//                       {user.bio || "Bio here..."}
//                     </span>
//                   </div>
//                 </div>

//                 <span className="text-[#3BADF8] text-xs font-bold cursor-pointer">
//                   Follow
//                 </span>
//               </div>
//             ))}
//           </motion.div>
//         </div>

//       )}
//     </div>
//   );
// };

// export default SuggestedUsers;

import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Sparkles } from "lucide-react";

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector((store) => store.auth);

  return (
    <div className="my-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between text-sm mb-4"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Users className="text-purple-500" size={18} />
          </motion.div>
          <h1 className="font-semibold text-gray-700">Suggested for you</h1>
        </div>
        {suggestedUsers?.length > 0 && (
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="font-medium cursor-pointer text-purple-600 hover:text-purple-700 transition-colors"
          >
            See All
          </motion.span>
        )}
      </motion.div>

      {/* EMPTY STATE */}
      {(!suggestedUsers || suggestedUsers.length === 0) ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-4"
          >
            <Users className="text-gray-400" size={64} />
          </motion.div>
          <p className="text-lg font-bold text-gray-500 text-center">
            You have no more suggestions
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Check back later for new recommendations
          </p>
        </motion.div>
      ) : (
        /* SUGGESTED USERS LIST */
        <div className="mt-4 h-[320px] overflow-hidden relative rounded-2xl bg-gradient-to-b from-gray-50/50 to-white p-4">
          {/* Gradient overlay at top and bottom */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          <motion.div
            className="space-y-4 absolute w-full"
            animate={{ y: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: suggestedUsers.length * 3,
              ease: "linear",
            }}
          >
            {[...suggestedUsers, ...suggestedUsers].map((user, index) => (
              <motion.div
                key={`${user._id}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4, scale: 1.02 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${user._id}`}>
                    <motion.div whileHover={{ scale: 1.1 }} className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-purple-500/20 transition-all">
                        <AvatarImage src={user.profilePicture} alt="profile" />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                          {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white"
                      />
                    </motion.div>
                  </Link>

                  <div>
                    <h1 className="font-semibold text-sm group-hover:text-purple-600 transition-colors">
                      <Link to={`/profile/${user._id}`}>
                        {user.username}
                      </Link>
                    </h1>
                    <span className="text-gray-500 text-xs line-clamp-1">
                      {user.bio || "New to SocialSphere"}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-all"
                >
                  <UserPlus size={14} />
                  Follow
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SuggestedUsers;