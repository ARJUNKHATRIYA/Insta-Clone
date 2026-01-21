import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

import initSocket from "./socket/socket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* -------- MIDDLEWARE -------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

/* -------- ROUTES -------- */
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

/* -------- START SERVER -------- */
connectDB().then(() => {
  const server = initSocket(app);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
