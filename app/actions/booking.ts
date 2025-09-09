"use server";

import { db } from "@/db";
import { calendarBookings } from "@/db/schema";
import { getCurrentUser } from "@/lib/dal";
import { z } from "zod";
import { revalidateTag } from "next/cache";

const BookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
});

export type BookingData = z.infer<typeof BookingSchema>;

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
};

export const createBooking = async (
  data: BookingData
): Promise<ActionResponse> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized access",
        error: "Unauthorized",
      };
    }

    const validationResult = BookingSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    await db.insert(calendarBookings).values({
      userId: user.id,
      date: new Date(validatedData.date),
      name: validatedData.name,
      description: validatedData.description || null,
    });

    revalidateTag("reservations");

    return { success: true, message: "Reservation created successfully" };
  } catch (error) {
    console.error("Error creating reservation:", error);
    return {
      success: false,
      message: "An error occurred while creating the reservation",
      error: "Failed to create reservation",
    };
  }
};
