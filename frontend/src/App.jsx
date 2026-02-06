import { useEffect } from 'react'
import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client"
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { addNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'
import ReelsPage from './components/ReelsPage'
import Notifications from "./components/Notifications";
import ChatList from './components/ChatList'
import { addComment } from './redux/postSlice'
import { setAuthUser } from "@/redux/authSlice";


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      { path: '/', element: <ProtectedRoutes><Home /></ProtectedRoutes> },
      { path: '/reels', element: <ProtectedRoutes><ReelsPage /></ProtectedRoutes> },
      { path: '/profile/:id', element: <ProtectedRoutes><Profile /></ProtectedRoutes> },
      { path: '/account/edit', element: <ProtectedRoutes><EditProfile /></ProtectedRoutes> },
      { path: '/chat/:userId', element: <ProtectedRoutes><ChatPage /></ProtectedRoutes> },
      { path: '/chat', element: <ProtectedRoutes><ChatList /></ProtectedRoutes> },
      { path: "/notifications", element: (<ProtectedRoutes><Notifications /></ProtectedRoutes>) }
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> }
])

function App() {
  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  // ===============================
  // 1️⃣ CREATE / DESTROY SOCKET
  // ===============================
  useEffect(() => {
    if (!user?._id) {
      if (socket) {
        socket.disconnect();
        dispatch(setSocket(null));
      }
      return;
    }

    // ❌ prevent duplicate socket
    if (socket) return;

    console.log("🔌 Creating socket for user:", user._id);

    const socketio = io("http://localhost:8000", {
      transports: ["websocket"],
      withCredentials: true,
      query: { userId: user._id },
    });

    socketio.on("connect", () => {
      console.log("✅ Socket connected:", socketio.id);
      socketio.emit("register-user", user._id);
    });

    socketio.on("getOnlineUsers", onlineUsers => {
      dispatch(setOnlineUsers(onlineUsers));
    });

  
//    socketio.on("notification", (notification) => {
//   dispatch(addNotification(notification));

//   if (
//     notification.type === "follow_accept" &&
//     notification.senderDetails?._id
//   ) {
//     dispatch(
//       setAuthUser({
//         ...user,
//         following: user.following.includes(notification.senderDetails._id)
//           ? user.following
//           : [...user.following, notification.senderDetails._id],
//       })
//     );
//   }
// });
socketio.on("notification", (notification) => {
  dispatch(addNotification(notification));

  if (notification.type === "follow_accept") {
    // ✅ Update logged-in user (User A)
    dispatch(setAuthUser({
      ...user,
      following: user.following.includes(notification.senderDetails._id)
        ? user.following
        : [...user.following, notification.senderDetails._id]
    }));
  }
});




    dispatch(setSocket(socketio));

    return () => {
      console.log("🧹 Cleaning up socket");
      socketio.disconnect();
      dispatch(setSocket(null));
    };
  }, [user?._id]);

  // ===============================
  // 2️⃣ REALTIME COMMENTS
  // ===============================
  useEffect(() => {
    if (!socket) return;

    socket.on("newComment", ({ postId, comment }) => {
      dispatch(addComment({ postId, comment }));
    });

    return () => {
      socket.off("newComment");
    };
  }, [socket]);

  return <RouterProvider router={browserRouter} />;
}


export default App
