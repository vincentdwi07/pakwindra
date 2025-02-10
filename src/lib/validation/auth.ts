import { z } from "zod"

export const registerSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z.string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
    role: z.enum(["EDUCATOR", "STUDENT"], {
        required_error: "Role is required",
    }),
})

export type RegisterInput = z.infer<typeof registerSchema>