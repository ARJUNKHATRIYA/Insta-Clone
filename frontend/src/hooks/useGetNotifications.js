import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "@/redux/rtnSlice";

const useGetNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);

  useEffect(() => {
    if (!user?._id) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/user/notifications",
          { withCredentials: true }
        );

        if (res.data.success) {
          dispatch(setNotifications(res.data.notifications));
        }
      } catch (err) {
        console.log("Notification fetch error:", err);
      }
    };

    fetchNotifications();
  }, [user?._id]); // 👈 important

};

export default useGetNotifications;
