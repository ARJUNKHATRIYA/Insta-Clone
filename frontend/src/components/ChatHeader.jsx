import { Phone, Video, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ChatHeader = ({ startCall }) => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector(store => store.chat);

  return (
    <div className="
      flex items-center justify-between
      px-3 py-2
      border-b border-gray-300
      sticky top-0 bg-white z-10
    ">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* BACK BUTTON – MOBILE ONLY */}
        <button
          onClick={() => navigate("/chat")}
          className="lg:hidden"
        >
          <ArrowLeft />
        </button>

        <Avatar>
          <AvatarImage src={selectedUser?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <span className="text-sm font-medium">
          {selectedUser?.username}
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex gap-5">
        <Phone
          className="cursor-pointer"
          onClick={() => startCall("audio")}
        />
        <Video
          className="cursor-pointer"
          onClick={() => startCall("video")}
        />
      </div>
    </div>
  );
};

export default ChatHeader;
