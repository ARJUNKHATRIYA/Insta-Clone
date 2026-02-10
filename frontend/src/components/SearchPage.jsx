import React, { useEffect, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SearchPage = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useSelector(store => store.auth);

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8000/api/v1/user/search?q=${query}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const followUser = async (id) => {
    await axios.post(
      `http://localhost:8000/api/v1/user/follow/request/${id}`,
      {},
      { withCredentials: true }
    );
  };

  const unfollowUser = async (id) => {
    await axios.post(
      `http://localhost:8000/api/v1/user/unfollow/${id}`,
      {},
      { withCredentials: true }
    );
  };

  return (
    <div className="flex justify-center px-4 py-6">
      {/* 🔒 WIDTH CONTAINER */}
      <div className="w-full max-w-2xl">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="
                w-full pl-11 pr-4 py-3 rounded-2xl
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-black
                bg-white shadow-sm
              "
            />
          </div>
        </div>

        {/* CONTENT */}
        <AnimatePresence>
          {loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-center mt-16"
            >
              Searching…
            </motion.p>
          )}

          {!loading && !query && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-24 flex flex-col items-center text-center text-gray-500"
            >
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold">Search for friends</h3>
              <p className="text-sm mt-1">
                Find people by their username.
              </p>
            </motion.div>
          )}

          {!loading && query && users.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 text-center text-gray-500"
            >
              <div className="text-5xl mb-4">🔍</div>
              <p>No users found</p>
            </motion.div>
          )}

          {!loading && users.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              {users.map(u => {
                const isFollowing = loggedInUser.following.includes(u._id);

                return (
                  <motion.div
                    key={u._id}
                    whileHover={{ scale: 1.01 }}
                    className="
                      flex items-center justify-between
                      p-4 rounded-2xl
                      bg-white shadow-sm
                    "
                  >
                    {/* USER INFO */}
                    <div
                      onClick={() => navigate(`/profile/${u._id}`)}
                      className="flex items-center gap-4 cursor-pointer"
                    >
                      <Avatar>
                        <AvatarImage src={u.profilePicture} />
                        <AvatarFallback>
                          {u.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.username}</span>
                    </div>

                    {/* FOLLOW BUTTON */}
                    {isFollowing ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          unfollowUser(u._id);
                        }}
                      >
                        Following
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#0095F6]"
                        onClick={(e) => {
                          e.stopPropagation();
                          followUser(u._id);
                        }}
                      >
                        Follow
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;
