import { useSelector, useDispatch } from "react-redux";
import { useContext, useEffect, useRef } from "react";
import { fetchComments, setPage, setSortBy } from "../commentsSlice";
import CommentItem from "./CommentItem";
import { SocketContext } from "../../../context/SocketContext";

const CommentList = () => {
  const dispatch = useDispatch();
  const { comments, loading, error, currentPage, totalPages, sortBy } =
    useSelector((state) => state.comments);
  const { joinPage, leavePage, connected, socket } = useContext(SocketContext);

  const pageId = window.location.pathname;
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    console.log("🚪 CommentList mount - joining page");
    console.log("   PageId:", pageId);
    console.log("   Socket connected:", connected);
    console.log("   Socket ID:", socket?.id);

    // FIX: Only join if socket is actually connected
    if (connected && socket?.connected && !hasJoinedRef.current) {
      console.log("Joining page:", pageId);
      joinPage(pageId);
      hasJoinedRef.current = true;
    }

    return () => {
      console.log("🚪 Component unmounting - leaving page:", pageId);
      if (hasJoinedRef.current) {
        leavePage(pageId);
        hasJoinedRef.current = false;
      }
    };
  }, [pageId, connected, socket]);

  // Temporary debugging - add to CommentList component
  useEffect(() => {
    if (socket) {
      const testHandler = (data) => {
        console.log("🧪 TEST: CommentList received newComment event!", data);
      };

      socket.on("newComment", testHandler);

      return () => {
        socket.off("newComment", testHandler);
      };
    }
  }, [socket]);

  useEffect(() => {
    dispatch(fetchComments({ page: currentPage, pageId, sortBy }));
  }, [dispatch, currentPage, sortBy, pageId]);

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error: {error}</div>;

  const validComments = (comments || []).filter((c) => c && c._id);

  if (!validComments.length) {
    return <div>No comments yet. Be the first to comment!</div>;
  }

  console.log(comments, "comments");

  return (
    <div>
      <div className="comments-sort-controls">
        <label>
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value))}
          >
            <option value="newest">Newest</option>
            <option value="mostLiked">Most Liked</option>
            <option value="mostDisliked">Most Disliked</option>
          </select>
        </label>
      </div>

      <ul className="comments-list">
        {validComments.map((comment) => (
          <li key={comment._id}>
            <CommentItem comment={comment} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="comments-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              disabled={currentPage === i + 1}
              onClick={() => dispatch(setPage(i + 1))}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;
