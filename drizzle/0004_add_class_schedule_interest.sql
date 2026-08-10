CREATE TABLE "class_schedule_interest" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_type" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
