import { Schema, model } from 'mongoose';

const interactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

interactionSchema.index({ user: 1, comment: 1 }, { unique: true });

interactionSchema.index({ comment: 1, type: 1 });

export default model('Interaction', interactionSchema);
