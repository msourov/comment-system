import {
  getComments as _getComments,
  getCommentById as _getCommentById,
  createComment as _createComment,
  updateComment as _updateComment,
  deleteComment as _deleteComment,
} from "../services/comment.service.js";
import { emitToPage } from "../socket/socketHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as interactionService from "../services/interaction.service.js";

export const getComments = asyncHandler(async (req, res) => {
  const { pageId, sortBy, page, limit, cursor, parentCommentId } = req.query;

  const result = await _getComments({
    pageId,
    sortBy,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    cursor,
    parentCommentId,
  });

  res.status(200).json(
    new ApiResponse(200, {
      comments: result.comments,
      pagination: result.pagination,
    }, "Comments retrieved successfully")
  );
});

export const getCommentById = asyncHandler(async (req, res) => {
  const comment = await _getCommentById(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment retrieved successfully"));
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await _createComment(req.user._id, req.body);
  if (req.app.io) {
    emitToPage(req.app.io, req.body.pageId, "newComment", {
      comment,
      timestamp: new Date(),
    });
  }

  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully"));
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await _updateComment(
    req.params.id,
    req.user._id,
    req.body.content
  );

  // Emit update to all users
  if (req.app.io) {
    emitToPage(req.app.io, comment.pageId, "commentUpdated", {
      commentId: comment._id,
      content: comment.content,
      isEdited: comment.isEdited,
      editedAt: comment.editedAt,
      timestamp: new Date(),
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await _getCommentById(req.params.id);

  const result = await _deleteComment(
    req.params.id,
    req.user._id,
    req.user.role
  );

  // Emit deletion to all users
  if (req.app.io) {
    console.log('📡 Emitting commentDeleted for:', req.params.id);
    emitToPage(req.app.io, comment.pageId, "commentDeleted", {
      commentId: req.params.id,
      timestamp: new Date(),
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, result, "Comment deleted successfully"));
});

export const likeComment = asyncHandler(async (req, res) => {
  const comment = await _getCommentById(req.params.id);

  const result = await interactionService.toggleLike(
    req.params.id,
    req.user._id
  );

  // Emit like update to all users
  if (req.app.io) {
    emitToPage(req.app.io, comment.pageId, "commentLiked", {
      commentId: req.params.id,
      action: result.action,
      likeCount: result.likeCount,
      dislikeCount: result.dislikeCount,
      userId: req.user._id,
      timestamp: new Date(),
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, result, `Comment ${result.action}`));
});

export const dislikeComment = asyncHandler(async (req, res) => {
  const comment = await _getCommentById(req.params.id);

  const result = await interactionService.toggleDislike(
    req.params.id,
    req.user._id
  );

  // Emit dislike update to all users
  if (req.app.io) {
    emitToPage(req.app.io, comment.pageId, "commentDisliked", {
      commentId: req.params.id,
      action: result.action,
      likeCount: result.likeCount,
      dislikeCount: result.dislikeCount,
      userId: req.user._id,
      timestamp: new Date(),
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, result, `Comment ${result.action}`));
});
