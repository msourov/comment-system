import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addComment } from "../commentsSlice";
import { SocketContext } from "../../../context/SocketContext";
import styles from "./CommentForm.module.scss";

const CommentForm = () => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const pageId = window.location.pathname;
  const { joinPage, leavePage } = useContext(SocketContext);

  useEffect(() => {
    joinPage(pageId);
    return () => leavePage(pageId);
  }, [pageId, joinPage, leavePage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dispatch(addComment({ content: content.trim(), pageId })).unwrap();
      setContent("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setContent("");
  };

  const charCount = content.length;
  const maxChars = 500;
  const isNearLimit = charCount > maxChars * 0.8;
  const isOverLimit = charCount > maxChars;

  const getUserInitial = () => {
    return user?.username?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.commentForm} ${
        isSubmitting ? styles.formLoading : ""
      } ${showSuccess ? styles.formSuccess : ""}`}
    >
      <div className={styles.formHeader}>
        <div className={styles.userAvatar}>{getUserInitial()}</div>
        <h3 className={styles.formTitle}>Share your thoughts</h3>
      </div>

      <div className={styles.formGroup}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?..."
          required
          minLength={1}
          maxLength={maxChars}
          disabled={isSubmitting}
          className={styles.formTextarea}
        />
        <div
          className={`${styles.charCounter} ${
            isNearLimit ? styles.nearLimit : ""
          } ${isOverLimit ? styles.overLimit : ""}`}
        >
          {charCount}/{maxChars}
        </div>
      </div>

      <div className={styles.formActions}>
        {content && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className={styles.clearButton}
          >
            Clear
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting || isOverLimit}
          className={styles.submitButton}
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
