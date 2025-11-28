import {
  getComments as _getComments,
  getCommentById as _getCommentById,
  createComment as _createComment,
  updateComment as _updateComment,
  deleteComment as _deleteComment,
} from "../services/comment.service";
import { toggleLike, toggleDislike } from "../services/interaction.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getComments = asyncHandler(async (req, res) => {
  const { pageId, sortBy, page, limit, cursor, parentCommentId } = req.query;

  const result = await _getComments({
    pageId,
    sortBy,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    cursor,
    parentCommentId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Comments retrieved successfully"));
});

const getCommentById = asyncHandler(async (req, res) => {
  const comment = await _getCommentById(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment retrieved successfully"));
});

const createComment = asyncHandler(async (req, res) => {
  const comment = await _createComment(req.user._id, req.body);
  if (req.app.io) {
    req.app.io.to(`page:${req.body.pageId}`).emit("newComment", comment);
  }

  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const comment = await _updateComment(
    req.params.id,
    req.user._id,
    req.body.content
  );

  if (req.app.io) {
    req.app.io.to(`page:${comment.pageId}`).emit("updateComment", comment);
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const result = await _deleteComment(
    req.params.id,
    req.user._id,
    req.user.role
  );

  if (req.app.io) {
    req.app.io.to(`page:${req.params.pageId}`).emit("deleteComment", {
      commentId: req.params.id,
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, result, "Comment deleted successfully"));
});

const likeComment = asyncHandler(async (req, res) => {
  const comment = await commentService.getCommentById(req.params.id);

  const result = await interactionService.toggleLike(
    req.params.id,
    req.user._id
  );

  if (req.app.io) {
    req.app.io.to(`page:${comment.pageId}`).emit("likeComment", {
      commentId: req.params.id,
      ...result,
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, result, `Comment ${result.action}`));
});

const dislikeComment = asyncHandler(async (req, res) => {
  const comment = await commentService.getCommentById(req.params.id);

  const result = await interactionService.toggleDislike(
    req.params.id,
    req.user._id
  );

  if (req.app.io) {
    req.app.io.to(`page:${req.params.pageId}`).emit("dislikeComment", {
      commentId: req.params.id,
      ...result,
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, result, `Comment ${result.action}`));
});

export default {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
};
