import { Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {useSelector } from 'react-redux'
const ChatHeader = ({ startCall }) => {
    const { onlineUsers, messages, selectedUser } = useSelector(
        (store) => store.chat
    );
    return (

        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10">

            {/* Left: Avatar + Username */}
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage
                        src={selectedUser?.profilePicture}
                        alt="profile"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium">
                    {selectedUser?.username}
                </span>
            </div>

            {/* Right: Call buttons */}
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
