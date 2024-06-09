import { z } from "zod";

export const AccountValidator = z.object({
  email: z.string().email(),
  userName: z.string().min(3).max(10),
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
});

export type AccountType = z.infer<typeof AccountValidator>;

export const SignInValidator = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export type SignInType = z.infer<typeof SignInValidator>;
