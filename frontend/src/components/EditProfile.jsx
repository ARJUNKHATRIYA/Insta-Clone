import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { Loader2, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const EditProfile = () => {
  const imageRef = useRef(null);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto: null,
    bio: user?.bio || "",
    gender: user?.gender || "",
  });

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => ({ ...prev, profilePhoto: file }));
    }
  };

  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    if (input.profilePhoto) {
      formData.append("profilePhoto", input.profilePhoto);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/profile/edit",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(
          setAuthUser({
            ...user,
            bio: res.data.user.bio,
            profilePicture: res.data.user.profilePicture,
            gender: res.data.user.gender,
          })
        );
        toast.success(res.data.message);
        navigate(`/profile/${user?._id}`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-10">
      <section
        className="
          w-full max-w-xl
          rounded-2xl
          backdrop-blur-xl
          bg-white/70
          border border-white/40
          shadow-xl
          p-6
          space-y-6
        "
      >
        <h1 className="text-xl font-semibold">Edit profile</h1>

        {/* PROFILE CARD */}
        <div className="flex items-center justify-between rounded-xl bg-white/80 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-semibold text-sm">{user?.username}</h1>
              <span className="text-gray-500 text-xs">
                {user?.bio || "Bio here..."}
              </span>
            </div>
          </div>

          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            accept="image/*"
            hidden
          />

          <Button
            onClick={() => imageRef.current.click()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Camera size={16} />
            Change photo
          </Button>
        </div>

        {/* BIO */}
        <div>
          <label className="block font-medium mb-2">Bio</label>
          <Textarea
            value={input.bio}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, bio: e.target.value }))
            }
            placeholder="Tell something about yourself..."
            className="resize-none focus-visible:ring-0"
          />
        </div>

        {/* GENDER */}
        <div>
          <label className="block font-medium mb-2">Gender</label>
          <Select
            value={input.gender}
            onValueChange={(value) =>
              setInput((prev) => ({ ...prev, gender: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* ACTION */}
        <div className="flex justify-end">
          <Button
            disabled={loading}
            onClick={editProfileHandler}
            className="bg-[#0095F6] hover:bg-[#1877f2]"
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save changes
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
