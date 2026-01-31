import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDueItemSchema, insertMessageSchema, insertActionItemSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Due Items API
  app.get("/api/due-items", async (_req, res) => {
    try {
      const items = await storage.getDueItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching due items:", error);
      res.status(500).json({ error: "Failed to fetch due items" });
    }
  });

  app.post("/api/due-items", async (req, res) => {
    try {
      const parsed = insertDueItemSchema.parse(req.body);
      const item = await storage.createDueItem(parsed);
      res.json(item);
    } catch (error) {
      console.error("Error creating due item:", error);
      res.status(400).json({ error: "Invalid due item data" });
    }
  });

  app.patch("/api/due-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const item = await storage.updateDueItem(id, updates);
      if (!item) {
        res.status(404).json({ error: "Due item not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating due item:", error);
      res.status(400).json({ error: "Failed to update due item" });
    }
  });

  app.delete("/api/due-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDueItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting due item:", error);
      res.status(500).json({ error: "Failed to delete due item" });
    }
  });

  // Messages API
  app.get("/api/messages", async (_req, res) => {
    try {
      const msgs = await storage.getMessages();
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const parsed = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(parsed);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Action Items API
  app.get("/api/action-items", async (_req, res) => {
    try {
      const items = await storage.getActionItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching action items:", error);
      res.status(500).json({ error: "Failed to fetch action items" });
    }
  });

  app.post("/api/action-items", async (req, res) => {
    try {
      const parsed = insertActionItemSchema.parse(req.body);
      const item = await storage.createActionItem(parsed);
      res.json(item);
    } catch (error) {
      console.error("Error creating action item:", error);
      res.status(400).json({ error: "Invalid action item data" });
    }
  });

  app.patch("/api/action-items/:id/done", async (req, res) => {
    try {
      const { id } = req.params;
      const { isDone } = req.body;
      const item = await storage.updateActionItemDone(id, isDone);
      if (!item) {
        res.status(404).json({ error: "Action item not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating action item:", error);
      res.status(500).json({ error: "Failed to update action item" });
    }
  });

  return httpServer;
}
