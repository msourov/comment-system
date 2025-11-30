import { useSelector, useDispatch } from "react-redux";
import { useContext, useEffect, useRef } from "react";
import { fetchComments, setPage, setSortBy } from "../commentsSlice";
import CommentItem from "./CommentItem";
import { SocketContext } from "../../../context/SocketContext";
import styles from "./CommentList.module.scss";
import Pagination from "../../../common/components/Pagination";

const CommentList = () => {
  const dispatch = useDispatch();
  const {
    comments,
    loading,
    error,
    currentPage,
    totalPages,
    sortBy,
    totalComments,
  } = useSelector((state) => state.comments);
  const { joinPage, leavePage, connected, socket } = useContext(SocketContext);

  const pageId = window.location.pathname;
  const hasJoinedRef = useRef(false);
  const commentsSectionRef = useRef(null);

  useEffect(() => {
    if (connected && socket?.connected && !hasJoinedRef.current) {
      console.log("Joining page:", pageId);
      joinPage(pageId);
      hasJoinedRef.current = true;
    }

    return () => {
      if (hasJoinedRef.current) {
        console.log("Leaving page:", pageId);
        leavePage(pageId);
        hasJoinedRef.current = false;
      }
    };
  }, [pageId, connected, socket?.connected, joinPage, leavePage]);

  useEffect(() => {
    dispatch(fetchComments({ page: currentPage, pageId, sortBy }));
  }, [dispatch, currentPage, sortBy, pageId]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    // Scroll to comments section
    commentsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const validComments = (comments || []).filter((c) => c && c._id);

  return (
    <div className={styles.commentList} ref={commentsSectionRef}>
      {/* Header with count and sort */}
      <div className={styles.header}>
        <div className={styles.commentCount}>
          <h3>
            {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
          </h3>
        </div>

        <div className={styles.sortControls}>
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value))}
            disabled={loading}
            className={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostLiked">Most Liked</option>
            <option value="mostDisliked">Most Disliked</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading comments...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button
            onClick={() =>
              dispatch(fetchComments({ page: currentPage, pageId, sortBy }))
            }
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && validComments.length === 0 && (
        <div className={styles.empty}>
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}

      {/* Comments List */}
      {!loading && !error && validComments.length > 0 && (
        <>
          <ul className={styles.commentsList}>
            {validComments.map((comment) => (
              <li key={comment._id}>
                <CommentItem comment={comment} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />

          {/* Page Info */}
          <div className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentList;
