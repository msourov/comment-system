import { find, countDocuments, findById, create, findByIdAndUpdate, updateOne, findOne } from '../models/Comment.model';
import ApiError from '../utils/ApiError';

class CommentService {
  async getComments(pageId, filters = {}) {
    const { 
      sortBy = 'newest', 
      page = 1, 
      limit = 20,
      cursor = null
    } = filters;
    
    const skip = (page - 1) * limit;

    const query = { 
      pageId, 
      isDeleted: false,
      parentComment: null
    };

    if (cursor && sortBy === 'newest') {
      query.createdAt = { $lt: new Date(cursor) };
    }
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      mostLiked: { likeCount: -1, createdAt: -1 },
      mostDisliked: { dislikeCount: -1, createdAt: -1 }
    };
    const comments = await find(query)
      .sort(sortOptions[sortBy])
      .limit(limit)
      .skip(cursor ? 0 : skip)
      .populate('author', 'username email')
      .lean()
      .exec();

    const total = await countDocuments(query);
    
    return {
      comments,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: total > page * limit,
        nextCursor: comments.length > 0 
          ? comments[comments.length - 1].createdAt 
          : null
      }
    };
  }

  async createComment(userId, commentData) {
    const { content, pageId, parentCommentId } = commentData;

    if (parentCommentId) {
      const parentExists = await findById(parentCommentId);
      if (!parentExists || parentExists.isDeleted) {
        throw new ApiError(404, 'Parent comment not found');
      }
    }
    
    const comment = await create({
      content,
      pageId,
      author: userId,
      parentComment: parentCommentId || null
    });

    if (parentCommentId) {
      await findByIdAndUpdate(parentCommentId, {
        $inc: { replyCount: 1 }
      });
    }
    await comment.populate('author', 'username email');
    return comment;
  }

  async toggleLike(commentId, userId) {
    const comment = await findById(commentId);
    
    if (!comment || comment.isDeleted) {
      throw new ApiError(404, 'Comment not found');
    }
    const hasLiked = comment.isLikedByUser(userId);
    const hasDisliked = comment.isDislikedByUser(userId);

    if (hasDisliked) {
      await updateOne(
        { _id: commentId },
        {
          $pull: { dislikedBy: userId },
          $inc: { dislikeCount: -1 }
        }
      );
    }
    if (hasLiked) {
      await updateOne(
        { _id: commentId },
        {
          $pull: { likedBy: userId },
          $inc: { likeCount: -1 }
        }
      );
      return { action: 'unliked', likeCount: comment.likeCount - 1 };
    } else {
      await updateOne(
        { _id: commentId },
        {
          $addToSet: { likedBy: userId },
          $inc: { likeCount: 1 }
        }
      );
      return { 
        action: 'liked', 
        likeCount: comment.likeCount + 1 + (hasDisliked ? 0 : 0)
      };
    }
  }

  async updateComment(commentId, userId, content) {
    const comment = await findOne({
      _id: commentId,
      author: userId,
      isDeleted: false
    });
    
    if (!comment) {
      throw new ApiError(403, 'Unauthorized or comment not found');
    }
    
    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();
    
    return comment;
  }
  
  async deleteComment(commentId, userId) {
    const comment = await findOne({
      _id: commentId,
      author: userId
    });
    if (!comment) {
      throw new ApiError(403, 'Unauthorized or comment not found');
    }
    comment.isDeleted = true;
    await comment.save();
    
    return { message: 'Comment deleted successfully' };
  }
}

export default new CommentService();
