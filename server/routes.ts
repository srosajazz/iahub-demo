import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDueItemSchema, insertMessageSchema, insertActionItemSchema, insertDonorSchema } from "@shared/schema";

type UserRole = "admin" | "president" | "vice_president" | "staff";

interface User {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
}

const USERS: User[] = [
  { username: "admin", password: "IAberk26", role: "admin", displayName: "Admin User" },
  { username: "president", password: "IAberk26", role: "president", displayName: "Jim Lucchese" },
  { username: "vp", password: "IAberk26", role: "vice_president", displayName: "Edward J. Lewis, III" },
  { username: "staff", password: "IAberk26", role: "staff", displayName: "Staff Member" },
];

interface SessionData {
  username: string;
  role: UserRole;
  displayName: string;
}

const sessions = new Map<string, SessionData>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication API
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessions.set(sessionId, { username: user.username, role: user.role, displayName: user.displayName });
      res.cookie("session", sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.json({ success: true, role: user.role, displayName: user.displayName });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/auth/check", (req, res) => {
    const sessionId = req.cookies?.session;
    const sessionData = sessionId ? sessions.get(sessionId) : null;
    if (sessionData) {
      res.json({ authenticated: true, role: sessionData.role, displayName: sessionData.displayName });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  app.post("/api/logout", (req, res) => {
    const sessionId = req.cookies?.session;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.clearCookie("session");
    res.json({ success: true });
  });

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

  // Helper to check role authorization
  function getSessionRole(req: any): UserRole | null {
    const sessionId = req.cookies?.session;
    const sessionData = sessionId ? sessions.get(sessionId) : null;
    return sessionData?.role || null;
  }

  function canViewDonors(role: UserRole | null): boolean {
    return role === "admin" || role === "president" || role === "vice_president";
  }

  function canEditDonors(role: UserRole | null): boolean {
    return role === "admin";
  }

  // Donors API - Protected: Only admin, president, vice_president can view
  app.get("/api/donors", async (req, res) => {
    const role = getSessionRole(req);
    if (!canViewDonors(role)) {
      res.status(403).json({ error: "Access denied. Donor data is restricted to authorized personnel only." });
      return;
    }
    try {
      const donorList = await storage.getDonors();
      res.json(donorList);
    } catch (error) {
      console.error("Error fetching donors:", error);
      res.status(500).json({ error: "Failed to fetch donors" });
    }
  });

  app.post("/api/donors", async (req, res) => {
    const role = getSessionRole(req);
    if (!canEditDonors(role)) {
      res.status(403).json({ error: "Access denied. Only administrators can create donor records." });
      return;
    }
    try {
      const parsed = insertDonorSchema.parse(req.body);
      const donor = await storage.createDonor(parsed);
      res.json(donor);
    } catch (error) {
      console.error("Error creating donor:", error);
      res.status(400).json({ error: "Invalid donor data" });
    }
  });

  app.patch("/api/donors/:id", async (req, res) => {
    const role = getSessionRole(req);
    if (!canEditDonors(role)) {
      res.status(403).json({ error: "Access denied. Only administrators can edit donor records." });
      return;
    }
    try {
      const { id } = req.params;
      const updates = req.body;
      const donor = await storage.updateDonor(id, updates);
      if (!donor) {
        res.status(404).json({ error: "Donor not found" });
        return;
      }
      res.json(donor);
    } catch (error) {
      console.error("Error updating donor:", error);
      res.status(400).json({ error: "Failed to update donor" });
    }
  });

  app.delete("/api/donors/:id", async (req, res) => {
    const role = getSessionRole(req);
    if (!canEditDonors(role)) {
      res.status(403).json({ error: "Access denied. Only administrators can delete donor records." });
      return;
    }
    try {
      const { id } = req.params;
      await storage.deleteDonor(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting donor:", error);
      res.status(500).json({ error: "Failed to delete donor" });
    }
  });

  return httpServer;
}
