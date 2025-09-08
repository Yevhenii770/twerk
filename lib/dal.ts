import { db } from "@/db";
// import { getSession } from "./auth";
import { eq } from "drizzle-orm";
// import { cache } from "react";
import { calendarBookings, users } from "@/db/schema";
// import { mockDelay } from "./utils";
// import { unstable_cacheTag as cacheTag } from "next/cache";
// import { ca } from "zod/locales";

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user;
  } catch (e) {
    console.error(e);
    return null;
  }
};
