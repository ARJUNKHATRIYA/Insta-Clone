import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: {
            bookmarks: [],
            reelBookmarks: []
        },
        suggestedUsers: [],
        followingUsers: [],
        userProfile: null,
        selectedUser: null,
    },

    reducers: {
        // setAuthUser: (state, action) => {
        //     state.user = {
        //         ...action.payload,
        //         bookmarks: action.payload?.bookmarks || []
        //     };
        // },
        // setAuthUser: (state, action) => {
        //     const payload = action.payload;

        //     state.user = {
        //         ...payload,
        //         followers: (payload.followers || []).map(f =>
        //             typeof f === "object" ? f._id : f
        //         ),
        //         following: (payload.following || []).map(f =>
        //             typeof f === "object" ? f._id : f
        //         ),
        //         bookmarks: payload.bookmarks || [],
        //         reelBookmarks: payload.reelBookmarks || []
        //     };
        // },
        setAuthUser: (state, action) => {
            const payload = action.payload;

            if (!payload) {
                state.user = null;
                state.userProfile = null;
                state.followingUsers = [];
                state.suggestedUsers = [];
                return;
            }

            state.user = {
                ...payload,
                followers: (payload.followers || []).map(f =>
                    typeof f === "object" ? f._id : f
                ),
                following: (payload.following || []).map(f =>
                    typeof f === "object" ? f._id : f
                ),
                bookmarks: payload.bookmarks || [],
                reelBookmarks: payload.reelBookmarks || []
            };
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setFollowingUsers: (state, action) => {
            state.followingUsers = action.payload;
        },
        // setUserProfile: (state, action) => {
        //     state.userProfile = action.payload;
        // },
        setUserProfile: (state, action) => {
            const payload = action.payload;
            if (!payload) {
                state.userProfile = null;
                return;
            }

            state.userProfile = {
                ...payload,
                followers: (payload.followers || []).map(f =>
                    typeof f === "object" ? f._id : f
                ),
                following: (payload.following || []).map(f =>
                    typeof f === "object" ? f._id : f
                )
            };
        },


        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },



        // ✅ FOLLOW / UNFOLLOW REDUCER
        updateFollowers: (state, action) => {
            const loggedInUserId = action.payload;

            if (!state.userProfile) return;

            const isFollowing =
                state.userProfile.followers.includes(loggedInUserId);

            if (isFollowing) {
                // UNFOLLOW
                state.userProfile.followers =
                    state.userProfile.followers.filter(
                        (id) => id !== loggedInUserId
                    );
            } else {
                // FOLLOW
                state.userProfile.followers.push(loggedInUserId);
            }
        },
    },
});

export const {
    setAuthUser,
    setSuggestedUsers,
    setFollowingUsers,
    setUserProfile,
    setSelectedUser,
    updateFollowers, // ✅ MUST BE HERE

} = authSlice.actions;

export default authSlice.reducer;
