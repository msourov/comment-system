import { findOne, updateOne, findById } from '../models/Comment.model';
import ApiError from '../utils/ApiError';
import { Types } from 'mongoose';
class InteractionService {
  async toggleLike(commentId, userId) {
    const comment = await findOne({
      _id: commentId,
      isDeleted: false
    });
    
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }
    
    const userIdObj = new Types.ObjectId(userId);
    const hasLiked = comment.likedBy.some(id => id.equals(userIdObj));
    const hasDisliked = comment.dislikedBy.some(id => id.equals(userIdObj));
    if (hasDisliked) {
      await updateOne(
        { _id: commentId },
        {
          $pull: { dislikedBy: userIdObj },
          $inc: { dislikeCount: -1 }
        }
      );
    }
    if (hasLiked) {
      await updateOne(
        { _id: commentId },
        {
          $pull: { likedBy: userIdObj },
          $inc: { likeCount: -1 }
        }
      );
      
      return {
        action: 'unliked',
        likeCount: comment.likeCount - 1,
        dislikeCount: comment.dislikeCount - (hasDisliked ? 1 : 0)
      };
    } else {
      await updateOne(
        { _id: commentId },
        {
          $addToSet: { likedBy: userIdObj },
          $inc: { likeCount: 1 }
        }
      );
      
      return {
        action: 'liked',
        likeCount: comment.likeCount + 1,
        dislikeCount: comment.dislikeCount - (hasDisliked ? 1 : 0)
      };
    }
  }

  async toggleDislike(commentId, userId) {
    const comment = await findOne({
      _id: commentId,
      isDeleted: false
    });
    
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }
    const userIdObj = new Types.ObjectId(userId);
    const hasLiked = comment.likedBy.some(id => id.equals(userIdObj));
    const hasDisliked = comment.dislikedBy.some(id => id.equals(userIdObj));

    if (hasLiked) {
      await updateOne(
        { _id: commentId },
        {
          $pull: { likedBy: userIdObj },
          $inc: { likeCount: -1 }
        }
      );
    }

    if (hasDisliked) {
      await updateOne(
        { _id: commentId },
        {
          $pull: { dislikedBy: userIdObj },
          $inc: { dislikeCount: -1 }
        }
      );
      
      return {
        action: 'undisliked',
        likeCount: comment.likeCount - (hasLiked ? 1 : 0),
        dislikeCount: comment.dislikeCount - 1
      };
    } else {
      await updateOne(
        { _id: commentId },
        {
          $addToSet: { dislikedBy: userIdObj },
          $inc: { dislikeCount: 1 }
        }
      );
      
      return {
        action: 'disliked',
        likeCount: comment.likeCount - (hasLiked ? 1 : 0),
        dislikeCount: comment.dislikeCount + 1
      };
    }
  }

  async getUserInteraction(commentId, userId) {
    const comment = await findById(commentId)
      .select('likedBy dislikedBy')
      .lean();
    
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }
    const userIdObj = new Types.ObjectId(userId);
    return {
      hasLiked: comment.likedBy.some(id => id.equals(userIdObj)),
      hasDisliked: comment.dislikedBy.some(id => id.equals(userIdObj))
    };
  }
}

export default new InteractionService();
