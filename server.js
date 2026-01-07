import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
const server = http.createServer(app);
import jwt from "jsonwebtoken";

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Unauthorized"));
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});



io.on("connection", (socket) => {
  const { userId, position } = socket.user;

  console.log(userId,"userId")

  if (position) socket.join(position);
  socket.join(`user-${userId}`);

  socket.join("patientPharmacy")

  onlineUsers.set(userId, socket.id);

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
  });
});



export { io };

// Connect to the database
const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connected to the database");
    server.listen(PORT, () => {
      console.log(`Server and Socket.IO  is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
