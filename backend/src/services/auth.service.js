import { sign } from "jsonwebtoken";
import { findOne, create, findById } from "../models/User.model";
import ApiError from "../utils/ApiError";

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
    const existingUser = await findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(400, "Email already registered");
      }
      throw new ApiError(400, "Username already taken");
    }
    const user = await create({
      username,
      email,
      password,
    });

    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

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
    const user = await findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      throw new ApiError(401, "Invalid email or password");
    }
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password");
    }
    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

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
    const user = await findById(userId);
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
