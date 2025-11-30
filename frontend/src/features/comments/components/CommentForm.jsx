import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addComment } from "../commentsSlice";
import { SocketContext } from "../../../context/SocketContext";

const CommentForm = () => {
  const [content, setContent] = useState("");
  const dispatch = useDispatch();

  const pageId = window.location.pathname;

  const { joinPage, leavePage } = useContext(SocketContext);

  useEffect(() => {
    joinPage(pageId);
    return () => leavePage(pageId);
  }, [pageId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      dispatch(addComment({ content, pageId }));
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        required
        minLength={1}
        maxLength={500}
      />
      <button type="submit">Post Comment</button>
    </form>
  );
};

export default CommentForm;
