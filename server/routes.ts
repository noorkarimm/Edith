import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateItinerary } from "./services/openai";

const generateItinerarySchema = z.object({
  description: z.string().min(10, "Please provide a more detailed description of your trip"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "API is working" });
  });

  // Generate travel itinerary endpoint
  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const { description } = generateItinerarySchema.parse(req.body);
      
      const itinerary = await generateItinerary(description);
      
      res.json({
        success: true,
        itinerary
      });
    } catch (error) {
      console.error("Itinerary generation error:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate itinerary"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}