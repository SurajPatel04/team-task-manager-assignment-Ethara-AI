import express from 'express';
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { ApiError } from "./utils/apiError.utils.js";
import cors from 'cors';

const app = express();

app.use(express.json({ limit: "12kb" }));
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    env.frontendUrl,
    "https://team-task-manager-suraj-patel.netlify.app/"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        // allow localhost
        if (origin.includes("localhost")) {
            return callback(null, true);
        }

        // allow vercel + netlify + custom domain
        if (
            origin.endsWith(".vercel.app") ||
            origin.endsWith(".netlify.app") ||
            origin.endsWith(".surajpatel.dev")
        ) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

// Import routes
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import dashBoard from "./routes/dashboard.routes.js"

// Use routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/dashboard", dashBoard)


app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

app.use((req, res, next) => {
    const err = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
    next(err);
});

app.use(errorMiddleware);


export default app;
