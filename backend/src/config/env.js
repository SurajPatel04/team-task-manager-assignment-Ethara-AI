import dotenv from 'dotenv';
import ms from 'ms';
dotenv.config();

const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET'
]

requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
});

export const env = {
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI,

    nodeEnv: process.env.NODE_ENV || "development",

    frontendUrl: process.FRONTEND_URL,

    accessToken: {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "30m",
        expiresInMs: ms(process.env.ACCESS_TOKEN_EXPIRY || "30m"),
    },

    refreshToken: {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d",
        expiresInMs: ms(process.env.REFRESH_TOKEN_EXPIRY || "10d"),
    },

    rateLimit: {
        max: Number(process.env.RATE_LIMIT_MAX) || 10,
        windowMs: ms((process.env.RATE_LIMIT_WINDOW || "15m"))
    }
}
