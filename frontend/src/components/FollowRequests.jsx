import axios from "axios";
import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";

const FollowRequestItem = ({ user, refresh }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const authUser = useSelector(store => store.auth.user);

  const accept = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:8000/api/v1/user/follow/accept/${user._id}`,
        {},
        { withCredentials: true }
      );

      if (!res.data.success) {
        throw new Error("Accept failed");
      }
      const { senderId, receiverId } = res.data;

      // logged-in user is ALWAYS the receiver (User B)
      dispatch(setAuthUser({
        ...authUser,
        followers: authUser.followers.includes(senderId)
          ? authUser.followers
          : [...authUser.followers, senderId]
      }));

      // if profile page is open, update it
      dispatch(setUserProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          following: prev.following?.includes(receiverId)
            ? prev.following
            : [...prev.following, receiverId]
        };
      }));


      toast.success("Follow request accepted");
      refresh(); // remove notification

    } catch (err) {
      console.error(err);
      toast.error("Failed to accept request");
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:8000/api/v1/user/follow/reject/${user._id}`,
        {},
        { withCredentials: true }
      );
      toast.info("Follow request rejected");
      refresh();
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white border">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>
            {user?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{user?.username}</span>
      </div>

      <div className="flex gap-2">
        <Button size="sm" disabled={loading} onClick={accept}>
          Accept
        </Button>
        <Button size="sm" variant="secondary" disabled={loading} onClick={reject}>
          Reject
        </Button>
      </div>
    </div>
  );
};


export default FollowRequestItem;
