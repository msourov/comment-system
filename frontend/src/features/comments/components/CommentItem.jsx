import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addComment,
  deleteComment,
  updateComment,
  likeComment,
  dislikeComment,
} from "../commentsSlice";
import styles from "./CommentItem.module.scss";

const CommentItem = ({ comment, depth = 0 }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const likeCount = comment.likes || comment.likeCount || 0;
  const dislikeCount = comment.dislikes || comment.dislikeCount || 0;
  const replyCount = comment.replies?.length || comment.replyCount || 0;
  const pageId = comment.pageId || window.location.pathname;
  const isAuthor = user && user.id === comment.author?._id;

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like comments");
      return;
    }
    try {
      await dispatch(likeComment(comment._id)).unwrap();
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      alert("Please login to dislike comments");
      return;
    }
    try {
      await dispatch(dislikeComment(comment._id)).unwrap();
    } catch (error) {
      console.error("Failed to dislike comment:", error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        addComment({
          content: replyText,
          pageId: pageId,
          parentCommentId: comment._id,
        })
      ).unwrap();

      setReplyText("");
      setReplyOpen(false);
    } catch (error) {
      console.error("Failed to post reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthor) {
      alert("You can only delete your own comments");
      return;
    }

    const hasReplies = comment.replies && comment.replies.length > 0;
    const confirmMessage = hasReplies
      ? `This comment has ${comment.replies.length} ${
          comment.replies.length === 1 ? "reply" : "replies"
        }. Are you sure you want to delete it?`
      : "Are you sure you want to delete this comment?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteComment(comment._id)).unwrap();
      console.log("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert(error.message || "Failed to delete comment. Please try again.");
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!isAuthor) {
      alert("You can only edit your own comments");
      return;
    }
    setEditMode(true);
    setEditText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditText(comment.content);
  };

  const handleSaveEdit = async () => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      alert("Comment cannot be empty");
      return;
    }
    if (trimmedText === comment.content) {
      setEditMode(false);
      return;
    }
    if (trimmedText.length > 2000) {
      alert("Comment is too long (max 2000 characters)");
      return;
    }
    setLoading(true);

    try {
      await dispatch(
        updateComment({
          commentId: comment._id,
          content: editText,
        })
      ).unwrap();
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  };

  const handleCancelReply = () => {
    setReplyOpen(false);
    setReplyText("");
  };

  return (
    <div
      className={styles.commentItem}
      style={{ marginLeft: depth > 0 ? `${depth * 30}px` : "0" }}
    >
      <div className={styles.commentMain}>
        {/* Header */}
        <div className={styles.commentHeader}>
          <strong className={styles.username}>
            {comment.author?.username || "Unknown User"}
          </strong>
          <span className={styles.separator}>•</span>
          <span className={styles.timestamp}>
            {new Date(comment.createdAt).toLocaleString()}
          </span>
          {comment.isEdited && (
            <span className={styles.editedBadge}>(edited)</span>
          )}
        </div>

        {/* Content - Edit Mode or Display Mode */}
        {editMode ? (
          <div className={styles.editMode}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className={styles.editTextarea}
              placeholder="Edit your comment..."
              maxLength={2000}
              disabled={loading}
            />
            <div className={styles.editFooter}>
              <span className={styles.charCount}>{editText.length} / 2000</span>
              <div className={styles.editActions}>
                <button
                  onClick={handleCancelEdit}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className={styles.saveButton}
                  disabled={
                    loading || !editText.trim() || editText === comment.content
                  }
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.commentContent}>{comment.content}</div>
        )}

        {/* Actions */}
        {!editMode && (
          <div className={styles.commentActions}>
            <button
              onClick={handleLike}
              className={styles.actionButton}
              disabled={!user}
              title={!user ? "Please login to like" : ""}
            >
              👍 <span>{likeCount}</span>
            </button>

            <button
              onClick={handleDislike}
              className={styles.actionButton}
              disabled={!user}
              title={!user ? "Please login to dislike" : ""}
            >
              👎 <span>{dislikeCount}</span>
            </button>

            {depth < 3 && (
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className={styles.actionButton}
                disabled={!user}
                title={!user ? "Please login to reply" : ""}
              >
                💬 Reply {replyCount > 0 && `(${replyCount})`}
              </button>
            )}

            {isAuthor && (
              <>
                <button
                  onClick={handleEdit}
                  className={styles.actionButton}
                  disabled={deleting}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={handleDelete}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  disabled={deleting}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        )}

        {/* Reply Form */}
        {replyOpen && user && (
          <div className={styles.replyForm}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.author?.username}...`}
              rows={3}
              className={styles.replyTextarea}
              disabled={loading}
              maxLength={2000}
            />
            <div className={styles.replyFooter}>
              <span className={styles.charCount}>
                {replyText.length} / 2000
              </span>
              <div className={styles.replyActions}>
                <button
                  onClick={handleCancelReply}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  className={styles.sendButton}
                  disabled={loading || !replyText.trim()}
                >
                  {loading ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Prompt */}
        {replyOpen && !user && (
          <div className={styles.loginPrompt}>
            Please <a href="/login">log in</a> to reply to comments.
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.commentReplies}>
          {comment.replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
