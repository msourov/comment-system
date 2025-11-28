import { register as _register, login as _login, getProfile as _getProfile } from '../services/auth.service';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../utils/asyncHandler';

const register = asyncHandler(async (req, res) => {
  const result = await _register(req.body);
  
  res.status(201).json(
    new ApiResponse(201, result, 'User registered successfully')
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await _login(email, password);
  
  res.status(200).json(
    new ApiResponse(200, result, 'Login successful')
  );
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await _getProfile(req.user._id);
  
  res.status(200).json(
    new ApiResponse(200, profile, 'Profile retrieved successfully')
  );
});

const logout = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, null, 'Logout successful')
  );
});

export default {
  register,
  login,
  getProfile,
  logout
};
