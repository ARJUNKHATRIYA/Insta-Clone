import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { X } from "lucide-react";
import { toast } from "sonner";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { setPosts } from "@/redux/postSlice";
import { setReels } from "@/redux/reelSlice";

const FollowersModal = ({ users = [], onClose, type }) => {
  const dispatch = useDispatch();

  const authUser = useSelector(store => store.auth.user);
  const userProfile = useSelector(store => store.auth.userProfile);
  const posts = useSelector(store => store.post.posts);
  const reels = useSelector(store => store.reel.reels);

  const [list, setList] = useState(users);

  if (!authUser?._id) return null;

  const unfollow = async (targetId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/user/unfollow/${targetId}`,
        {},
        { withCredentials: true }
      );

      // 1️⃣ Update modal list
      setList(prev => prev.filter(u => u._id !== targetId));

      // 2️⃣ Update logged-in user
      dispatch(setAuthUser({
        ...authUser,
        following: authUser.following.filter(id => id !== targetId)
      }));

      // 3️⃣ Update viewed profile counts
      dispatch(setUserProfile({
        ...userProfile,
        followers: userProfile.followers?.filter(u => u._id !== targetId),
        following: userProfile.following?.filter(u => u._id !== targetId)
      }));

      // 4️⃣ Remove posts & reels instantly
      dispatch(setPosts(posts.filter(p => p.author?._id !== targetId)));
      dispatch(setReels(reels.filter(r => r.author?._id !== targetId)));

      toast.success("Unfollowed");
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold capitalize">{type}</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* LIST */}
        <div className="max-h-[60vh] overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No {type}
            </p>
          ) : (
            list.map(u => (
              <div
                key={u._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={u.profilePicture} />
                    <AvatarFallback>
                      {u.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <p className="font-medium">{u.username}</p>
                </div>

                {authUser._id !== u._id && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => unfollow(u._id)}
                  >
                    Unfollow
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
