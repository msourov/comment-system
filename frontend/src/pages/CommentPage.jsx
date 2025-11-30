import CommentForm from "../features/comments/components/CommentForm";
import CommentList from "../features/comments/components/CommentList";
import styles from "./CommentPage.module.scss";

const CommentPage = () => {
  return (
    <div className={styles.commentsSection}>
      <CommentForm />
      <CommentList />
    </div>
  );
};

export default CommentPage;
