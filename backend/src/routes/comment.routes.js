import { Router } from "express";
import {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
} from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { commentLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createCommentValidator,
  updateCommentValidator,
  getCommentsValidator,
  commentIdValidator,
} from "../validators/comment.validator.js";

const router = Router();

router.get("/", getCommentsValidator, validate, getComments);
router.get("/:id", commentIdValidator, validate, getCommentById);
router.post(
  "/",
  authenticate,
  commentLimiter,
  createCommentValidator,
  validate,
  createComment
);
router.put(
  "/:id",
  authenticate,
  updateCommentValidator,
  validate,
  updateComment
);
router.delete(
  "/:id",
  authenticate,
  commentIdValidator,
  validate,
  deleteComment
);
router.post(
  "/:id/like",
  authenticate,
  commentIdValidator,
  validate,
  likeComment
);
router.post(
  "/:id/dislike",
  authenticate,
  commentIdValidator,
  validate,
  dislikeComment
);

export default router;
