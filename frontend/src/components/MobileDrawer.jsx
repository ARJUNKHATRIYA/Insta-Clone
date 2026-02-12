import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Film,
  PlusSquare,
  MessageCircle,
  Heart,
  User,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const MobileDrawer = ({ open, setOpen, setCreateType }) => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);

  const items = [
    { icon: <Home />, label: "Home", path: "/" },
    { icon: <Film />, label: "Reels", path: "/reels" },
    { icon: <MessageCircle />, label: "Messages", path: "/chat" },
    { icon: <Heart />, label: "Notifications", path: "/notifications" },
    { icon: <PlusSquare />, label: "Create Post", action: "post" },
    { icon: <PlusSquare />, label: "Create Reel", action: "reel" },
    { icon: <User />, label: "Profile", path: `/profile/${user?._id}` },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* DRAWER */}
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="
              fixed left-0 top-0 bottom-0
              w-64 bg-white z-50
              shadow-2xl p-6
              md:hidden
            "
          >
            {/* CLOSE */}
            <X
              className="mb-6 cursor-pointer"
              onClick={() => setOpen(false)}
            />

            {/* MENU */}
            <div className="flex flex-col gap-6">
              {items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (item.action) {
                      setCreateType(item.action);
                    } else {
                      navigate(item.path);
                    }
                    setOpen(false);
                  }}
                  className="flex items-center gap-4 text-lg cursor-pointer hover:translate-x-2 transition"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
