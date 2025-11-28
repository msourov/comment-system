import { Router } from 'express';
import { register, login, getProfile, logout } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter';
import validate from '../middlewares/validate.middleware';
import { registerValidator, loginValidator } from '../validators/auth.validator';

const router = Router();

router.post(
  '/register',
  authLimiter,
  registerValidator,
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  login
);

router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;
