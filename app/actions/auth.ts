"use server";

import { z } from "zod";
import {
  createSession,
  createUser,
  verifyPassword,
  deleteSession,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/lib/dal";

// Define Zod schema for signin validation
const SignInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Define Zod schema for signup validation
const SignUpSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpData = z.infer<typeof SignUpSchema>;

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
};

export async function signUp(formData: FormData): Promise<ActionResponse> {
  try {
    // Add a small delay to simulate network latency
    

    // Extract data from form
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate with Zod
    const validationResult = SignUpSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
        errors: {
          email: ["User with this email already exists"],
        },
      };
    }

    // Create new user
    const user = await createUser(data.email, data.password);
    if (!user) {
      return {
        success: false,
        message: "Failed to create user",
        error: "Failed to create user",
      };
    }

    // Create session for the newly registered user
    await createSession(user.id);

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      message: "An error occurred while creating your account",
      error: "Failed to create account",
    };
  }
}
export async function signIn(formData: FormData): Promise<ActionResponse> {
  try {
    // Add a small delay to simulate network latency
   

    // Extract data from form
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate with Zod
    const validationResult = SignInSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Find user by email
    const user = await getUserByEmail(data.email);
    if (!user) {
      await new Promise(r => setTimeout(r, 1500)); // slow down brute force
      return {
        success: false,
        message: "Invalid email or password",
        errors: { email: ["Invalid email or password"] },
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      await new Promise(r => setTimeout(r, 1500)); // slow down brute force
      return {
        success: false,
        message: "Invalid email or password",
        errors: { password: ["Invalid email or password"] },
      };
    }

    // Create session
    await createSession(user.id);

    // Telegram alert for admin logins
    if (user.role === "admin") {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (token && chatId) {
        const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🔐 Admin login\n${user.email}\n${now} PT`,
          }),
        }).catch(() => {});
      }
    }

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      message: "An error occurred while signing in",
      error: "Failed to sign in",
    };
  }
}
export async function changePassword(_: unknown, formData: FormData): Promise<ActionResponse> {
  const { getCurrentUser } = await import("@/lib/dal");
  const { hashPassword, verifyPassword } = await import("@/lib/auth");
  const { db } = await import("@/db");
  const { users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { success: false, message: "Unauthorized" };

  const current = formData.get("current") as string;
  const next = formData.get("next") as string;
  const confirm = formData.get("confirm") as string;

  if (!current || !next || !confirm) return { success: false, message: "All fields are required" };
  if (next.length < 6) return { success: false, message: "New password must be at least 6 characters" };
  if (next !== confirm) return { success: false, message: "Passwords don't match" };

  const fullUser = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  if (!fullUser) return { success: false, message: "User not found" };

  const valid = await verifyPassword(current, fullUser.password);
  if (!valid) return { success: false, message: "Current password is incorrect" };

  await db.update(users).set({ password: await hashPassword(next) }).where(eq(users.id, user.id));
  return { success: true, message: "Password changed successfully" };
}

export const signOut = async (): Promise<void> => {
  try {
    await deleteSession();
  } catch (error) {
    console.error("Sign out error:", error);
    throw new Error("Failed to sign out");
  } finally {
    redirect("/");
  }
};
