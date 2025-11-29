import { Server } from "socket.io";
import pkg from 'jsonwebtoken';

const { verify } = pkg;

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Socket Logic
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on("joinPage", (pageId) => {
      socket.join(`page:${pageId}`);
      console.log(`User ${socket.userId} joined page: ${pageId}`);
    });

    socket.on("leavePage", (pageId) => {
      socket.leave(`page:${pageId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const emitCommentEvent = (io, pageId, event, data) => {
  io.to(`page:${pageId}`).emit(event, data);
};
