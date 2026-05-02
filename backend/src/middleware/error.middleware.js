import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.utils.js";

export const errorMiddleware = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        let statusCode = 500;
        let message = "Internal Server Error";

        if (err instanceof mongoose.Error.CastError) {
            statusCode = 400;
            message = `Invalid ${err.path}: ${err.value}`;
        } else if (err instanceof mongoose.Error.ValidationError) {
            statusCode = 400;
            message = Object.values(err.errors)
                .map((val) => val.message)
                .join(", ");
        } else if (err.code === 11000) {
            statusCode = 400;
            const field = Object.keys(err.keyValue).join(", ");
            message = `Duplicate value entered for ${field}`;
        } else if (err.name === "JsonWebTokenError") {
            statusCode = 401;
            message = "Invalid token";
        } else if (err.name === "TokenExpiredError") {
            statusCode = 401;
            message = "Token expired";
        }

        error = new ApiError(statusCode, message);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Something went wrong",
        ...(error.errors && error.errors.length > 0 && {
            errors: error.errors,
        }),
        ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
        }),
    });
};