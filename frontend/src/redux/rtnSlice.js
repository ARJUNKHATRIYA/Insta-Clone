import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    notifications: []
  },
  reducers: {
    // ✅ MERGE notifications instead of replacing
    setNotifications: (state, action) => {
      const map = new Map();

      // keep existing notifications (from socket)
      state.notifications.forEach(n => {
        map.set(n._id, n);
      });

      // merge API notifications
      action.payload.forEach(n => {
        map.set(n._id, {
          ...map.get(n._id),
          ...n
        });
      });

      state.notifications = Array.from(map.values());
    },

    // ✅ socket notifications stay untouched
    addNotification: (state, action) => {
      const exists = state.notifications.find(
        n => n._id === action.payload._id
      );
      if (!exists) {
        state.notifications.unshift(action.payload);
      }
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        n => n._id !== action.payload
      );
    }
  }
});

export const {
  setNotifications,
  addNotification,
  removeNotification
} = rtnSlice.actions;

export default rtnSlice.reducer;
