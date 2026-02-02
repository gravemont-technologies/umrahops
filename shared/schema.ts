import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"), // draft, submitted, approved, rejected
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const travelers = sqliteTable("travelers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id").references(() => groups.id),
  passportNumber: text("passport_number").notNull(),
  name: text("name").notNull(),
  nationality: text("nationality").notNull(),
  dob: text("dob").notNull(), // ISO date string YYYY-MM-DD
  riskScore: integer("risk_score"),
  riskReason: text("risk_reason"),
  nusukId: text("nusuk_id"),
  nusukStatus: text("nusuk_status"), // pending, accepted, rejected
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const hotels = sqliteTable("hotels", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  city: text("city").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id").references(() => groups.id),
  hotelId: text("hotel_id").references(() => hotels.id),
  checkIn: text("check_in").notNull(), // ISO date string
  checkOut: text("check_out").notNull(), // ISO date string
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  entityType: text("entity_type").notNull(), // group, traveler, etc.
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // create, update, delete
  payload: text("payload", { mode: "json" }),
  prevHash: text("prev_hash"),
  hash: text("hash"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const jobsQueue = sqliteTable("jobs_queue", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull(), // nusuk_sync, message_send, etc.
  payload: text("payload", { mode: "json" }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  result: text("result", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const objectives = sqliteTable("objectives", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id").references(() => groups.id),
  title: text("title").notNull(),
  type: text("type").notNull().default("routine"), // critical, routine
  isCompleted: integer("is_completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// === RELATIONS ===
// (Skipping complex relations for now, can be added if needed for query helpers)

// === BASE SCHEMAS ===
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true });
export const insertTravelerSchema = createInsertSchema(travelers).omit({ id: true, createdAt: true });
export const insertHotelSchema = createInsertSchema(hotels).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobsQueue).omit({ id: true, createdAt: true, result: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type Traveler = typeof travelers.$inferSelect;
export type InsertTraveler = z.infer<typeof insertTravelerSchema>;

export type Hotel = typeof hotels.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Job = typeof jobsQueue.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Objective = typeof objectives.$inferSelect;

export const insertObjectiveSchema = createInsertSchema(objectives).omit({ id: true, createdAt: true });
export type InsertObjective = z.infer<typeof insertObjectiveSchema>;

// Request types
export type CreateGroupRequest = InsertGroup;
export type UpdateGroupRequest = Partial<InsertGroup>;

export type CreateTravelerRequest = InsertTraveler;
export type UpdateTravelerRequest = Partial<InsertTraveler>;
export type BulkCreateTravelersRequest = { travelers: InsertTraveler[] };

// Helper for frontend CSV import
export const csvImportSchema = z.object({
  passportNumber: z.string(),
  name: z.string(),
  nationality: z.string(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
});
export type CsvImportRow = z.infer<typeof csvImportSchema>;
