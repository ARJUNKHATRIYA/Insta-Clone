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
        setAuthUser: (state, action) => {
    const payload = action.payload;

    if (!payload) {
        state.user = null;
        state.userProfile = null;
        state.followingUsers = [];
        state.suggestedUsers = [];
        return;
    }

    console.log("🔄 setAuthUser payload:", payload);
    console.log("🔄 Followers:", payload.followers);
    console.log("🔄 Following:", payload.following);

    state.user = {
        ...payload,
        // ✅ Ensure followers/following are arrays of strings
        followers: Array.isArray(payload.followers) 
            ? payload.followers.map(f => typeof f === "object" ? f._id.toString() : f.toString())
            : [],
        following: Array.isArray(payload.following)
            ? payload.following.map(f => typeof f === "object" ? f._id.toString() : f.toString())
            : [],
        bookmarks: payload.bookmarks || [],
        reelBookmarks: payload.reelBookmarks || []
    };

    console.log("✅ Final user state:", state.user);
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
