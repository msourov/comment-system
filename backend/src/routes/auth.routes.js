import { Router } from "express";
import {
  register,
  login,
  getProfile,
  logout,
  refreshToken,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.get("/profile", authenticate, getProfile);
router.post("/logout", authenticate, logout);
router.post("/refresh", refreshToken);

export default router;
