import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, desc } from "drizzle-orm";
import {
  dueItems,
  messages,
  actionItems,
  donors,
  type DueItem,
  type InsertDueItem,
  type Message,
  type InsertMessage,
  type ActionItem,
  type InsertActionItem,
  type Donor,
  type InsertDonor,
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

  // Donors
  getDonors(): Promise<Donor[]>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: string, updates: Partial<InsertDonor>): Promise<Donor | undefined>;
  deleteDonor(id: string): Promise<void>;
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

  // Donors
  async getDonors(): Promise<Donor[]> {
    return await db.select().from(donors).orderBy(desc(donors.lastGiftDate));
  }

  async createDonor(donor: InsertDonor): Promise<Donor> {
    const result = await db.insert(donors).values(donor).returning();
    return result[0];
  }

  async updateDonor(id: string, updates: Partial<InsertDonor>): Promise<Donor | undefined> {
    const result = await db
      .update(donors)
      .set(updates)
      .where(eq(donors.id, id))
      .returning();
    return result[0];
  }

  async deleteDonor(id: string): Promise<void> {
    await db.delete(donors).where(eq(donors.id, id));
  }
}

export const storage = new DbStorage();
