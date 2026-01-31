import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // API proxy is now registered in index.ts before body parsers
  // to ensure POST requests work correctly
  return httpServer;
}
