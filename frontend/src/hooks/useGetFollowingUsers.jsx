import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFollowingUsers } from "@/redux/authSlice";

const useGetFollowingUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFollowing = async () => {
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/following",
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setFollowingUsers(res.data.users));
      }
    };

    fetchFollowing();
  }, []);
};

export default useGetFollowingUsers;
