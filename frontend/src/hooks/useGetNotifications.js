import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setNotifications } from "@/redux/rtnSlice";

const useGetNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);
  useEffect(() => {
    if (!user?._id) return;
    const fetchNotifications = async () => {
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/notifications",
        { withCredentials: true }
      );

      if (res.data.success) {
        // ✅ DO NOT transform again
        dispatch(setNotifications(res.data.notifications));
      }
    };

    fetchNotifications();
  }, []);
};

export default useGetNotifications;
