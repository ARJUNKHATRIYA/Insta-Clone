import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetFollowingUsers from "@/hooks/useGetFollowingUsers";
const ChatList = () => {
   useGetFollowingUsers();
  const navigate = useNavigate();
  const { followingUsers } = useSelector(store => store.auth);
  const { onlineUsers } = useSelector(store => store.chat);

  return (
    <div className="h-full bg-white">
      {/* HEADER */}
      <div className="px-4 py-3 border-b font-semibold text-lg">
        Messages
      </div>

      {/* USERS LIST */}
      <div className="divide-y">
        {followingUsers.map(user => {
          const isOnline = onlineUsers.includes(user._id);

          return (
            <div
              key={user._id}
              onClick={() => navigate(`/chat/${user._id}`)}
              className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-100"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-gray-500">
                  {isOnline ? "online" : "offline"}
                </p>
              </div>

              {isOnline && (
                <span className="h-2 w-2 rounded-full bg-green-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
