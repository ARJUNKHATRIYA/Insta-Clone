import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "./ui/button";
import { Heart, MessageCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import FollowersModal from "./FollowersModal";
import { setPosts } from "@/redux/postSlice";
import { setReels } from "@/redux/reelSlice";
import { setUserProfile } from "@/redux/authSlice";
import { setSocket } from "@/redux/socketSlice";

/* ---------- EMPTY STATE ---------- */
const EmptyState = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center text-gray-500">
    <div className="h-16 w-16 rounded-full border border-gray-300 flex items-center justify-center mb-4">
      📷
    </div>
    <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
    <p className="text-sm mt-1">{subtitle}</p>
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  useGetUserProfile(id ?? null);

  const { user, userProfile } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const isOwnProfile = user?._id === userProfile?._id;

  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [modalUsers, setModalUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFollowBack, setShowFollowBack] = useState(false);



  /* ---------- MODALS ---------- */
  const openFollowers = async () => {
    if (!userProfile?._id || !userProfile.followers?.length) return;

    const res = await axios.get(
      `http://localhost:8000/api/v1/user/${userProfile._id}/followers`,
      { withCredentials: true }
    );
    setModalUsers(res.data.users);
    setShowModal("followers");
  };

  const openFollowing = async () => {
    if (!userProfile?._id || !userProfile.following?.length) return;

    const res = await axios.get(
      `http://localhost:8000/api/v1/user/${userProfile._id}/following`,
      { withCredentials: true }
    );
    setModalUsers(res.data.users);
    setShowModal("following");
  };

  /* ---------- LOGOUT ---------- */
  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/logout",
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSocket(null));
        toast.success("Logged out successfully");
        navigate("/login");
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  useEffect(() => {
    if (!user || !userProfile) return;
    const iFollowHim = user.following.includes(userProfile._id);
    const heFollowsMe = userProfile.followers.some(u => u._id === user._id);

    setIsFollowing(iFollowHim);
    setShowFollowBack(heFollowsMe && !iFollowHim);
    setIsRequested(userProfile.followRequests?.includes(user._id));

  }, [user, userProfile]);



  /* ---------- FOLLOW ACTIONS ---------- */
  const sendFollowRequest = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/follow/request/${userProfile._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsRequested(true);
        toast.success("Follow request sent");
      }
    } catch {
      toast.error("Failed to send request");
    }
  };


  const unfollowUser = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/unfollow/${userProfile._id}`,
        {},
        { withCredentials: true }
      );

      if (!res.data.success) return;

      // 🔥 logged-in user (B) removes A from following
      dispatch(setAuthUser({
        ...user,
        following: user.following.filter(
          id => id !== userProfile._id
        )
      }));

      // 🔥 viewed profile (A) removes B from followers
      dispatch(setUserProfile({
        ...userProfile,
        followers: userProfile.followers.filter(
          u => u._id !== user._id
        )
      }));

      setIsFollowing(false);
      setShowFollowBack(false);

      toast.success("Unfollowed");
    } catch {
      toast.error("Failed to unfollow");
    }
  };
  const followBack = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/follow/back/${userProfile._id}`,
        {},
        { withCredentials: true }
      );

      if (!res.data.success) return;

      // 🔥 logged-in user (B) now follows A
      dispatch(setAuthUser(res.data.user));

      // 🔥 viewed profile (A) gains follower B
      dispatch(setUserProfile({
        ...userProfile,
        followers: [
          ...userProfile.followers,
          {
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture
          }
        ]
      }));

      toast.success("Followed back");
    } catch {
      toast.error("Failed to follow back");
    }
  };


  /* ---------- TAB DATA ---------- */
  const displayedItems = (() => {
    if (activeTab === "posts") return userProfile?.posts || [];
    if (activeTab === "reels") return userProfile?.reels || [];
    if (activeTab === "saved")
      return [
        ...(userProfile?.bookmarks || []),
        ...(userProfile?.reelBookmarks || []),
      ];
    return [];
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10">
      {/* ================= HEADER ================= */}
      <div className="relative mb-24">
        <div className="h-48 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />

        <div className="absolute left-1/2 top-28 -translate-x-1/2 w-full max-w-4xl px-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="-mt-20">
              {userProfile?.profilePicture ? (
                <Avatar className="h-36 w-36 ring-4 ring-white shadow-lg">
                  <AvatarImage src={userProfile.profilePicture} />
                  <AvatarFallback>
                    {getInitials(userProfile?.username)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-36 w-36 rounded-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-gray-700 to-gray-900 ring-4 ring-white shadow-lg">
                  {getInitials(userProfile?.username)}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h1 className="text-2xl font-semibold">
                  {userProfile?.username}
                </h1>


                {isOwnProfile ? (
                  <Link to="/account/edit">
                    <Button variant="secondary">Edit Profile</Button>
                  </Link>
                ) : isFollowing ? (
                  <>
                    <Button variant="secondary" onClick={unfollowUser}>
                      Unfollow
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/chat/${userProfile._id}`)}
                    >
                      Message
                    </Button>
                  </>
                ) : showFollowBack ? (
                  <Button className="bg-[#0095F6]" onClick={followBack}>
                    Follow Back
                  </Button>
                ) : isRequested ? (
                  <Button variant="secondary" disabled>
                    Requested
                  </Button>
                ) : (
                  <Button className="bg-[#0095F6]" onClick={sendFollowRequest}>
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex justify-center md:justify-start gap-8 text-sm mb-1">
                <span><b>{userProfile?.posts?.length || 0}</b> posts</span>

                <button
                  onClick={openFollowers}
                  className={`hover:underline ${!userProfile?.followers?.length && "opacity-60 cursor-default"
                    }`}
                >
                  <b>{userProfile?.followers?.length || 0}</b> followers
                </button>

                <button
                  onClick={openFollowing}
                  className={`hover:underline ${!userProfile?.following?.length && "opacity-60 cursor-default"
                    }`}
                >
                  <b>{userProfile?.following?.length || 0}</b> following
                </button>
              </div>

              <p className="text-sm text-gray-600">@{userProfile?.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-40 md:h-32" />

      {/* ================= TABS ================= */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-t border-gray-300">
        <div className="flex justify-around max-w-md mx-auto text-sm font-medium">
          {["posts", "reels", ...(isOwnProfile ? ["saved"] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 flex-1 transition ${activeTab === tab
                ? "border-b-2 border-black text-black"
                : "border-b-2 border-transparent text-gray-400"
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {showModal && (
        <FollowersModal
          users={modalUsers}
          type={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ================= CONTENT ================= */}
      {displayedItems.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} yet`}
          subtitle={`When ${activeTab} are shared, they will appear here.`}
        />
      ) : (
        <div className="grid grid-cols-3 gap-[2px] sm:gap-1">
          {displayedItems.map((item) => (
            <div key={item._id} className="relative group">
              {item.image && (
                <img src={item.image} className="aspect-square object-cover" />
              )}
              {item.media && (
                <video src={item.media} muted className="aspect-square object-cover" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white text-sm">
                <span className="flex items-center gap-1">
                  <Heart size={16} /> {item.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={16} /> {item.comments?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOwnProfile && (
        <div className="mt-20 flex justify-center px-4">
          <button
            onClick={logoutHandler}
            className="relative w-full max-w-md h-14 rounded-2xl font-semibold text-red-600 bg-white border border-red-200 shadow transition-all hover:shadow-lg active:scale-[0.96]"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
