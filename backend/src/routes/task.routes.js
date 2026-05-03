import { Router } from "express";
import { authorizeProjectRole } from "../middleware/projectRole.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask, updateTaskStatus } from "../controllers/task.controllers.js";
import { validate } from "../middleware/validate.middleware.js";
import { createTaskValidation, updateTaskStatusValidation, updateTaskValidation } from "../validation/task.validation.js";

const router = Router();

router.post("/", authenticate, validate(createTaskValidation), authorizeProjectRole("admin"), createTask);
router.get("/", authenticate, authorizeProjectRole("admin", "member"), getAllTasks);
router.get("/:id", authenticate, authorizeProjectRole("admin", "member"), getTaskById);
router.put("/:id", authenticate, authorizeProjectRole("admin"), validate(updateTaskValidation), updateTask);
router.patch("/:id/status", authenticate, authorizeProjectRole('admin', 'member'), validate(updateTaskStatusValidation), updateTaskStatus);
router.delete("/:id", authenticate, authorizeProjectRole("admin"), deleteTask);

export default router;
