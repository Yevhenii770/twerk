import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";
import { InferSelectModel, relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Calendar bookings table
export const calendarBookings = pgTable("calendar_bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(calendarBookings),
}));

export const bookingsRelations = relations(calendarBookings, ({ one }) => ({
  user: one(users, {
    fields: [calendarBookings.userId],
    references: [users.id],
  }),
}));

// Types
export type User = InferSelectModel<typeof users>;
export type CalendarBooking = InferSelectModel<typeof calendarBookings>;
