// import { Phone, Video, ArrowLeft } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ChatHeader = ({ startCall }) => {
//   const navigate = useNavigate();
//   const { selectedUser } = useSelector(store => store.chat);

//   return (
//     <div className="
//       flex items-center justify-between
//       px-3 py-2
//       border-b border-gray-300
//       sticky top-0 bg-white z-10
//     ">
//       {/* LEFT */}
//       <div className="flex items-center gap-3">
//         {/* BACK BUTTON – MOBILE ONLY */}
//         <button
//           onClick={() => navigate("/chat")}
//           className="lg:hidden"
//         >
//           <ArrowLeft />
//         </button>

//         <Avatar>
//           <AvatarImage src={selectedUser?.profilePicture} />
//           <AvatarFallback>CN</AvatarFallback>
//         </Avatar>

//         <span className="text-sm font-medium">
//           {selectedUser?.username}
//         </span>
//       </div>

//       {/* RIGHT */}
//       <div className="flex gap-5">
//         <Phone
//           className="cursor-pointer"
//           onClick={() => startCall("audio")}
//         />
//         <Video
//           className="cursor-pointer"
//           onClick={() => startCall("video")}
//         />
//       </div>
//     </div>
//   );
// };

// export default ChatHeader;

import { Phone, Video, ArrowLeft, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const ChatHeader = ({ startCall }) => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector(store => store.chat);
  const { onlineUsers } = useSelector(store => store.chat);
  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
        flex items-center justify-between
        px-4 py-3
        border-b border-gray-200
        sticky top-0 bg-white/80 backdrop-blur-xl z-10
        shadow-sm
      "
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        {/* BACK BUTTON – MOBILE ONLY */}
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/chat")}
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>

        {/* AVATAR WITH ONLINE STATUS */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative"
        >
          <motion.div whileHover={{ scale: 1.05 }}>
            <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
              <AvatarImage src={selectedUser?.profilePicture} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                {selectedUser?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          {/* Online indicator */}
          {isOnline && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-full w-full rounded-full bg-green-400"
              />
            </motion.div>
          )}
        </motion.div>

        {/* USERNAME & STATUS */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="font-semibold text-gray-800">
            {selectedUser?.username}
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xs ${isOnline ? "text-green-600" : "text-gray-400"}`}
          >
            {isOnline ? "Active now" : "Offline"}
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT SECTION - CALL BUTTONS */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2"
      >
        {/* AUDIO CALL */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => startCall("audio")}
          className="p-2.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Phone size={18} />
        </motion.button>

        {/* VIDEO CALL */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => startCall("video")}
          className="p-2.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Video size={18} />
        </motion.button>

        {/* MORE OPTIONS */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-full hover:bg-gray-100 transition-colors hidden md:block"
        >
          <MoreVertical size={18} className="text-gray-600" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ChatHeader;