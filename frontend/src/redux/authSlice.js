import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: {
            bookmarks: []
        },
        suggestedUsers: [],
        followingUsers: [],
        userProfile: null,
        selectedUser: null,
    },

    reducers: {
        setAuthUser: (state, action) => {
            state.user = {
                ...action.payload,
                bookmarks: action.payload?.bookmarks || []
            };
        },


        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setFollowingUsers: (state, action) => {
            state.followingUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
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
