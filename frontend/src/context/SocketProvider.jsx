import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SocketContext } from "./SocketContext";
import {
  addCommentRealtime,
  updateCommentRealtime,
  deleteCommentRealtime,
  updateCommentInteraction,
} from "../features/comments/commentsSlice";
import { socket } from "../socket.js";

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const socketSetupRef = useRef(false);

  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clean up socket when not authenticated
      console.log("Cannot connect socket: Not authenticated or no token");
      if (socket.connected) {
        console.log("Closing socket connection (not authenticated)");
        socket.disconnect();
        socketSetupRef.current = false;
      }
      setTimeout(() => setConnected(false), 0);
      return;
    }

    // Prevent duplicate setup
    if (socketSetupRef.current) {
      console.log("Socket already initialized");
      return;
    }

    console.log("Initializing socket connection...");
    console.log("Auth check:", {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
    });

    socketSetupRef.current = true;

    socket.auth = { token };
    socket.io.opts.auth = { token };

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      setConnected(true);
      setError(null);

      // Auto-join current page after connecting
      const currentPage = window.location.pathname;
      socket.emit("joinPage", currentPage);
      console.log("Auto-joined page on connect:", currentPage);
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
      setConnected(false);

      // If disconnected due to auth, show specific error
      if (reason === "io server disconnect") {
        setError("Authentication failed");
      }
    };

    const handleConnectError = (err) => {
      console.error("Socket connection error:", err);
      console.error("Error details:", err.message, err.data);
      setError(err.message || "Connection failed");
      setConnected(false);
    };

    const handleError = (err) => {
      console.error("Socket error:", err);
      setError(err.message);
    };

    const handleReconnect = (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setConnected(true);
      setError(null);
    };

    // Real-time comment event handlers
    const handleNewComment = (data) => {
      console.log("New comment received:", data);
      if (data && data.comment) {
        dispatch(addCommentRealtime(data.comment));
      }
    };

    const handleCommentUpdated = (data) => {
      console.log("Comment updated:", data);
      dispatch(updateCommentRealtime(data));
    };

    const handleCommentDeleted = (data) => {
      console.log("Comment deleted:", data);
      const commentId = data.commentId || data;
      if (commentId) {
        dispatch(deleteCommentRealtime(commentId));
      } else {
        console.error("Invalid commentId in delete event:", data);
      }
    };

    const handleCommentLike = (data) => {
      console.log("👍 Comment liked:", data);
      dispatch(
        updateCommentInteraction({
          commentId: data.commentId,
          likeCount: data.likeCount,
          dislikeCount: data.dislikeCount,
        })
      );
    };

    const handleCommentDisLike = (data) => {
      console.log("👎 Comment disliked:", data);
      dispatch(
        updateCommentInteraction({
          commentId: data.commentId,
          likeCount: data.likeCount,
          dislikeCount: data.dislikeCount,
        })
      );
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("error", handleError);
    socket.on("reconnect", handleReconnect);
    socket.on("newComment", handleNewComment);
    socket.on("commentUpdated", handleCommentUpdated);
    socket.on("commentDeleted", handleCommentDeleted);
    socket.on("commentLiked", handleCommentLike);
    socket.on("commentDisliked", handleCommentDisLike);

    // Connect socket
    if (!socket.connected) {
      console.log("Connecting socket...");
      socket.connect();
    }

    // Cleanup function
    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("error", handleError);
      socket.off("reconnect", handleReconnect);
      socket.off("newComment", handleNewComment);
      socket.off("commentUpdated", handleCommentUpdated);
      socket.off("commentDeleted", handleCommentDeleted);
      socket.off("commentLiked", handleCommentLike);
      socket.off("commentDisliked", handleCommentDisLike);
      socket.disconnect();
      socketSetupRef.current = false;
    };
  }, [isAuthenticated, token, user?._id, dispatch]);

  // Join a page room
  const joinPage = useCallback(
    (pageId) => {
      if (socket && socket.connected) {
        console.log(`Emitting joinPage:`, pageId);
        socket.emit("joinPage", pageId);
      } else {
        console.warn("Cannot join page: Socket not connected");
      }
    },
    [socket]
  ); // Only recreate if socket changes

  const leavePage = useCallback(
    (pageId) => {
      if (socket && socket.connected) {
        console.log(`🚪 Emitting leavePage:`, pageId);
        socket.emit("leavePage", pageId);
      }
    },
    [socket]
  ); // Only recreate if socket changes

  const value = {
    socket,
    connected,
    error,
    joinPage,
    leavePage,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
