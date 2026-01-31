import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, desc } from "drizzle-orm";
import {
  dueItems,
  messages,
  actionItems,
  type DueItem,
  type InsertDueItem,
  type Message,
  type InsertMessage,
  type ActionItem,
  type InsertActionItem,
} from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // Due Items
  getDueItems(): Promise<DueItem[]>;
  getDueItem(id: string): Promise<DueItem | undefined>;
  createDueItem(item: InsertDueItem): Promise<DueItem>;
  updateDueItem(id: string, updates: Partial<InsertDueItem>): Promise<DueItem | undefined>;
  deleteDueItem(id: string): Promise<void>;

  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Action Items
  getActionItems(): Promise<ActionItem[]>;
  getActionItem(id: string): Promise<ActionItem | undefined>;
  createActionItem(item: InsertActionItem): Promise<ActionItem>;
  updateActionItemDone(id: string, isDone: boolean): Promise<ActionItem | undefined>;
}

export class DbStorage implements IStorage {
  // Due Items
  async getDueItems(): Promise<DueItem[]> {
    return await db.select().from(dueItems).orderBy(dueItems.dueAt);
  }

  async getDueItem(id: string): Promise<DueItem | undefined> {
    const result = await db.select().from(dueItems).where(eq(dueItems.id, id)).limit(1);
    return result[0];
  }

  async createDueItem(item: InsertDueItem): Promise<DueItem> {
    const result = await db.insert(dueItems).values(item).returning();
    return result[0];
  }

  async updateDueItem(id: string, updates: Partial<InsertDueItem>): Promise<DueItem | undefined> {
    const result = await db
      .update(dueItems)
      .set(updates)
      .where(eq(dueItems.id, id))
      .returning();
    return result[0];
  }

  async deleteDueItem(id: string): Promise<void> {
    await db.delete(dueItems).where(eq(dueItems.id, id));
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  // Action Items
  async getActionItems(): Promise<ActionItem[]> {
    return await db.select().from(actionItems);
  }

  async getActionItem(id: string): Promise<ActionItem | undefined> {
    const result = await db.select().from(actionItems).where(eq(actionItems.id, id)).limit(1);
    return result[0];
  }

  async createActionItem(item: InsertActionItem): Promise<ActionItem> {
    const result = await db.insert(actionItems).values(item).returning();
    return result[0];
  }

  async updateActionItemDone(id: string, isDone: boolean): Promise<ActionItem | undefined> {
    const result = await db
      .update(actionItems)
      .set({ isDone: isDone ? 1 : 0 })
      .where(eq(actionItems.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
