CREATE TABLE IF NOT EXISTS "groups" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "created_at" integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "travelers" (
  "id" text PRIMARY KEY NOT NULL,
  "group_id" text REFERENCES "groups" ("id"),
  "passport_number" text NOT NULL,
  "name" text NOT NULL,
  "nationality" text NOT NULL,
  "dob" text NOT NULL,
  "risk_score" integer,
  "risk_reason" text,
  "nusuk_id" text,
  "nusuk_status" text,
  "created_at" integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "hotels" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "city" text NOT NULL,
  "created_at" integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "bookings" (
  "id" text PRIMARY KEY NOT NULL,
  "group_id" text REFERENCES "groups" ("id"),
  "hotel_id" text REFERENCES "hotels" ("id"),
  "check_in" text NOT NULL,
  "check_out" text NOT NULL,
  "created_at" integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" text PRIMARY KEY NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "action" text NOT NULL,
  "payload" text,
  "prev_hash" text,
  "hash" text,
  "created_at" integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "jobs_queue" (
  "id" text PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "payload" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "result" text,
  "created_at" integer DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS "idx_travelers_group_id" ON "travelers" ("group_id");
CREATE INDEX IF NOT EXISTS "idx_jobs_status" ON "jobs_queue" ("status");
