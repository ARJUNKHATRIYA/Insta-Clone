import React from "react";
import { useSelector } from "react-redux";
import Post from "./Post";
import EmptyFeed from "./EmptyFeed";

const Posts = () => {
  const { posts } = useSelector(store => store.post);

  if (!posts || posts.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
