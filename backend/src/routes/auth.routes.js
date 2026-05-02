import { singUp, signIn, refreshToken } from "../controllers/auth.controllers.js";
import { validate } from "../middleware/validate.middleware.js";
import { signUpValidation, loginValidation } from "../validation/auth.validation.js";
import { Router } from "express";

const router = Router();

router.post("/signup", validate(signUpValidation), singUp);
router.post("/signin", validate(loginValidation), signIn);
router.post("/refresh", refreshToken);

export default router;