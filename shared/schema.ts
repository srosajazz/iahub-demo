import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Due items with countdown timers
export const dueItems = pgTable("due_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  owner: text("owner").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Open"), // "Open" | "Done" | "Expired"
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export const insertDueItemSchema = createInsertSchema(dueItems).omit({
  id: true,
  createdAt: true,
});

export type InsertDueItem = z.infer<typeof insertDueItemSchema>;
export type DueItem = typeof dueItems.$inferSelect;

// Team messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toTeam: text("to_team").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Action items tracking
export const actionItems = pgTable("action_items", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  why: text("why").notNull(),
  owner: text("owner").notNull(),
  horizon: varchar("horizon", { length: 20 }).notNull(),
  impact: varchar("impact", { length: 10 }).notNull(),
  metric: text("metric").notNull(),
  isDone: integer("is_done").notNull().default(0), // 0 = not done, 1 = done
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({
  isDone: true,
});

export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
