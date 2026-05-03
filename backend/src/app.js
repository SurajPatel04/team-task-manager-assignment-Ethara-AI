import express from 'express';
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { ApiError } from "./utils/apiError.utils.js";
import cors from 'cors';

const app = express();

app.use(express.json({ limit: "12kb" }));
app.use(cookieParser());

const allowedOrigins =
    env.nodeEnv === "production"
        ? ["https://zorvynassignment-swwh.onrender.com"]
        : ["http://localhost:3000", "http://localhost:5173"];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Import routes
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";

// Use routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/task", taskRoutes);

app.use((req, res, next) => {
    const err = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
    next(err);
});

app.use(errorMiddleware);


export default app;
