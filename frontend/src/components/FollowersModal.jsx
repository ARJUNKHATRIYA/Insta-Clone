// import React, { useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Button } from "./ui/button";
// import axios from "axios";
// import { useSelector, useDispatch } from "react-redux";
// import { X } from "lucide-react";
// import { toast } from "sonner";
// import { setAuthUser, setUserProfile } from "@/redux/authSlice";
// import { setPosts } from "@/redux/postSlice";
// import { setReels } from "@/redux/reelSlice";

// const FollowersModal = ({ users = [], onClose, type }) => {
//   const dispatch = useDispatch();

//   const authUser = useSelector(store => store.auth.user);
//   const userProfile = useSelector(store => store.auth.userProfile);
//   const posts = useSelector(store => store.post.posts);
//   const reels = useSelector(store => store.reel.reels);
//   const iFollowUser = authUser.following.includes(u._id);
//   const userFollowsMe = u.followers?.includes(authUser._id);


//   const [list, setList] = useState(users);

//   if (!authUser?._id) return null;
//   const sendFollowRequest = async (targetId) => {
//     try {
//       await axios.post(
//         `http://localhost:8000/api/v1/user/follow/request/${targetId}`,
//         {},
//         { withCredentials: true }
//       );

//       toast.success("Follow request sent");
//     } catch {
//       toast.error("Failed to send request");
//     }
//   };

//   const followBack = async (targetId) => {
//     try {
//       const res = await axios.post(
//         `http://localhost:8000/api/v1/user/follow/back/${targetId}`,
//         {},
//         { withCredentials: true }
//       );

//       if (res.data.success) {
//         dispatch(setAuthUser(res.data.user));
//         toast.success("Followed back");
//       }
//     } catch {
//       toast.error("Failed to follow back");
//     }
//   };


//   const unfollow = async (targetId) => {
//     try {
//       await axios.post(
//         `http://localhost:8000/api/v1/user/unfollow/${targetId}`,
//         {},
//         { withCredentials: true }
//       );

//       // 1️⃣ Update modal list
//       setList(prev => prev.filter(u => u._id !== targetId));

//       // 2️⃣ Update logged-in user
//       dispatch(setAuthUser({
//         ...authUser,
//         following: authUser.following.filter(id => id !== targetId)
//       }));

//       // 3️⃣ Update viewed profile counts
//       dispatch(setUserProfile({
//         ...userProfile,
//         followers: userProfile.followers?.filter(u => u._id !== targetId),
//         following: userProfile.following?.filter(u => u._id !== targetId)
//       }));

//       // 4️⃣ Remove posts & reels instantly
//       dispatch(setPosts(posts.filter(p => p.author?._id !== targetId)));
//       dispatch(setReels(reels.filter(r => r.author?._id !== targetId)));

//       toast.success("Unfollowed");
//     } catch {
//       toast.error("Failed to unfollow");
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
//       <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
//         {/* HEADER */}
//         <div className="flex items-center justify-between px-4 py-3 border-b">
//           <h2 className="font-semibold capitalize">{type}</h2>
//           <button onClick={onClose}>
//             <X size={18} />
//           </button>
//         </div>

//         {/* LIST */}
//         <div className="max-h-[60vh] overflow-y-auto">
//           {list.length === 0 ? (
//             <p className="text-center text-gray-400 py-8">
//               No {type}
//             </p>
//           ) : (
//             list.map(u => (
//               <div
//                 key={u._id}
//                 className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
//               >
//                 <div className="flex items-center gap-3">
//                   <Avatar>
//                     <AvatarImage src={u.profilePicture} />
//                     <AvatarFallback>
//                       {u.username?.slice(0, 2).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>

//                   <p className="font-medium">{u.username}</p>
//                 </div>

//                 {/* {authUser._id !== u._id && (
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     onClick={() => unfollow(u._id)}
//                   >
//                     Unfollow
//                   </Button>
//                 )} */}
//                 {authUser._id !== u._id && (
//                   iFollowUser ? (
//                     <Button
//                       size="sm"
//                       variant="secondary"
//                       onClick={() => unfollow(u._id)}
//                     >
//                       Unfollow
//                     </Button>
//                   ) : userFollowsMe ? (
//                     <Button
//                       size="sm"
//                       className="bg-[#0095F6]"
//                       onClick={() => followBack(u._id)}
//                     >
//                       Follow Back
//                     </Button>
//                   ) : (
//                     <Button
//                       size="sm"
//                       className="bg-[#0095F6]"
//                       onClick={() => sendFollowRequest(u._id)}
//                     >
//                       Follow
//                     </Button>
//                   )
//                 )}

//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FollowersModal;

// import React, { useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Button } from "./ui/button";
// import axios from "axios";
// import { useSelector, useDispatch } from "react-redux";
// import { X } from "lucide-react";
// import { toast } from "sonner";
// import { setAuthUser } from "@/redux/authSlice";

// const FollowersModal = ({ users = [], onClose, type }) => {
//   const dispatch = useDispatch();
//   const authUser = useSelector(store => store.auth.user);

//   const [list, setList] = useState(users);

//   if (!authUser?._id) return null;

//   const follow = async (targetId) => {
//     try {
//       await axios.post(
//         `http://localhost:8000/api/v1/user/follow/request/${targetId}`,
//         {},
//         { withCredentials: true }
//       );
//       toast.success("Follow request sent");
//     } catch {
//       toast.error("Failed to follow");
//     }
//   };

//   const followBack = async (targetId) => {
//     try {
//       const res = await axios.post(
//         `http://localhost:8000/api/v1/user/follow/back/${targetId}`,
//         {},
//         { withCredentials: true }
//       );

//       if (res.data.success) {
//         dispatch(setAuthUser(res.data.user));
//         toast.success("Followed back");
//       }
//     } catch {
//       toast.error("Failed to follow back");
//     }
//   };

//   const unfollow = async (targetId) => {
//     try {
//       await axios.post(
//         `http://localhost:8000/api/v1/user/unfollow/${targetId}`,
//         {},
//         { withCredentials: true }
//       );

//       dispatch(setAuthUser({
//         ...authUser,
//         following: authUser.following.filter(id => id !== targetId)
//       }));

//       toast.success("Unfollowed");
//     } catch {
//       toast.error("Failed to unfollow");
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
//       <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
//         {/* HEADER */}
//         <div className="flex items-center justify-between px-4 py-3 border-b">
//           <h2 className="font-semibold capitalize">{type}</h2>
//           <button onClick={onClose}>
//             <X size={18} />
//           </button>
//         </div>

//         {/* LIST */}
//         <div className="max-h-[60vh] overflow-y-auto">
//           {list.map(u => {
//             const iFollowUser = authUser.following.includes(u._id);
//             const userFollowsMe = authUser.followers.includes(u._id);

//             return (
//               <div
//                 key={u._id}
//                 className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
//               >
//                 <div className="flex items-center gap-3">
//                   <Avatar>
//                     <AvatarImage src={u.profilePicture} />
//                     <AvatarFallback>
//                       {u.username?.slice(0, 2).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <p className="font-medium">{u.username}</p>
//                 </div>

//                 {authUser._id !== u._id && (
//                   iFollowUser ? (
//                     <Button size="sm" variant="secondary" onClick={() => unfollow(u._id)}>
//                       Unfollow
//                     </Button>
//                   ) : userFollowsMe ? (
//                     <Button size="sm" className="bg-[#0095F6]" onClick={() => followBack(u._id)}>
//                       Follow Back
//                     </Button>
//                   ) : (
//                     <Button size="sm" className="bg-[#0095F6]" onClick={() => follow(u._id)}>
//                       Follow
//                     </Button>
//                   )
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FollowersModal;

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { X } from "lucide-react";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const FollowersModal = ({ users = [], onClose, type }) => {
  const dispatch = useDispatch();
  const authUser = useSelector(store => store.auth.user);

  const [list, setList] = useState(users);
  const [loadingId, setLoadingId] = useState(null);

  if (!authUser?._id) return null;

  const sendFollowRequest = async (targetId) => {
    try {
      setLoadingId(targetId);

      await axios.post(
        `http://localhost:8000/api/v1/user/follow/request/${targetId}`,
        {},
        { withCredentials: true }
      );

      // update local modal state
      setList(prev =>
        prev.map(u =>
          u._id === targetId
            ? { ...u, followRequests: [...(u.followRequests || []), authUser._id] }
            : u
        )
      );

      toast.success("Follow request sent");
    } catch {
      toast.error("Failed to send request");
    } finally {
      setLoadingId(null);
    }
  };

  const followBack = async (targetId) => {
    try {
      setLoadingId(targetId);

      const res = await axios.post(
        `http://localhost:8000/api/v1/user/follow/back/${targetId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        toast.success("Followed back");
      }
    } catch {
      toast.error("Failed to follow back");
    } finally {
      setLoadingId(null);
    }
  };

  const unfollow = async (targetId) => {
    try {
      setLoadingId(targetId);

      await axios.post(
        `http://localhost:8000/api/v1/user/unfollow/${targetId}`,
        {},
        { withCredentials: true }
      );

      dispatch(setAuthUser({
        ...authUser,
        following: authUser.following.filter(id => id !== targetId)
      }));

      toast.success("Unfollowed");
    } catch {
      toast.error("Failed to unfollow");
    } finally {
      setLoadingId(null);
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
          {list.map(u => {
            const iFollowUser = authUser.following.includes(u._id);
            const userFollowsMe = u.followers?.includes(authUser._id);
            const requestPending = u.followRequests?.includes(authUser._id);

            return (
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
                  iFollowUser ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={loadingId === u._id}
                      onClick={() => unfollow(u._id)}
                    >
                      Unfollow
                    </Button>
                  ) : userFollowsMe ? (
                    <Button
                      size="sm"
                      className="bg-[#0095F6]"
                      disabled={loadingId === u._id}
                      onClick={() => followBack(u._id)}
                    >
                      Follow Back
                    </Button>
                  ) : requestPending ? (
                    <Button size="sm" variant="secondary" disabled>
                      Requested
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-[#0095F6]"
                      disabled={loadingId === u._id}
                      onClick={() => sendFollowRequest(u._id)}
                    >
                      Follow
                    </Button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
