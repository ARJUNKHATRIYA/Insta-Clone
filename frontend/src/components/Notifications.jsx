import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import useGetNotifications from "@/hooks/useGetNotifications";
import { removeNotification } from "@/redux/rtnSlice";
import FollowRequestItem from "./FollowRequests";

const Notifications = () => {
  useGetNotifications();
  const dispatch = useDispatch();

  const notifications = useSelector(
    store => store.realTimeNotification.notifications
  );

  return (
    <div className="my-10 w-full max-w-xl mx-auto px-4">
      <h2 className="text-xl font-semibold mb-6">Notifications</h2>

      {notifications.length === 0 ? (
        <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
          No notifications yet
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => {
            const senderId = n.senderDetails?._id;

            // ✅ FOLLOW REQUEST NOTIFICATION (User B sees this)
            if (n.type === "follow_request" && n.senderDetails?._id) {
              return (
                <FollowRequestItem
                  key={n._id}
                  user={n.senderDetails}
                  refresh={() => dispatch(removeNotification(n._id))}
                />
              );
            }
            // ✅ FOLLOW ACCEPT NOTIFICATION (User A sees this)
            if (n.type === "follow_accept" && n.senderDetails?._id) {
              return (
                <div
                  key={n._id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
                >
                  <Link to={`/profile/${senderId}`}>
                    <Avatar>
                      <AvatarImage src={n.senderDetails.profilePicture} />
                      <AvatarFallback>
                        {n.senderDetails.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <span className="text-sm">
                    <Link
                      to={`/profile/${senderId}`}
                      className="font-semibold hover:underline"
                    >
                      {n.senderDetails.username}
                    </Link>{" "}
                    accepted your follow request
                  </span>
                </div>
              );
            }


            // ✅ FOLLOW BACK NOTIFICATION (User A sees this when User B follows back)
            if (n.type === "follow_back" && n.senderDetails?._id) {
              return (
                <div
                  key={n._id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
                >
                  <Link to={`/profile/${senderId}`}>
                    <Avatar>
                      <AvatarImage src={n.senderDetails?.profilePicture} />
                      <AvatarFallback>
                        {n.senderDetails?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <span className="text-sm">
                    <Link
                      to={`/profile/${senderId}`}
                      className="font-semibold hover:underline"
                    >
                      {n.senderDetails?.username}
                    </Link>{" "}
                    followed you back
                  </span>
                </div>
              );
            }

            // ✅ LIKE NOTIFICATIONS
            return (
              <div
                key={n._id}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
              >
                <Link to={`/profile/${senderId}`}>
                  <Avatar>
                    <AvatarImage src={n.senderDetails?.profilePicture} />
                    <AvatarFallback>
                      {n.senderDetails?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <span className="text-sm">
                  <Link
                    to={`/profile/${senderId}`}
                    className="font-semibold hover:underline"
                  >
                    {n.senderDetails?.username}
                  </Link>{" "}
                  {n.type === "post_like" && "liked your post"}
                  {n.type === "reel_like" && "liked your reel"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
