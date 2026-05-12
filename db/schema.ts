import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

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

export type User = InferSelectModel<typeof users>;
export type Booking = InferSelectModel<typeof bookings>;
