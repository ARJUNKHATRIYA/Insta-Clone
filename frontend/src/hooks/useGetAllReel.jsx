import { setReels } from "@/redux/reelSlice";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const useGetAllReel = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchAllReel = async (req, res) => {
            try {
                const res = await axios.get('http://localhost:8000/api/v1/reel/all', { withCredentials: true });
                if (res.data.success) {
                    console.log(res.data.reels);
                    dispatch(setReels(res.data.reels));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllReel();
    }, [])

};

export default useGetAllReel;