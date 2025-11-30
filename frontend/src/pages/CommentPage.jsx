import CommentForm from "../features/comments/components/CommentForm"
import CommentList from "../features/comments/components/CommentList"

const CommentPage = () => {
  return (
    <div className="comments-section">
  <div className="section-header">
    <h2>Community Comments</h2>
    <p className="section-subtitle">Join the discussion!</p>
  </div>
  <CommentForm />
  <CommentList />
</div>
  )
}

export default CommentPage