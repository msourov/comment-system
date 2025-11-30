export const validateComment = (content) => {
  const errors = {};

  if (!content || content.trim().length === 0) {
    errors.content = 'Comment cannot be empty';
  } else if (content.trim().length < 3) {
    errors.content = 'Comment must be at least 3 characters';
  } else if (content.trim().length > 500) {
    errors.content = 'Comment cannot exceed 500 characters';
  }

  return errors;
};

export const canUserVote = (comment, userId) => {
    console.log(userId, 'userId')
  // Check if user has already voted
  if (!comment.userVote) {
    return true;
  }
  return false;
};
