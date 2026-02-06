import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/axios";
import { setFollowingUsers } from "@/redux/authSlice";

const useGetFollowingUsers = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);

  useEffect(() => {
    if (!user?._id) return;

    console.log("🔥 fetching following users");

    api.get("/api/v1/user/following")
      .then(res => {
        console.log("✅ following users:", res.data);
        dispatch(setFollowingUsers(res.data.users));
      })
      .catch(err => {
        console.error("❌ following users error", err.response?.status);
      });

  }, [user?._id]); // ⬅️ THIS is the key
};

export default useGetFollowingUsers;
