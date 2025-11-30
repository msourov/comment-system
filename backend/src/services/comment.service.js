import Comment from "../models/Comment.model.js";
import ApiError from "../utils/ApiError.js";

export const getComments = async (filters) => {
  const {
    pageId,
    sortBy = "newest",
    page = 1,
    limit = 10,
    cursor = null,
    parentCommentId = null,
  } = filters;

  const skip = (page - 1) * limit;

  // Only get top-level comments (no parentComment)
  const query = {
    pageId,
    isDeleted: false,
    parentComment: null,
  };

  if (cursor && sortBy === "newest") {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    mostLiked: { likeCount: -1, createdAt: -1 },
    mostDisliked: { dislikeCount: -1, createdAt: -1 },
  };

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .sort(sortOptions[sortBy] || sortOptions.newest)
      .limit(limit)
      .skip(cursor ? 0 : skip)
      .populate("author", "username email")
      .lean()
      .exec(),

    Comment.countDocuments(query),
  ]);

  // Fetch replies for each top-level comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({
        parentComment: comment._id,
        isDeleted: false,
      })
        .sort({ createdAt: 1 }) // Replies sorted oldest first
        .populate("author", "username email")
        .lean();

      return {
        ...comment,
        replies: replies || [],
      };
    })
  );

  return {
    comments: commentsWithReplies,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: total > page * limit,
      nextCursor:
        comments.length > 0 ? comments[comments.length - 1].createdAt : null,
    },
  };
};

export const getCommentById = async (commentId) => {
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  })
    .populate("author", "username email")
    .lean();

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.parentComment) {
    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .populate("author", "username email")
      .lean();

    comment.replies = replies;
  }

  return comment;
};

export const createComment = async (userId, commentData) => {
  const { content, pageId, parentCommentId } = commentData;

  if (parentCommentId) {
    const parentComment = await Comment.findOne({
      _id: parentCommentId,
      isDeleted: false,
    });

    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }

    if (parentComment.parentComment) {
      throw new ApiError(
        400,
        "Cannot reply to a reply. Please reply to the main comment."
      );
    }
  }

  const comment = await Comment.create({
    content,
    pageId,
    author: userId,
    parentComment: parentCommentId || null,
  });

  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, {
      $inc: { replyCount: 1 },
    });
  }

  await comment.populate("author", "username email");

  return comment;
};

export const updateComment = async (commentId, userId, content) => {
  const comment = await Comment.findOne({
    _id: commentId,
    author: userId,
    isDeleted: false,
  });

  if (!comment) {
    throw new ApiError(
      404,
      "Comment not found or you are not authorized to edit it"
    );
  }

  comment.content = content;
  comment.isEdited = true;
  comment.editedAt = new Date();

  await comment.save();
  await comment.populate("author", "username email");

  return comment;
};

export const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);

  if (!comment || comment.isDeleted) {
    throw new ApiError(404, "Comment not found");
  }

  const isOwner = comment.author.toString() === userId.toString();
  const isModerator = ["admin", "moderator"].includes(userRole);

  if (!isOwner && !isModerator) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  comment.isDeleted = true;
  await comment.save();

  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $inc: { replyCount: -1 },
    });
  }

  return { message: "Comment deleted successfully" };
};
