import { useEffect } from 'react'
import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: '/',
        element: <ProtectedRoutes><Home /></ProtectedRoutes>
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoutes> <Profile /></ProtectedRoutes>
      },
      {
        path: '/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      {
        path: '/chat/:userId',
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
      },
      {
        path: "/chat",
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>,
      },

    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])

function App() {
  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();
 

useEffect(() => {
  console.log('useEffect triggered, user:', user);
  
  if (user) {
    console.log('Creating socket connection for userId:', user._id);
    
    const socketio = io('http://localhost:8000', {
      transports: ['websocket'],
      withCredentials: true
    });
    
    // Log socket connection status
    socketio.on('connect', () => {
      console.log('✅ Socket connected successfully:', socketio.id);
      // REGISTER USER - This was missing!
      socketio.emit('register-user', user._id);
    });

    socketio.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socketio.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
    
    dispatch(setSocket(socketio));

    // Listen for online users (you need to emit this from backend)
    socketio.on('getOnlineUsers', (onlineUsers) => {
      console.log('📡 Online users received:', onlineUsers);
      dispatch(setOnlineUsers(onlineUsers));
    });

    // Listen for notifications
    socketio.on('notification', (notification) => {
      console.log('🔔 Notification received:', notification);
      // alert('Notification: ' + notification.message);
      dispatch(setLikeNotification(notification));
    });

    return () => {
      console.log('🧹 Cleaning up socket connection');
      socketio.close();
      dispatch(setSocket(null));
    }
  } else if (socket) {
    console.log('User logged out, closing socket');
    socket.close();
    dispatch(setSocket(null));
  }
}, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App