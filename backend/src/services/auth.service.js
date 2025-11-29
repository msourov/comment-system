import pkg from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";

const { sign } = pkg;

class AuthService {
  generateToken(userId) {
    return sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "1h",
    });
  }

  generateRefreshToken(userId) {
    return sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
    });
  }

  async register(userData) {
    const { username, email, password } = userData;
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(400, "Email already registered");
      }
      throw new ApiError(400, "Username already taken");
    }
    const user = await User.create({
      username,
      email,
      password,
    });

    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    await user.setRefreshToken(refreshToken);
    await user.save();

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password");
    }
    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    await user.setRefreshToken(refreshToken);
    await user.save();

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
