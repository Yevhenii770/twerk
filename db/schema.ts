import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const schedules = pgTable("schedules", {
  classType:   text("class_type").primaryKey(),
  dayOfWeek:   integer("day_of_week").notNull(),
  timeDisplay: text("time_display").notNull(),
  duration:    text("duration").notNull(),
  updatedAt:   timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type Schedule = InferSelectModel<typeof schedules>;

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  classType: text("class_type").notNull(), // twerk | highheels | stretching
  bookingType: text("booking_type").default("dropin").notNull(), // dropin | monthly
  date: date("date").notNull(),
  price: integer("price").notNull(),
  status: text("status").default("pending").notNull(), // pending | confirmed | paid | cancelled
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const classSettings = pgTable("class_settings", {
  classType:     text("class_type").primaryKey(),
  photoPosition: text("photo_position").default("50% 50%").notNull(),
  photoUrl:      text("photo_url"),
  desc:          text("desc"),
  modalTexts:    text("modal_texts"), // JSON array
  updatedAt:     timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type ClassSettings = InferSelectModel<typeof classSettings>;
export type User = InferSelectModel<typeof users>;
export type Booking = InferSelectModel<typeof bookings>;
