import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInHours = (now - dateObj) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  return format(dateObj, 'MMM dd, yyyy');
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getVoteStatus = (userVote) => {
  if (userVote === 1) return 'liked';
  if (userVote === -1) return 'disliked';
  return 'none';
};
