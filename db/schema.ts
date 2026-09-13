import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  date,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const schedules = pgTable("schedules", {
  classType:   text("class_type").primaryKey(),
  dayOfWeek:   integer("day_of_week").notNull(),
  timeDisplay: text("time_display").notNull(),
  duration:    text("duration").notNull(),
  updatedAt:   timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// A single, concrete, bookable occurrence of a class (e.g. "Twerk, Fri Sep 4, 6-7pm").
// Auto-generated from `schedules` going forward; admin can edit/cancel individual dates.
export const classSessions = pgTable("class_sessions", {
  id:           serial("id").primaryKey(),
  classType:    text("class_type").notNull(), // twerk | highheels
  date:         date("date").notNull(),
  startTime:    text("start_time").notNull(), // "18:00" 24h
  endTime:      text("end_time").notNull(),   // "19:00" 24h
  price:        integer("price").notNull(),   // USD dollars, matches existing bookings.price
  capacity:     integer("capacity").notNull(),
  booked:       integer("booked").default(0).notNull(), // atomic counter, only paid/held seats
  bookingOpen:  boolean("booking_open").default(true).notNull(),
  cancelled:    boolean("cancelled").default(false).notNull(),
  createdAt:    timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:    timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => [unique("class_sessions_slot_unique").on(t.classType, t.date, t.startTime)]);

// A Square payment attempt/result. One row per payment; a booking (or a linked group of
// bookings for a monthly pass) references the payment that confirmed it.
export const payments = pgTable("payments", {
  id:               serial("id").primaryKey(),
  provider:         text("provider").default("square").notNull(),
  idempotencyKey:   text("idempotency_key").notNull().unique(),
  squarePaymentId:  text("square_payment_id").unique(),
  squareOrderId:    text("square_order_id"),
  amountCents:      integer("amount_cents").notNull(),
  currency:         text("currency").default("USD").notNull(),
  status:           text("status").default("pending").notNull(), // pending | completed | failed | refunded
  createdAt:        timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// "Contact us / found a problem" — the general-purpose lead form, no longer used for booking.
export const contactMessages = pgTable("contact_messages", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull(),
  email:     text("email").notNull(),
  phone:     text("phone"),
  inquiryType: text("inquiry_type"), // question | problem | other
  message:   text("message").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
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
  classType: text("class_type").notNull(), // twerk | highheels
  bookingType: text("booking_type").default("dropin").notNull(), // dropin | monthly
  date: date("date").notNull(),
  price: integer("price").notNull(),
  // pending (legacy, no payment) | pending_payment | paid | failed | cancelled | refunded
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),

  // --- New payment-gated booking flow (nullable: legacy rows predate these) ---
  sessionId:        integer("session_id").references(() => classSessions.id),
  firstName:        text("first_name"),
  lastName:         text("last_name"),
  notes:            text("notes"), // customer-provided note at checkout
  paymentId:        integer("payment_id").references(() => payments.id),
  amountPaidCents:  integer("amount_paid_cents"),
  holdExpiresAt:    timestamp("hold_expires_at", { mode: "date" }), // seat hold TTL while pending_payment
  bookingGroupId:   text("booking_group_id"), // links the 4 sessions of one monthly-pass purchase
  managementToken:  text("management_token").unique(), // secure token for the "Manage Booking" email link
  attended:         boolean("attended"),
});

// Leads from visitors who like a class but can't make its current scheduled time.
export const classScheduleInterest = pgTable("class_schedule_interest", {
  id: serial("id").primaryKey(),
  classType: text("class_type").notNull(), // twerk | highheels
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
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
export type ClassScheduleInterest = InferSelectModel<typeof classScheduleInterest>;
export type ClassSession = InferSelectModel<typeof classSessions>;
export type Payment = InferSelectModel<typeof payments>;
export type ContactMessage = InferSelectModel<typeof contactMessages>;
