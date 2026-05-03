import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { User } from "../models/user.models.js";
import { generateAuthTokens } from "../services/auth.service.js";
import { env } from "../config/env.js";
import { hashToken } from "../utils/hash.utils.js";
import { RefreshToken } from "../models/refreshToken.models.js";
import jwt from "jsonwebtoken";

export const singUp = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "Email already in use");
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json(new ApiResponse(true, 201, "User registered successfully", {
        id: user._id,
        name: user.name,
        email: user.email,
    }));
});

export const signIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAuthTokens(user, req);

    const accessTokenOptions = {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "strict",
        maxAge: env.accessToken.expiresInMs,
    };

    const refreshTokenOptions = {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "strict",
        maxAge: env.refreshToken.expiresInMs,
        path: "/api/v1/auth/refresh",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(true, 200, "Login successful", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        }));
});

export const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        throw new ApiError(401, "No refresh token provided");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, env.refreshToken.secret);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const hashedToken = hashToken(token);

    const tokenDoc = await RefreshToken.findOne({ token: hashedToken });

    if (!tokenDoc) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (tokenDoc.isRevoked) {
        await RefreshToken.updateMany(
            { userId: tokenDoc.userId },
            { isRevoked: true }
        );

        throw new ApiError(401, "Token reuse detected all sessions revoked");
    }

    if (tokenDoc.expireAt < new Date()) {
        throw new ApiError(401, "Refresh token expired");
    }

    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    const user = await User.findById(tokenDoc.userId).select("-password");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    const { accessToken, refreshToken } = await generateAuthTokens(user, req);
    const accessTokenOptions = {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "strict",
        maxAge: env.accessToken.expiresInMs,
        path: "/",
    };

    const refreshTokenOptions = {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "strict",
        maxAge: env.refreshToken.expiresInMs,
        path: "/api/v1/auth/refresh",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(true, 200, "Access token refreshed successfully"));
});

export const logout = asyncHandler(async (req, res) => {
    const user = req.user;

    const token = req.cookies?.refreshToken;
    if (token) {
        const hashedToken = hashToken(token);

        await RefreshToken.findOneAndUpdate(
            { token: hashedToken },
            { isRevoked: true }
        );
    }

    const cookieOptions = {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "strict",
    };

    return res
        .clearCookie("accessToken", { ...cookieOptions, path: "/" })
        .clearCookie("refreshToken", { ...cookieOptions, path: "/api/v1/auth/refresh" })
        .status(200)
        .json(new ApiResponse(true, 200, "Logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(true, 200, "Current user fetched successfully", req.user)
    );
});