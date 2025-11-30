import { useSelector } from "react-redux";

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const canEditComment = (commentUserId) => {
    return isAuthenticated && user && user.id === commentUserId;
  };

  const canDeleteComment = (commentUserId) => {
    return isAuthenticated && user && user.id === commentUserId;
  };

  return {
    user,
    isAuthenticated,
    loading,
    canEditComment,
    canDeleteComment,
  };
};
