import Comment from "../models/Comment.model.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

export const toggleLike = async (commentId, userId) => {
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const hasLiked = comment.likedBy.some((id) => id.equals(userIdObj));
  const hasDisliked = comment.dislikedBy.some((id) => id.equals(userIdObj));

  if (hasDisliked) {
    await Comment.updateOne(
      { _id: commentId },
      {
        $pull: { dislikedBy: userIdObj },
        $inc: { dislikeCount: -1 },
      }
    );
  }

  if (hasLiked) {
    await Comment.updateOne(
      { _id: commentId },
      {
        $pull: { likedBy: userIdObj },
        $inc: { likeCount: -1 },
      }
    );

    return {
      action: "unliked",
      likeCount: comment.likeCount - 1,
      dislikeCount: comment.dislikeCount - (hasDisliked ? 1 : 0),
    };
  }

  await Comment.updateOne(
    { _id: commentId },
    {
      $addToSet: { likedBy: userIdObj },
      $inc: { likeCount: 1 },
    }
  );

  return {
    action: "liked",
    likeCount: comment.likeCount + 1,
    dislikeCount: comment.dislikeCount - (hasDisliked ? 1 : 0),
  };
};

export const toggleDislike = async (commentId, userId) => {
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const hasLiked = comment.likedBy.some((id) => id.equals(userIdObj));
  const hasDisliked = comment.dislikedBy.some((id) => id.equals(userIdObj));

  if (hasLiked) {
    await Comment.updateOne(
      { _id: commentId },
      {
        $pull: { likedBy: userIdObj },
        $inc: { likeCount: -1 },
      }
    );
  }

  if (hasDisliked) {
    await Comment.updateOne(
      { _id: commentId },
      {
        $pull: { dislikedBy: userIdObj },
        $inc: { dislikeCount: -1 },
      }
    );

    return {
      action: "undisliked",
      likeCount: comment.likeCount - (hasLiked ? 1 : 0),
      dislikeCount: comment.dislikeCount - 1,
    };
  }

  await Comment.updateOne(
    { _id: commentId },
    {
      $addToSet: { dislikedBy: userIdObj },
      $inc: { dislikeCount: 1 },
    }
  );

  return {
    action: "disliked",
    likeCount: comment.likeCount - (hasLiked ? 1 : 0),
    dislikeCount: comment.dislikeCount + 1,
  };
};

export const getUserInteraction = async (commentId, userId) => {
  const comment = await Comment.findById(commentId)
    .select("likedBy dislikedBy")
    .lean();

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);

  return {
    hasLiked: comment.likedBy.some((id) => id.equals(userIdObj)),
    hasDisliked: comment.dislikedBy.some((id) => id.equals(userIdObj)),
  };
};
