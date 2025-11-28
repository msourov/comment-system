const { body, query, param } = require('express-validator');

const createCommentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
  
  body('pageId')
    .trim()
    .notEmpty()
    .withMessage('Page ID is required'),
  
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

const updateCommentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid comment ID'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters')
];

const getCommentsValidator = [
  query('pageId')
    .trim()
    .notEmpty()
    .withMessage('Page ID is required'),
  
  query('sortBy')
    .optional()
    .isIn(['newest', 'oldest', 'mostLiked', 'mostDisliked'])
    .withMessage('Invalid sort option'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const commentIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid comment ID')
];

module.exports = {
  createCommentValidator,
  updateCommentValidator,
  getCommentsValidator,
  commentIdValidator
};
