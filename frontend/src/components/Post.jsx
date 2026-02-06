import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'
import { BsBookmarkFill } from "react-icons/bs";
import { setAuthUser } from '@/redux/authSlice';
import { setReels } from "@/redux/reelSlice";
import { toggleLike } from "@/redux/postSlice";
import { addComment } from "@/redux/postSlice";
const Post = ({ post }) => {

    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const { reels } = useSelector(store => store.reel);
    const liked = post.likes.includes(user._id);
    const postLike = post.likes.length;


    const [comment, setComment] = useState(post?.comments || []);
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        if (user?.bookmarks?.includes(post._id)) {
            setBookmarked(true);
        } else {
            setBookmarked(false);
        }
    }, [user, post]);



    const dispatch = useDispatch();
    if (!user) return null;

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }
    const likeOrDislikeHandler = async () => {
        // 🚀 OPTIMISTIC UPDATE (INSTANT)
        dispatch(
            toggleLike({
                postId: post._id,
                userId: user._id,
            })
        );

        try {
            const action = liked ? "dislike" : "like";

            await axios.get(
                `http://localhost:8000/api/v1/post/${post._id}/${action}`,
                { withCredentials: true }
            );
        } catch (error) {
            console.log(error);
        }
    };

    const unfollowHandler = async () => {
        try {
            const res = await axios.post(
                `http://localhost:8000/api/v1/user/followorunfollow/${post.author?._id}`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {

                // 1️⃣ Remove author's posts SAFELY
                dispatch(setPosts(
                    posts.filter(p =>
                        p.author && p.author._id !== post.author._id
                    )
                ));

                // 2️⃣ Remove author's reels SAFELY
                dispatch(setReels(
                    reels.filter(r =>
                        r.author && r.author._id !== post.author._id
                    )
                ));

                // 3️⃣ Update auth user following
                dispatch(setAuthUser({
                    ...user,
                    following: user.following.filter(
                        id => id !== post.author._id
                    )
                }));

                toast.success("Unfollowed successfully");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to unfollow");
        }
    };

    const commentHandler = async () => {
        if (!text.trim()) return;

        const tempComment = {
            _id: Date.now(), // temporary
            text,
            author: user,
        };

        // ✅ INSTANT UI
        dispatch(addComment({ postId: post._id, comment: tempComment }));
        setText("");

        try {
            await axios.post(
                `http://localhost:8000/api/v1/post/${post._id}/comment`,
                { text },
                { withCredentials: true }
            );
        } catch (error) {
            console.log(error);
        }
    };


    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }


    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8000/api/v1/post/${post._id}/bookmark`,
                { withCredentials: true }
            );

            if (res.data.success) {
                const currentBookmarks = Array.isArray(user.bookmarks)
                    ? user.bookmarks
                    : [];

                const updatedBookmarks =
                    res.data.type === "saved"
                        ? [...currentBookmarks, post._id]
                        : currentBookmarks.filter(id => id !== post._id);

                dispatch(setAuthUser({
                    ...user,
                    bookmarks: updatedBookmarks
                }));

                setBookmarked(res.data.type === "saved");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <article
            className="
      mb-6
      w-full
      max-w-[600px]
      mx-auto
      bg-white
      rounded-2xl
      border border-gray-200/70
      shadow-sm
      hover:shadow-md
      transition-shadow
    "
        >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={post.author?.profilePicture} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-semibold">
                            {post.author?.username}
                        </h1>
                        {user && post.author && user._id === post.author._id && (
                            <Badge variant="secondary">Author</Badge>
                        )}
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className="cursor-pointer text-gray-600 hover:text-black" />
                    </DialogTrigger>

                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {user && post?.author && user._id !== post.author?._id && (
                            <Button
                                variant="ghost"
                                onClick={unfollowHandler}
                                className="text-[#ED4956] font-bold"
                            >
                                Unfollow
                            </Button>
                        )}

                        <Button variant="ghost">Add to favorites</Button>

                        {user && user._id === post.author?._id && (
                            <Button onClick={deletePostHandler} variant="ghost">
                                Delete
                            </Button>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* IMAGE */}
            <img
                src={post.image}
                alt="post"
                className="w-full aspect-square object-cover"
            />

            {/* ACTIONS */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-4">
                    {liked ? (
                        <FaHeart
                            onClick={likeOrDislikeHandler}
                            size={22}
                            className="cursor-pointer text-red-600"
                        />
                    ) : (
                        <FaRegHeart
                            onClick={likeOrDislikeHandler}
                            size={22}
                            className="cursor-pointer hover:text-gray-600"
                        />
                    )}

                    <MessageCircle
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        className="cursor-pointer hover:text-gray-600"
                    />

                    <Send className="cursor-pointer hover:text-gray-600" />
                </div>

                {bookmarked ? (
                    <BsBookmarkFill
                        onClick={bookmarkHandler}
                        size={20}
                        className="cursor-pointer"
                    />
                ) : (
                    <Bookmark
                        onClick={bookmarkHandler}
                        className="cursor-pointer hover:text-gray-600"
                    />
                )}
            </div>

            {/* META */}
            <div className="px-4 pb-3">
                <p className="text-sm font-medium mb-1">
                    {postLike} likes
                </p>

                <p className="text-sm">
                    <span className="font-semibold mr-2">
                        {post.author?.username}
                    </span>
                    {post.caption}
                </p>

                {comment.length > 0 && (
                    <p
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        className="text-sm text-gray-500 cursor-pointer mt-1"
                    >
                        View all {comment.length} comments
                    </p>
                )}
            </div>

            {/* COMMENT INPUT */}
            <div className="flex items-center px-4 py-3 border-t">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    value={text}
                    onChange={changeEventHandler}
                    className="flex-1 text-sm outline-none"
                />
                {text && (
                    <button
                        onClick={commentHandler}
                        className="text-[#3BADF8] font-medium text-sm"
                    >
                        Post
                    </button>
                )}
            </div>

            <CommentDialog open={open} setOpen={setOpen} type="post" />
        </article>
    );

}

export default Post