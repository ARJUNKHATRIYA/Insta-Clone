import axios from "axios";
import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { Link, useLocation } from "react-router-dom";

const FollowRequestItem = ({ user, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const dispatch = useDispatch();
  const authUser = useSelector(store => store.auth.user);
  const location = useLocation();

  const accept = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:8000/api/v1/user/follow/accept/${user._id}`,
        {},
        { withCredentials: true }
      );

      if (!res.data.success) throw new Error();

      const { receiver } = res.data;

      console.log("✅ Received from backend:", receiver);
      console.log("✅ Receiver followers:", receiver.followers);

      // Update logged-in user (User B) with COMPLETE data from backend
      dispatch(setAuthUser(receiver));

      // Mark as accepted to show follow back button
      setAccepted(true);
      
      toast.success("Follow request accepted");

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

  const followBack = async () => {
    try {
      setLoading(true);

      console.log("=== FOLLOW BACK REQUEST ===");
      console.log("Current user followers:", authUser.followers);
      console.log("Target user ID:", user._id);

      const res = await axios.post(
        `http://localhost:8000/api/v1/user/follow/back/${user._id}`,
        {},
        { withCredentials: true }
      );

      if (!res.data.success) {
        console.error("Follow back failed:", res.data);
        throw new Error(res.data.message || "Failed");
      }

      console.log("✅ Follow back successful:", res.data.user);

      // Update logged-in user (User B)
      dispatch(setAuthUser(res.data.user));

      // ✅ CRITICAL FIX: If currently viewing User A's profile, update it
      const isViewingUserProfile = location.pathname.includes(`/profile/${user._id}`);
      
      if (isViewingUserProfile) {
        try {
          const profileRes = await axios.get(
            `http://localhost:8000/api/v1/user/${user._id}/profile`,
            { withCredentials: true }
          );
          
          if (profileRes.data.success) {
            dispatch(setUserProfile(profileRes.data.user));
          }
        } catch (profileErr) {
          console.error("Failed to update profile:", profileErr);
        }
      }

      toast.success("Followed back");
      
      // Now remove notification
      refresh();

    } catch (err) {
      console.error("Follow back error:", err);
      toast.error(err.response?.data?.message || "Failed to follow back");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white border">
      <Link to={`/profile/${user._id}`} className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>
            {user?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{user?.username}</span>
      </Link>

      <div className="flex gap-2">
        {accepted ? (
          <Button 
            size="sm" 
            className="bg-[#0095F6] hover:bg-[#0095F6]/90"
            disabled={loading} 
            onClick={followBack}
          >
            Follow back
          </Button>
        ) : (
          <>
            <Button size="sm" disabled={loading} onClick={accept}>
              Accept
            </Button>
            <Button size="sm" variant="secondary" disabled={loading} onClick={reject}>
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FollowRequestItem;