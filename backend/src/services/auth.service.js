import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/refreshToken.models.js";
import { hashToken } from "../utils/hash.utils.js";


export const generateAccessToken = (user) => {
    const secret = env.accessToken.secret;
    const expiresIn = env.accessToken.expiresIn;
    if (!secret) {
        throw new Error("Access token secret is not defined in environment variables.");
    }
    const payload = { 
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, secret, { expiresIn });
}

export const generateRefreshToken = (user) => {
    const secret = env.refreshToken.secret;
    const expiresIn = env.refreshToken.expiresIn;
    if (!secret) {
        throw new Error("Refresh token secret is not defined in environment variables.");
    }

    const payload = {
        userId: user._id,
    }

    const options = {
        expiresIn,
    }

    return jwt.sign(payload, secret, options);
}

export const generateRefreshTokenAndStore = async (user, req) => {
    const refreshToken = generateRefreshToken(user);
    const expireAt = new Date(Date.now() + env.refreshToken.expiresInMs);

    const deviceInfo = req?.headers?.["user-agent"] || null;
    const ipAddress = req?.ip || null;

    const hashedToken = hashToken(refreshToken);
    
    // Revoke existing tokens for the same device
    await RefreshToken.updateMany(
        {
            userId: user._id,
            deviceInfo: deviceInfo,
        },
        {
            isRevoked: true,
        }
    );

    await RefreshToken.create({
        token: hashedToken,
        userId: user._id,
        expireAt: expireAt,
        deviceInfo,
        ipAddress,
    });

    return refreshToken;

}

export const generateAuthTokens = async (user, req) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshTokenAndStore(user, req);
    return { accessToken, refreshToken };
}