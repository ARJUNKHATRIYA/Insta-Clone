import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },

    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },

    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },

    toggleLike: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (!post) return;

      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id !== userId);
      } else {
        post.likes.push(userId);
      }
    },
    addComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.comments.push(comment);
      }
    },
  },
});

export const {
  setPosts,
  addPost,
  setSelectedPost,
  toggleLike,
  addComment,
} = postSlice.actions;

export default postSlice.reducer;


