var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  bookings: () => bookings,
  boosts: () => boosts,
  chatRules: () => chatRules,
  csvImportSchema: () => csvImportSchema,
  groups: () => groups,
  hotels: () => hotels,
  insertBookingSchema: () => insertBookingSchema,
  insertBoostSchema: () => insertBoostSchema,
  insertChatRuleSchema: () => insertChatRuleSchema,
  insertGroupSchema: () => insertGroupSchema,
  insertHotelSchema: () => insertHotelSchema,
  insertJobSchema: () => insertJobSchema,
  insertMessageTemplateSchema: () => insertMessageTemplateSchema,
  insertObjectiveSchema: () => insertObjectiveSchema,
  insertTodoSchema: () => insertTodoSchema,
  insertTravelerSchema: () => insertTravelerSchema,
  jobsQueue: () => jobsQueue,
  messageTemplates: () => messageTemplates,
  objectives: () => objectives,
  todos: () => todos,
  travelers: () => travelers
});
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
var groups, travelers, hotels, bookings, auditLogs, jobsQueue, todos, objectives, messageTemplates, boosts, chatRules, insertGroupSchema, insertTravelerSchema, insertHotelSchema, insertBookingSchema, insertJobSchema, insertTodoSchema, insertMessageTemplateSchema, insertBoostSchema, insertChatRuleSchema, insertObjectiveSchema, csvImportSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    groups = sqliteTable("groups", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: text("name").notNull(),
      status: text("status").notNull().default("draft"),
      // draft, submitted, approved, rejected
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    travelers = sqliteTable("travelers", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      groupId: text("group_id").references(() => groups.id),
      passportNumber: text("passport_number").notNull(),
      name: text("name").notNull(),
      nationality: text("nationality").notNull(),
      dob: text("dob").notNull(),
      // ISO date string YYYY-MM-DD
      riskScore: integer("risk_score"),
      riskReason: text("risk_reason"),
      nusukId: text("nusuk_id"),
      nusukStatus: text("nusuk_status"),
      // pending, accepted, rejected
      overlay: text("overlay", { mode: "json" }).default("{}"),
      // For draggable profile card
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    hotels = sqliteTable("hotels", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: text("name").notNull(),
      city: text("city").notNull(),
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    bookings = sqliteTable("bookings", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      groupId: text("group_id").references(() => groups.id),
      hotelId: text("hotel_id").references(() => hotels.id),
      checkIn: text("check_in").notNull(),
      // ISO date string
      checkOut: text("check_out").notNull(),
      // ISO date string
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    auditLogs = sqliteTable("audit_logs", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      entityType: text("entity_type").notNull(),
      // group, traveler, etc.
      entityId: text("entity_id").notNull(),
      action: text("action").notNull(),
      // create, update, delete
      payload: text("payload", { mode: "json" }),
      prevHash: text("prev_hash"),
      hash: text("hash"),
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    jobsQueue = sqliteTable("jobs_queue", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      type: text("type").notNull(),
      // nusuk_sync, message_send, etc.
      payload: text("payload", { mode: "json" }).notNull(),
      status: text("status").notNull().default("pending"),
      // pending, processing, completed, failed
      result: text("result", { mode: "json" }),
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    todos = sqliteTable("todos", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      groupId: text("group_id").references(() => groups.id),
      travelerId: text("traveler_id").references(() => travelers.id),
      hotelId: text("hotel_id").references(() => hotels.id),
      bookingId: text("booking_id").references(() => bookings.id),
      title: text("title").notNull(),
      description: text("description"),
      source: text("source").notNull().default("system"),
      // system | user
      status: text("status").notNull().default("open"),
      // open | in_progress | done | archived
      urgency: text("urgency").notNull().default("medium"),
      // low | medium | high
      urgencyScore: integer("urgency_score"),
      // 0-100 logic
      dueAt: integer("due_at", { mode: "timestamp" }),
      assignedTo: text("assigned_to"),
      // User UUID
      metadata: text("metadata", { mode: "json" }).default("{}"),
      // Backward compatibility fields for current UI
      isCompleted: integer("is_completed", { mode: "boolean" }).notNull().default(false),
      type: text("type").notNull().default("routine"),
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    objectives = todos;
    messageTemplates = sqliteTable("message_templates", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: text("name").notNull().unique(),
      description: text("description"),
      channel: text("channel").notNull().default("whatsapp"),
      templateText: text("template_text").notNull(),
      variables: text("variables", { mode: "json" }),
      // stored as JSON array ["name", "date"]
      stage: text("stage"),
      escalationLevel: integer("escalation_level").default(0),
      isActive: integer("is_active", { mode: "boolean" }).default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    boosts = sqliteTable("boosts", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      title: text("title").notNull(),
      shortDesc: text("short_desc"),
      content: text("content"),
      // Markdown
      category: text("category"),
      isActive: integer("is_active", { mode: "boolean" }).default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    chatRules = sqliteTable("chat_rules", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      triggerPattern: text("trigger_pattern").notNull(),
      intent: text("intent"),
      responseText: text("response_text"),
      templateId: text("template_id").references(() => messageTemplates.id),
      action: text("action", { mode: "json" }),
      priority: integer("priority").default(100),
      enabled: integer("enabled", { mode: "boolean" }).default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    insertGroupSchema = createInsertSchema(groups);
    insertTravelerSchema = createInsertSchema(travelers);
    insertHotelSchema = createInsertSchema(hotels);
    insertBookingSchema = createInsertSchema(bookings);
    insertJobSchema = createInsertSchema(jobsQueue);
    insertTodoSchema = createInsertSchema(todos);
    insertMessageTemplateSchema = createInsertSchema(messageTemplates);
    insertBoostSchema = createInsertSchema(boosts);
    insertChatRuleSchema = createInsertSchema(chatRules);
    insertObjectiveSchema = insertTodoSchema;
    csvImportSchema = z.object({
      passportNumber: z.string(),
      name: z.string(),
      nationality: z.string(),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    });
  }
});

// server/db.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
var dataDir, sqlitePath, sqlite, db;
var init_db = __esm({
  "server/db.ts"() {
    init_schema();
    dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    sqlitePath = process.env.SQLITE_PATH || path.join(dataDir, "umrahops.db");
    sqlite = new Database(sqlitePath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("synchronous = NORMAL");
    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("busy_timeout = 30000");
    db = drizzle(sqlite, { schema: schema_exports });
  }
});

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var SQLiteStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    init_db();
    init_schema();
    SQLiteStorage = class {
      // Groups
      async getGroups() {
        return await db.select().from(groups).orderBy(desc(groups.createdAt));
      }
      async getGroup(id) {
        const [group] = await db.select().from(groups).where(eq(groups.id, id));
        return group;
      }
      async createGroup(insertGroup) {
        const [group] = await db.insert(groups).values(insertGroup).returning();
        return group;
      }
      async updateGroup(id, updates) {
        const [group] = await db.update(groups).set(updates).where(eq(groups.id, id)).returning();
        return group;
      }
      async deleteGroup(id) {
        await db.delete(groups).where(eq(groups.id, id));
      }
      // Travelers
      async getTravelers(groupId) {
        return await db.select().from(travelers).where(eq(travelers.groupId, groupId));
      }
      async createTraveler(insertTraveler) {
        const [traveler] = await db.insert(travelers).values(insertTraveler).returning();
        return traveler;
      }
      async bulkCreateTravelers(insertTravelers) {
        if (insertTravelers.length === 0) return [];
        return await db.insert(travelers).values(insertTravelers).returning();
      }
      async updateTraveler(id, updates) {
        const [traveler] = await db.update(travelers).set(updates).where(eq(travelers.id, id)).returning();
        return traveler;
      }
      // Hotels
      async getHotels() {
        return await db.select().from(hotels).orderBy(desc(hotels.createdAt));
      }
      async createHotel(insertHotel) {
        const [hotel] = await db.insert(hotels).values(insertHotel).returning();
        return hotel;
      }
      // Bookings
      async getBookings(groupId) {
        return await db.select().from(bookings).where(eq(bookings.groupId, groupId));
      }
      async createBooking(insertBooking) {
        const [booking] = await db.insert(bookings).values(insertBooking).returning();
        return booking;
      }
      // Jobs
      async getJobs() {
        return await db.select().from(jobsQueue).orderBy(desc(jobsQueue.createdAt));
      }
      async enqueueJob(insertJob) {
        const [job] = await db.insert(jobsQueue).values(insertJob).returning();
        return job;
      }
      // Objectives (Executive TODOs)
      async getObjectives(groupId) {
        if (groupId) {
          return await db.select().from(objectives).where(eq(objectives.groupId, groupId));
        }
        return await db.select().from(objectives);
      }
      async createObjective(insertObjective) {
        const [objective] = await db.insert(objectives).values(insertObjective).returning();
        return objective;
      }
      async updateObjective(id, completed) {
        const [objective] = await db.update(objectives).set({ isCompleted: completed }).where(eq(objectives.id, id)).returning();
        return objective;
      }
      // Audit with chain integrity
      async getAuditLogs() {
        return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
      }
      async getLatestAuditLog() {
        const [latest] = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(1);
        return latest || null;
      }
      async createAuditLog(insertLog) {
        const crypto3 = await import("crypto");
        const prevLog = await this.getLatestAuditLog();
        const prevHash = prevLog?.hash || "GENESIS";
        const payloadStr = JSON.stringify(insertLog.payload || {});
        const payloadHash = crypto3.createHash("sha256").update(payloadStr).digest("hex");
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const chainData = `${prevHash}:${payloadHash}:${timestamp}`;
        const hash = crypto3.createHash("sha256").update(chainData).digest("hex");
        const logWithChain = {
          ...insertLog,
          payloadHash,
          prevHash,
          hash,
          createdAt: insertLog.createdAt || /* @__PURE__ */ new Date()
        };
        const [log2] = await db.insert(auditLogs).values(logWithChain).returning();
        return log2;
      }
      // Verify audit chain integrity
      async verifyAuditChain() {
        const crypto3 = await import("crypto");
        const logs = await db.select().from(auditLogs).orderBy(auditLogs.createdAt);
        let expectedPrevHash = "GENESIS";
        for (const log2 of logs) {
          if (log2.prevHash !== expectedPrevHash) {
            return { valid: false, brokenAt: log2.id };
          }
          expectedPrevHash = log2.hash || "";
        }
        return { valid: true };
      }
    };
    storage = new SQLiteStorage();
  }
});

// server/services/messageService.ts
var messageService_exports = {};
__export(messageService_exports, {
  MessageService: () => MessageService,
  messageService: () => messageService
});
var MessageService, messageService;
var init_messageService = __esm({
  "server/services/messageService.ts"() {
    init_storage();
    MessageService = class {
      generateWhatsAppLink(phone, text2) {
        return `https://wa.me/${phone}?text=${encodeURIComponent(text2)}`;
      }
      async markAsSent(travelerId, type) {
        console.log(`MessageService: Marked ${type} as sent to ${travelerId}`);
        await storage.createAuditLog({
          entityType: "traveler",
          entityId: travelerId,
          action: "message_sent",
          payload: { type },
          createdAt: /* @__PURE__ */ new Date()
        });
      }
    };
    messageService = new MessageService();
  }
});

// server/services/aiService.ts
var aiService_exports = {};
__export(aiService_exports, {
  AIService: () => AIService,
  aiService: () => aiService
});
import crypto2 from "crypto";
import fs2 from "fs";
import path2 from "path";
var AIService, aiService;
var init_aiService = __esm({
  "server/services/aiService.ts"() {
    AIService = class {
      apiKey;
      model;
      maxBatchSize;
      cacheDir;
      cache;
      cacheTTL = 24 * 60 * 60 * 1e3;
      // 24 hours
      constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
        this.maxBatchSize = parseInt(process.env.OPENAI_MAX_BATCH_SIZE || "50");
        this.cacheDir = path2.join(process.cwd(), "ai", "cache");
        this.cache = /* @__PURE__ */ new Map();
        if (!fs2.existsSync(this.cacheDir)) {
          fs2.mkdirSync(this.cacheDir, { recursive: true });
        }
        this.loadCache();
      }
      /**
       * Load cache from disk
       */
      loadCache() {
        const cacheFile = path2.join(this.cacheDir, "risk_cache.json");
        if (fs2.existsSync(cacheFile)) {
          try {
            const data = JSON.parse(fs2.readFileSync(cacheFile, "utf-8"));
            this.cache = new Map(Object.entries(data));
          } catch (error) {
            console.warn("Failed to load AI cache:", error);
          }
        }
      }
      /**
       * Save cache to disk
       */
      saveCache() {
        const cacheFile = path2.join(this.cacheDir, "risk_cache.json");
        const data = Object.fromEntries(this.cache);
        try {
          fs2.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
        } catch (error) {
          console.warn("Failed to save AI cache:", error);
        }
      }
      /**
       * Generate fingerprint for caching (from hashed features only)
       */
      generateFingerprint(features) {
        const str = `${features.passportHash}:${features.ageRange}:${features.missingFieldsCount}:${features.nationalityRiskLevel || ""}`;
        return crypto2.createHash("sha256").update(str).digest("hex").substring(0, 16);
      }
      /**
       * Get from cache if valid
       */
      getFromCache(fingerprint) {
        const cached = this.cache.get(fingerprint);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
          return cached;
        }
        return null;
      }
      /**
       * Assess risk for a single traveler (mock or real)
       */
      async assessRisk(features) {
        const fingerprint = this.generateFingerprint(features);
        const cached = this.getFromCache(fingerprint);
        if (cached) {
          console.log(`\u2705 Cache hit for traveler ${features.id}`);
          return {
            travelerId: features.id,
            riskScore: cached.riskScore,
            riskReason: cached.riskReason
          };
        }
        if (!this.apiKey) {
          return this.mockAssessment(features);
        }
        try {
          const result = await this.callOpenAI([features]);
          const assessment = result[0];
          this.cache.set(fingerprint, {
            riskScore: assessment.riskScore,
            riskReason: assessment.riskReason,
            timestamp: Date.now()
          });
          this.saveCache();
          return assessment;
        } catch (error) {
          console.error(`\u274C OpenAI error for traveler ${features.id}:`, error.message);
          return this.mockAssessment(features);
        }
      }
      /**
       * Batch assess risk for multiple travelers (efficient)
       */
      async assessBatch(featuresList) {
        if (!this.apiKey) {
          console.log("\u26A0\uFE0F  Running in MOCK MODE (no OpenAI key)");
          return featuresList.map((f) => this.mockAssessment(f));
        }
        const batches = [];
        for (let i = 0; i < featuresList.length; i += this.maxBatchSize) {
          batches.push(featuresList.slice(i, i + this.maxBatchSize));
        }
        const results = [];
        for (const batch of batches) {
          const uncached = [];
          const cachedResults = [];
          for (const features of batch) {
            const fingerprint = this.generateFingerprint(features);
            const cached = this.getFromCache(fingerprint);
            if (cached) {
              cachedResults.push({
                travelerId: features.id,
                riskScore: cached.riskScore,
                riskReason: cached.riskReason
              });
            } else {
              uncached.push(features);
            }
          }
          console.log(`\u{1F4E6} Batch: ${cachedResults.length} cached, ${uncached.length} new calls`);
          if (uncached.length > 0) {
            try {
              const batchResults = await this.callOpenAI(uncached);
              for (let i = 0; i < uncached.length; i++) {
                const fingerprint = this.generateFingerprint(uncached[i]);
                this.cache.set(fingerprint, {
                  riskScore: batchResults[i].riskScore,
                  riskReason: batchResults[i].riskReason,
                  timestamp: Date.now()
                });
              }
              this.saveCache();
              results.push(...batchResults);
            } catch (error) {
              console.error("\u274C Batch API call failed:", error.message);
              results.push(...uncached.map((f) => this.mockAssessment(f)));
            }
          }
          results.push(...cachedResults);
        }
        return results;
      }
      /**
       * Call OpenAI API with retry logic
       */
      async callOpenAI(featuresList, retries = 3) {
        const prompt = this.buildPrompt(featuresList);
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: this.model,
              messages: [
                { role: "system", content: "You are a risk assessment AI for Umrah travel operations. Analyze traveler features and return risk scores (0-100) with brief reasons. NEVER request or expect raw passport numbers or PII." },
                { role: "user", content: prompt }
              ],
              temperature: 0.3,
              max_tokens: 500
            })
          });
          if (response.status === 429) {
            if (retries > 0) {
              const retryAfter = parseInt(response.headers.get("retry-after") || "5");
              console.warn(`\u26A0\uFE0F  Rate limit hit. Retrying in ${retryAfter}s...`);
              await new Promise((resolve) => setTimeout(resolve, retryAfter * 1e3));
              return this.callOpenAI(featuresList, retries - 1);
            } else {
              throw new Error("Rate limit exceeded, max retries");
            }
          }
          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          return this.parseOpenAIResponse(data.choices[0].message.content, featuresList);
        } catch (error) {
          if (retries > 0 && (error.code === "ECONNRESET" || error.code === "ETIMEDOUT")) {
            console.warn(`\u26A0\uFE0F  Network error. Retrying... (${retries} left)`);
            await new Promise((resolve) => setTimeout(resolve, 2e3));
            return this.callOpenAI(featuresList, retries - 1);
          }
          throw error;
        }
      }
      /**
       * Build prompt for OpenAI (PII-safe)
       */
      buildPrompt(featuresList) {
        const entries = featuresList.map(
          (f, i) => `Traveler ${i + 1}: Age ${f.ageRange}, Missing fields: ${f.missingFieldsCount}, Passport hash: ${f.passportHash.substring(0, 8)}...`
        ).join("\n");
        return `Assess risk for the following Umrah travelers based on anonymized features. Return JSON array with riskScore (0-100) and riskReason for each:

${entries}

Format: [{"riskScore": 0-100, "riskReason": "brief explanation"}]`;
      }
      /**
       * Parse OpenAI JSON response
       */
      parseOpenAIResponse(content, featuresList) {
        try {
          const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || content.match(/(\[[\s\S]*?\])/);
          const jsonStr = jsonMatch ? jsonMatch[1] : content;
          const parsed = JSON.parse(jsonStr);
          return featuresList.map((f, i) => ({
            travelerId: f.id,
            riskScore: parsed[i]?.riskScore || 0,
            riskReason: parsed[i]?.riskReason || "Unknown"
          }));
        } catch (error) {
          console.error("Failed to parse OpenAI response:", error);
          return featuresList.map((f) => this.mockAssessment(f));
        }
      }
      /**
       * Mock assessment (deterministic, no API)
       */
      mockAssessment(features) {
        let score = 10;
        const reasons = [];
        if (features.ageRange.includes("70") || features.ageRange.includes("80")) {
          score += 30;
          reasons.push("Senior age group");
        }
        if (features.missingFieldsCount > 3) {
          score += 40;
          reasons.push(`${features.missingFieldsCount} missing fields`);
        } else if (features.missingFieldsCount > 0) {
          score += 15;
          reasons.push(`${features.missingFieldsCount} missing fields`);
        }
        if (features.nationalityRiskLevel === "high") {
          score += 25;
          reasons.push("High-risk nationality profile");
        }
        const riskReason = reasons.length > 0 ? `Mock: ${reasons.join(", ")}` : "Mock: Low risk profile";
        return {
          travelerId: features.id,
          riskScore: Math.min(score, 100),
          riskReason
        };
      }
    };
    aiService = new AIService();
  }
});

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path4 from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __dirname, vite_config_default;
var init_vite_config = __esm({
  "vite.config.js"() {
    __dirname = path4.dirname(fileURLToPath(import.meta.url));
    vite_config_default = defineConfig({
      plugins: [react(), runtimeErrorOverlay()],
      resolve: {
        alias: {
          "@": path4.resolve(__dirname, "client", "src"),
          "@shared": path4.resolve(__dirname, "shared"),
          "@assets": path4.resolve(__dirname, "attached_assets")
        }
      },
      root: path4.resolve(__dirname, "client"),
      build: {
        outDir: path4.resolve(__dirname, "dist/public"),
        emptyOutDir: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ["react", "react-dom", "wouter"],
              ui: ["@radix-ui/react-dialog", "@radix-ui/react-popover", "lucide-react", "framer-motion"]
            }
          }
        }
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  setupVite: () => setupVite
});
import { createServer as createViteServer, createLogger } from "vite";
import fs4 from "fs";
import path5 from "path";
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath2 } from "url";
async function setupVite(server, app2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs4.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
var __dirname2, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    init_vite_config();
    __dirname2 = path5.dirname(fileURLToPath2(import.meta.url));
    viteLogger = createLogger();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();

// shared/routes.ts
init_schema();
import { z as z2 } from "zod";
var errorSchemas = {
  validation: z2.object({
    message: z2.string(),
    field: z2.string().optional()
  }),
  notFound: z2.object({
    message: z2.string()
  }),
  internal: z2.object({
    message: z2.string()
  })
};
var api = {
  groups: {
    list: {
      method: "GET",
      path: "/api/groups",
      responses: {
        200: z2.array(z2.custom())
      }
    },
    get: {
      method: "GET",
      path: "/api/groups/:id",
      responses: {
        200: z2.custom(),
        404: errorSchemas.notFound
      }
    },
    create: {
      method: "POST",
      path: "/api/groups",
      input: insertGroupSchema,
      responses: {
        201: z2.custom(),
        400: errorSchemas.validation
      }
    },
    update: {
      method: "PUT",
      path: "/api/groups/:id",
      input: insertGroupSchema.partial(),
      responses: {
        200: z2.custom(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound
      }
    }
  },
  travelers: {
    list: {
      method: "GET",
      path: "/api/groups/:groupId/travelers",
      responses: {
        200: z2.array(z2.custom())
      }
    },
    create: {
      method: "POST",
      path: "/api/travelers",
      input: insertTravelerSchema,
      responses: {
        201: z2.custom(),
        400: errorSchemas.validation
      }
    },
    bulkCreate: {
      method: "POST",
      path: "/api/travelers/bulk",
      input: z2.object({
        travelers: z2.array(insertTravelerSchema)
      }),
      responses: {
        201: z2.array(z2.custom()),
        400: errorSchemas.validation
      }
    },
    update: {
      method: "PUT",
      path: "/api/travelers/:id",
      input: insertTravelerSchema.partial(),
      responses: {
        200: z2.custom(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound
      }
    }
  },
  jobs: {
    list: {
      method: "GET",
      path: "/api/jobs",
      responses: {
        200: z2.array(z2.custom())
      }
    },
    create: {
      method: "POST",
      path: "/api/jobs",
      input: insertJobSchema,
      responses: {
        201: z2.custom(),
        400: errorSchemas.validation
      }
    }
  },
  audit: {
    list: {
      method: "GET",
      path: "/api/audit-logs",
      responses: {
        200: z2.array(z2.custom())
      }
    }
  }
};

// server/routes.ts
import { z as z3 } from "zod";
async function registerRoutes(httpServer2, app2) {
  app2.get(api.groups.list.path, async (req, res) => {
    const groups3 = await storage.getGroups();
    res.json(groups3);
  });
  app2.get(api.groups.get.path, async (req, res) => {
    const group = await storage.getGroup(String(req.params.id));
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  });
  app2.post(api.groups.create.path, async (req, res) => {
    try {
      const input = api.groups.create.input.parse(req.body);
      const group = await storage.createGroup(input);
      await storage.createAuditLog({
        entityType: "group",
        entityId: group.id,
        action: "create",
        payload: { name: group.name },
        createdAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(group);
    } catch (err) {
      if (err instanceof z3.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app2.delete("/api/groups/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const group = await storage.getGroup(id);
      if (!group) return res.status(404).json({ message: "Group not found" });
      await storage.deleteGroup(id);
      await storage.createAuditLog({
        entityType: "group",
        entityId: id,
        action: "delete",
        payload: { name: group.name },
        createdAt: /* @__PURE__ */ new Date()
      });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get(api.travelers.list.path, async (req, res) => {
    const travelers3 = await storage.getTravelers(String(req.params.groupId));
    res.json(travelers3);
  });
  app2.post(api.travelers.create.path, async (req, res) => {
    try {
      const input = api.travelers.create.input.parse(req.body);
      const traveler = await storage.createTraveler(input);
      res.status(201).json(traveler);
    } catch (err) {
      if (err instanceof z3.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app2.post(api.travelers.bulkCreate.path, async (req, res) => {
    try {
      const input = api.travelers.bulkCreate.input.parse(req.body);
      const travelers3 = await storage.bulkCreateTravelers(input.travelers);
      if (travelers3.length > 0) {
        await storage.createAuditLog({
          entityType: "group",
          entityId: travelers3[0].groupId || "unknown",
          action: "bulk_create_travelers",
          payload: { count: travelers3.length },
          createdAt: /* @__PURE__ */ new Date()
        });
      }
      res.status(201).json(travelers3);
    } catch (err) {
      if (err instanceof z3.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app2.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });
  app2.post(api.jobs.create.path, async (req, res) => {
    try {
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.enqueueJob(input);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z3.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app2.get("/api/stats", async (req, res) => {
    try {
      const groups3 = await storage.getGroups();
      const jobs = await storage.getJobs();
      let totalTravelers = 0;
      for (const group of groups3) {
        const travelers3 = await storage.getTravelers(group.id);
        totalTravelers += travelers3.length;
      }
      const pendingJobs = jobs.filter((j) => j.status === "pending" || j.status === "processing").length;
      const completedJobs = jobs.filter((j) => j.status === "completed").length;
      const failedJobs = jobs.filter((j) => j.status === "failed").length;
      res.json({
        groups: groups3.length,
        travelers: totalTravelers,
        pendingJobs,
        completedJobs,
        failedJobs,
        successRate: completedJobs > 0 ? Math.round(completedJobs / (completedJobs + failedJobs) * 100) : 100
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get("/api/objectives", async (req, res) => {
    try {
      const groupId = req.query.groupId;
      const objectives2 = await storage.getObjectives(groupId);
      res.json(objectives2);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/objectives", async (req, res) => {
    try {
      const objective = await storage.createObjective(req.body);
      res.status(201).json(objective);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  app2.patch("/api/objectives/:id", async (req, res) => {
    try {
      const { isCompleted } = req.body;
      const objective = await storage.updateObjective(req.params.id, isCompleted);
      res.json(objective);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  app2.get("/api/hotels", async (req, res) => {
    const hotels2 = await storage.getHotels();
    res.json(hotels2);
  });
  app2.post("/api/hotels", async (req, res) => {
    try {
      const hotel = await storage.createHotel(req.body);
      res.status(201).json(hotel);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  app2.get("/api/groups/:groupId/bookings", async (req, res) => {
    const bookings2 = await storage.getBookings(String(req.params.groupId));
    res.json(bookings2);
  });
  app2.post("/api/groups/:groupId/bookings", async (req, res) => {
    try {
      const booking = await storage.createBooking({
        ...req.body,
        groupId: String(req.params.groupId)
      });
      res.status(201).json(booking);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  app2.post("/api/messages/send", async (req, res) => {
    try {
      const { travelerId, phone, template } = req.body;
      const templates = {
        confirmation: "Your Umrah booking is confirmed! Group ID: {{groupId}}. Please prepare your documents.",
        reminder: "Reminder: Your departure is in 7 days. Ensure passport and visa are ready.",
        update: "Important update regarding your Umrah trip. Please check your email for details."
      };
      const message = templates[template] || templates.confirmation;
      const { messageService: messageService2 } = await Promise.resolve().then(() => (init_messageService(), messageService_exports));
      const link = messageService2.generateWhatsAppLink(phone, message);
      await messageService2.markAsSent(travelerId, template);
      res.json({ success: true, whatsappLink: link });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app2.get(api.audit.list.path, async (req, res) => {
    const logs = await storage.getAuditLogs();
    res.json(logs);
  });
  app2.post("/api/groups/:groupId/risk-scan", async (req, res) => {
    try {
      const { groupId } = req.params;
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      const travelers3 = await storage.getTravelers(groupId);
      if (travelers3.length === 0) {
        return res.status(400).json({ message: "No travelers to scan" });
      }
      const { aiService: aiService2 } = await Promise.resolve().then(() => (init_aiService(), aiService_exports));
      const crypto3 = await import("crypto");
      const featuresList = travelers3.map((t) => ({
        id: t.id,
        passportHash: crypto3.createHash("sha256").update(t.passportNumber || "").digest("hex"),
        ageRange: calculateAgeRange(t.dob),
        missingFieldsCount: countMissingFields(t),
        nationalityRiskLevel: void 0
      }));
      const results = await aiService2.assessBatch(featuresList);
      for (const result of results) {
        await storage.updateTraveler(result.travelerId, {
          riskScore: result.riskScore,
          riskReason: result.riskReason
        });
      }
      await storage.createAuditLog({
        entityType: "group",
        entityId: groupId,
        action: "risk_scan",
        payload: {
          travelersScanned: travelers3.length,
          avgRiskScore: Math.round(results.reduce((acc, r) => acc + r.riskScore, 0) / results.length)
        },
        createdAt: /* @__PURE__ */ new Date()
      });
      res.json({
        success: true,
        scanned: travelers3.length,
        results: results.map((r) => ({ id: r.travelerId, score: r.riskScore }))
      });
    } catch (err) {
      console.error("Risk scan error:", err);
      res.status(500).json({ message: err.message || "Risk scan failed" });
    }
  });
  app2.post("/api/groups/:groupId/nusuk-submit", async (req, res) => {
    try {
      const groupId = String(req.params.groupId);
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      const travelers3 = await storage.getTravelers(groupId);
      if (travelers3.length === 0) {
        return res.status(400).json({ message: "No travelers to submit" });
      }
      const job = await storage.enqueueJob({
        type: "nusuk_sync",
        payload: { groupId, travelerCount: travelers3.length },
        status: "pending"
      });
      await storage.createAuditLog({
        entityType: "group",
        entityId: groupId,
        action: "nusuk_submit",
        payload: { jobId: job.id, travelerCount: travelers3.length },
        createdAt: /* @__PURE__ */ new Date()
      });
      await storage.updateGroup(groupId, { status: "submitted" });
      res.json({
        success: true,
        message: "NUSUK job queued for processing",
        jobId: job.id,
        travelers: travelers3.length
      });
    } catch (err) {
      console.error("NUSUK submit error:", err);
      res.status(500).json({ message: err.message || "NUSUK submit failed" });
    }
  });
  app2.get("/api/audit/verify", async (req, res) => {
    try {
      const result = await storage.verifyAuditChain();
      res.json(result);
    } catch (err) {
      res.status(500).json({ valid: false, error: err.message });
    }
  });
  return httpServer2;
}
function calculateAgeRange(dob) {
  if (!dob) return "unknown";
  const birthYear = new Date(dob).getFullYear();
  const age = (/* @__PURE__ */ new Date()).getFullYear() - birthYear;
  const decade = Math.floor(age / 10) * 10;
  return `${decade}-${decade + 10}`;
}
function countMissingFields(traveler) {
  let count = 0;
  if (!traveler.passportNumber) count++;
  if (!traveler.name) count++;
  if (!traveler.nationality) count++;
  if (!traveler.dob) count++;
  return count;
}
async function seedDatabase() {
  const groups3 = await storage.getGroups();
  if (groups3.length === 0) {
    const group = await storage.createGroup({
      name: "Demo Umrah Group 2026",
      status: "draft"
    });
    await storage.createTraveler({
      groupId: group.id,
      name: "Ahmed Al-Farsi",
      passportNumber: "A12345678",
      nationality: "Saudi Arabia",
      dob: "1980-01-01",
      riskScore: 10,
      riskReason: "Low risk"
    });
    await storage.createTraveler({
      groupId: group.id,
      name: "Fatima Al-Zahra",
      passportNumber: "B87654321",
      nationality: "UAE",
      dob: "1985-05-15",
      riskScore: 85,
      riskReason: "Visa expiring soon"
    });
  }
}

// server/static.ts
import express from "express";
import fs3 from "fs";
import path3 from "path";
function serveStatic(app2) {
  const distPath = path3.resolve(process.cwd(), "dist", "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.get("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { createServer } from "http";
var app = express2();
var httpServer = createServer(app);
app.use(
  express2.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express2.urlencoded({ extended: false }));
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await registerRoutes(httpServer, app);
  try {
    await seedDatabase();
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite: setupVite2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
    await setupVite2(httpServer, app);
  }
  if (!process.env.VERCEL && !process.env.SUPABASE_GRPC_URL) {
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true
      },
      () => {
        log(`serving on port ${port}`);
      }
    );
  }
})();
var index_default = app;
export {
  index_default as default,
  log
};
