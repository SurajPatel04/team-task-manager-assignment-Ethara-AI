import z from "zod";

export const signUpValidation = z.object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.email("Invalid email address").trim().toLowerCase(),
    password: z.string()
        .min(6, "Password must be at least 6 characters long")  
        .regex(/[A-Z]/, "Must include uppercase")
        .regex(/[0-9]/, "Must include number"),
});


export const loginValidation = z.object({
    email: z.email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});