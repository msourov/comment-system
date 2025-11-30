import { Server } from "socket.io";
import pkg from "jsonwebtoken";

const { verify } = pkg;

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    console.log("🔐 Socket auth attempt:");
    console.log("  - Token present:", !!token);
    console.log(
      "  - Token preview:",
      token ? token.slice(0, 30) + "..." : "None"
    );

    if (!token) {
      console.log("Socket connection rejected: No token");
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      console.log(`Socket authenticated: User ${decoded.userId}`);
      next();
    } catch (error) {
      console.log("Socket authentication failed:", error.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId} (Socket ID: ${socket.id})`);

    // Join page-specific room
    // socket.on("joinPage", (pageId) => {
    //   socket.join(`page:${pageId}`);
    //   socket.currentPage = pageId;
    //   console.log(`User ${socket.userId} joined page: ${pageId}`);

    //   // Notify others in the room
    //   socket.to(`page:${pageId}`).emit("userJoined", {
    //     userId: socket.userId,
    //     timestamp: new Date(),
    //   });
    // });
    socket.on("joinPage", (pageId) => {
      socket.join(`page:${pageId}`);
      socket.currentPage = pageId;

      // ✅ ADD MORE DEBUG LOGS
      console.log(`✅✅✅ User ${socket.userId} JOINED page: ${pageId}`);
      console.log(`   Room name: page:${pageId}`);
      console.log(`   Total rooms for this socket:`, Array.from(socket.rooms));

      // Notify others in the room
      socket.to(`page:${pageId}`).emit("userJoined", {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Leave page room
    socket.on("leavePage", (pageId) => {
      socket.leave(`page:${pageId}`);
      console.log(`User ${socket.userId} left page: ${pageId}`);

      socket.to(`page:${pageId}`).emit("userLeft", {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Typing indicator
    socket.on("typing", (pageId) => {
      socket.to(`page:${pageId}`).emit("userTyping", {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    socket.on("stopTyping", (pageId) => {
      socket.to(`page:${pageId}`).emit("userStoppedTyping", {
        userId: socket.userId,
      });
    });

    // Disconnect handler
    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`);

      // Notify users in current page
      if (socket.currentPage) {
        socket.to(`page:${socket.currentPage}`).emit("userLeft", {
          userId: socket.userId,
          timestamp: new Date(),
        });
      }
    });

    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  console.log("Socket.IO server initialized");

  return io;
};

// Helper function to emit comment events
export const emitToPage = (io, pageId, event, data) => {
  io.to(`page:${pageId}`).emit(event, data);
  console.log(`Emitted "${event}" to page:${pageId}`);
};
