import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Comment = ({ comment }) => {
  return (
    <div className="flex items-start gap-3 py-2">
      {/* AVATAR */}
      <Avatar className="w-8 h-8">
        <AvatarImage src={comment?.author?.profilePicture} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      {/* COMMENT BODY */}
      <div className="text-sm leading-snug break-words">
        <span className="font-semibold mr-1">
          {comment?.author?.username}
        </span>
        <span className="text-gray-800">
          {comment?.text}
        </span>
      </div>
    </div>
  );
};

export default Comment;
