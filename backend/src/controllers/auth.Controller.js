import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import AuthService from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, result, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await AuthService.getProfile(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, profile, "Profile retrieved successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) throw new ApiError(401, "Refresh token missing");

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user) throw new ApiError(401, "Invalid refresh token");

  const isValid = await user.compareRefreshToken(refreshToken);
  if (!isValid) throw new ApiError(401, "Invalid refresh token");

  const newAccessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const newRefreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );

  user.refreshToken = newRefreshToken;
  await user.save();

  res.status(200).json({
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});
