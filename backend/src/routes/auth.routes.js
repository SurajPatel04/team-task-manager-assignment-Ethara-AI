import { singUp, signIn, refreshToken, logout, getCurrentUser } from "../controllers/auth.controllers.js";
import { validate } from "../middleware/validate.middleware.js";
import { signUpValidation, loginValidation } from "../validation/auth.validation.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", validate(signUpValidation), singUp);
router.post("/signin", validate(loginValidation), signIn);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);

export default router;