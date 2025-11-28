import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must be at least 1 character'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  pageId: {
    type: String,
    required: [true, 'Page ID is required'],
    trim: true,
    index: true
  },
  
  likeCount: {
    type: Number,
    default: 0,
    index: true
  },
  dislikeCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  replyCount: {
    type: Number,
    default: 0
  },
  
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

commentSchema.index({ pageId: 1, isDeleted: 1, createdAt: -1 });
commentSchema.index({ pageId: 1, isDeleted: 1, likeCount: -1 });
commentSchema.index({ pageId: 1, isDeleted: 1, dislikeCount: -1 });
commentSchema.index({ parentComment: 1, isDeleted: 1, createdAt: 1 });
commentSchema.index({ author: 1, createdAt: -1 });

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

commentSchema.methods.isLikedByUser = function(userId) {
  return this.likedBy.some(id => id.equals(userId));
};

commentSchema.methods.isDislikedByUser = function(userId) {
  return this.dislikedBy.some(id => id.equals(userId));
};

export default model('Comment', commentSchema);
