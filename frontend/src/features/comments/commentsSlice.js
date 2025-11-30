import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

const initialState = {
  comments: [],
  totalComments: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  sortBy: "newest", // newest, mostLiked, mostDisliked
  loading: false,
  error: null,
  actionLoading: {}, // Track loading state for individual actions
};

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (
    { page = 1, pageId, limit = 10, sortBy = "newest" },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/comments", {
        params: { page, pageId, limit, sortBy },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ content, pageId, parentCommentId = null }, { rejectWithValue }) => {
    try {
      const response = await api.post("/comments", {
        content,
        pageId,
        parentCommentId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update comment"
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await api.delete(`/comments/${commentId}`);
      return commentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);

export const likeComment = createAsyncThunk(
  "comments/likeComment",
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to like comment"
      );
    }
  }
);

export const dislikeComment = createAsyncThunk(
  "comments/dislikeComment",
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/comments/${commentId}/dislike`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to dislike comment"
      );
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Real-time updates from WebSocket
    addCommentRealtime: (state, action) => {
      const newComment = action.payload;

      // Validate the comment object exists
      if (!newComment || !newComment._id) {
        console.warn("Invalid comment received:", newComment);
        return;
      }

      console.log("Adding comment to state:", newComment);

      if (newComment.parentComment) {
        const addReplyToParent = (comments) => {
          return comments.map((comment) => {
            // Found the parent comment
            if (comment._id === newComment.parentComment) {
              // Check if reply already exists
              const replyExists = comment.replies?.some(
                (r) => r._id === newComment._id
              );

              if (!replyExists) {
                console.log("Adding reply to parent:", comment._id);
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                  replyCount: (comment.replyCount || 0) + 1,
                };
              }
              console.log("Reply already exists, skipping");
              return comment;
            }
            // Recursively check nested replies
            if (comment.replies?.length > 0) {
              return {
                ...comment,
                replies: addReplyToParent(comment.replies),
              };
            }
            return comment;
          });
        };
        state.comments = addReplyToParent(state.comments);
      } else {
        // check for duplicates in top level comment
        const commentExists = state.comments.some(
          (c) => c && c._id === newComment._id
        );

        if (!commentExists) {
          console.log("Adding new top-level comment");
          state.comments.unshift({
            ...newComment,
            replies: newComment.replies || [],
          });
          state.totalComments += 1;
        } else {
          console.log("Comment already exists, skipping");
        }
      }
    },

    updateCommentRealtime: (state, action) => {
      const { commentId, content, isEdited, editedAt } = action.payload;

      const updateInComments = (comments) => {
        return comments.map((comment) => {
          if (comment._id === commentId) {
            return { ...comment, content, isEdited, editedAt };
          }
          if (comment.replies?.length > 0) {
            return {
              ...comment,
              replies: updateInComments(comment.replies),
            };
          }
          return comment;
        });
      };

      state.comments = updateInComments(state.comments);
    },

    deleteCommentRealtime: (state, action) => {
      const commentId = action.payload;

      const removeFromComments = (comments) => {
        return comments
          .map((comment) => {
            // If this is the comment to delete
            if (comment._id === commentId) {
              return null; // Mark for removal
            }
            if (comment.replies?.length > 0) {
              const updatedReplies = removeFromComments(comment.replies);
              return {
                ...comment,
                replies: updatedReplies,
                replyCount: updatedReplies.length,
              };
            }
            return comment;
          })
          .filter((c) => c !== null); // Remove null entries
      };

      state.comments = removeFromComments(state.comments);
      state.totalComments = Math.max(0, state.totalComments - 1);
    },

    updateCommentLikesRealtime: (state, action) => {
      const { commentId, likeCount, dislikeCount } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);
      if (comment) {
        comment.likeCount = likeCount;
        comment.dislikeCount = dislikeCount;
      }
    },
    updateCommentInteraction: (state, action) => {
      const { commentId, likeCount, dislikeCount } = action.payload;

      const updateInComments = (comments) => {
        return comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likeCount: likeCount,
              dislikeCount: dislikeCount,
              likes: likeCount,
              dislikes: dislikeCount,
            };
          }
          if (comment.replies?.length > 0) {
            return {
              ...comment,
              replies: updateInComments(comment.replies),
            };
          }
          return comment;
        });
      };

      state.comments = updateInComments(state.comments);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        const { comments, pagination } = action.payload.data || action.payload;
        state.comments = comments.map((comment) => ({
          ...comment,
          replies: comment.replies || [],
        }));
        state.totalComments = action.payload.pagination.total;
        state.currentPage = action.payload.pagination.page;
        state.totalPages = action.payload.pagination.totalPages;
        state.limit = pagination.limit;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.actionLoading.add = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state) => {
        state.actionLoading.add = false;
        console.log("Comment created via API, socket will add it");
      })
      .addCase(addComment.rejected, (state, action) => {
        state.actionLoading.add = false;
        state.error = action.payload;
      })
      // Update Comment
      .addCase(updateComment.pending, (state, action) => {
        state.actionLoading[`update_${action.meta.arg.commentId}`] = true;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const commentId = action.meta.arg.commentId;
        state.actionLoading[`update_${commentId}`] = false;

        // Extract updated comment from response
        const updatedComment =
          action.payload.data || action.payload.comment || action.payload;

        console.log("Comment updated via API:", commentId);

        const updateInComments = (comments) => {
          return comments.map((comment) => {
            if (comment._id === commentId) {
              console.log("   Found top-level comment, preserving replies");
              return {
                ...comment,
                content: updatedComment.content,
                isEdited:
                  updatedComment.isEdited !== undefined
                    ? updatedComment.isEdited
                    : true,
                editedAt: updatedComment.editedAt || new Date().toISOString(),
                replies: comment.replies || [],
              };
            }
            // check nested replies
            if (comment.replies?.length > 0) {
              return {
                ...comment,
                replies: updateInComments(comment.replies),
              };
            }
            return comment;
          });
        };

        state.comments = updateInComments(state.comments);
        console.log("   Comment updated, replies preserved");
      })
      .addCase(updateComment.rejected, (state, action) => {
        const commentId = action.meta.arg.commentId;
        state.actionLoading[`update_${commentId}`] = false;
        state.error = action.payload;
      })
      // Delete Comment
      .addCase(deleteComment.pending, (state, action) => {
        state.actionLoading[`delete_${action.meta.arg}`] = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        state.actionLoading[`delete_${commentId}`] = false;
        setTimeout(() => {
          const stillExists = state.comments.some((c) => c._id === commentId);
          if (stillExists) {
            console.log("⚠️ Socket didn't update, removing manually");
            const removeFromComments = (comments) => {
              return comments
                .map((comment) => {
                  if (comment._id === commentId) return null;
                  if (comment.replies?.length > 0) {
                    return {
                      ...comment,
                      replies: removeFromComments(comment.replies),
                    };
                  }
                  return comment;
                })
                .filter((c) => c !== null);
            };
            state.comments = removeFromComments(state.comments);
          }
        }, 500);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        const commentId = action.meta.arg;
        state.actionLoading[`delete_${commentId}`] = false;
        state.error = action.payload;
      })
      // Like Comment
      .addCase(likeComment.pending, (state) => {
        state.actionLoading.like = true;
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        state.actionLoading.like = false;

        // Optimistically update immediately
        const { data } = action.payload;
        const commentId = action.meta.arg;

        const updateInComments = (comments) => {
          return comments.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                likeCount: data.likeCount,
                dislikeCount: data.dislikeCount,
                likes: data.likeCount,
                dislikes: data.dislikeCount,
              };
            }
            if (comment.replies?.length > 0) {
              return {
                ...comment,
                replies: updateInComments(comment.replies),
              };
            }
            return comment;
          });
        };

        state.comments = updateInComments(state.comments);
      })
      .addCase(likeComment.rejected, (state, action) => {
        state.actionLoading.like = false;
        state.error = action.payload;
      })
      // Dislike Comment
      .addCase(dislikeComment.pending, (state) => {
        state.actionLoading.dislike = true;
      })
      .addCase(dislikeComment.fulfilled, (state, action) => {
        state.actionLoading.dislike = false;

        // Optimistically update immediately
        const { data } = action.payload;
        const commentId = action.meta.arg;

        const updateInComments = (comments) => {
          return comments.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                likeCount: data.likeCount,
                dislikeCount: data.dislikeCount,
                likes: data.likeCount,
                dislikes: data.dislikeCount,
              };
            }
            if (comment.replies?.length > 0) {
              return {
                ...comment,
                replies: updateInComments(comment.replies),
              };
            }
            return comment;
          });
        };

        state.comments = updateInComments(state.comments);
      })
      .addCase(dislikeComment.rejected, (state, action) => {
        state.actionLoading.dislike = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPage,
  setSortBy,
  setLimit,
  clearError,
  addCommentRealtime,
  updateCommentRealtime,
  deleteCommentRealtime,
  updateCommentLikesRealtime,
  updateCommentInteraction,
} = commentsSlice.actions;

export default commentsSlice.reducer;
