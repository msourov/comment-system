import { verify } from 'jsonwebtoken';
import { findById } from '../models/User.model';
import ApiError from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw new ApiError(401, 'Authentication required. Please login.');
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    const user = await findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User no longer exists or is inactive');
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token. Please login again.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired. Please login again.');
    }
    throw error;
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
};

export default { authenticate, authorize };
