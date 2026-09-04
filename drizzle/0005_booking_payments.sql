-- New booking/payment system: class sessions, payments, contact messages,
-- plus additive (nullable) columns on the existing bookings table.
-- Purely additive: no existing columns/tables are dropped or altered destructively.

CREATE TABLE IF NOT EXISTS "class_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_type" text NOT NULL,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"price" integer NOT NULL,
	"capacity" integer NOT NULL,
	"booked" integer DEFAULT 0 NOT NULL,
	"booking_open" boolean DEFAULT true NOT NULL,
	"cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "class_sessions_slot_unique" UNIQUE("class_type","date","start_time")
);

CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'square' NOT NULL,
	"idempotency_key" text NOT NULL,
	"square_payment_id" text,
	"square_order_id" text,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "payments_square_payment_id_unique" UNIQUE("square_payment_id")
);

CREATE TABLE IF NOT EXISTS "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"inquiry_type" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "session_id" integer;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "first_name" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "last_name" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "payment_id" integer;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "amount_paid_cents" integer;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "hold_expires_at" timestamp;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "booking_group_id" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "management_token" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "attended" boolean;

DO $$ BEGIN
	ALTER TABLE "bookings" ADD CONSTRAINT "bookings_management_token_unique" UNIQUE("management_token");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
	ALTER TABLE "bookings" ADD CONSTRAINT "bookings_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
	ALTER TABLE "bookings" ADD CONSTRAINT "bookings_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
