import { motion } from "framer-motion";
import { Camera, Users } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import CreatePost from "./CreatePost";
import { useNavigate } from "react-router-dom";

const EmptyFeed = () => {
  const navigate = useNavigate();

  // 🔥 SAME LOGIC AS LEFT SIDEBAR
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center px-6 py-20"
      >
        {/* ICON */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-6"
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Camera className="text-white" size={36} />
          </div>
        </motion.div>

        {/* TEXT */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Your feed is empty
        </h2>

        <p className="text-gray-500 max-w-sm mb-8">
          Start sharing moments or follow people to see what they’re up to.
        </p>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* ✅ FIXED BUTTON */}
          <Button
            className="bg-[#0095F6] hover:bg-[#0077cc]"
            onClick={() => setOpen(true)}
          >
            Create your first post
          </Button>

          <Button
            variant="secondary"
            className="flex gap-2"
            onClick={() => navigate("/search")}
          >
            <Users size={18} />
            Find friends
          </Button>
        </div>
      </motion.div>

      {/* ✅ CREATE POST MODAL */}
      <CreatePost open={open} setOpen={setOpen} />
    </>
  );
};

export default EmptyFeed;
