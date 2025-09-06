import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScanSchema, insertRecommendationSchema } from "@shared/schema";
import OpenAI from "openai";
import multer from "multer";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze image using OpenAI Vision API
  app.post("/api/analyze-image", upload.single("image"), async (req, res) => {
    try {
      const { scanType } = req.body;
      const imageFile = req.file;
      
      if (!imageFile) {
        return res.status(400).json({ message: "No image file provided" });
      }

      if (!scanType || !["nutrition", "acne", "general"].includes(scanType)) {
        return res.status(400).json({ message: "Invalid scan type" });
      }

      // Convert image to base64
      const base64Image = imageFile.buffer.toString('base64');
      
      // Prepare analysis prompt based on scan type
      let analysisPrompt = "";
      switch (scanType) {
        case "nutrition":
          analysisPrompt = "Analyze this body image for potential nutrient deficiencies. Look for signs like skin discoloration, hair quality, nail condition, and overall appearance that might indicate vitamin or mineral deficiencies. Provide specific recommendations for nutrition improvements. Return your analysis in JSON format with fields: deficiencies (array), recommendations (array), confidence (number 0-100), and summary (string).";
          break;
        case "acne":
          analysisPrompt = "Analyze this facial image for acne conditions. Identify types of acne present, severity level, affected areas, and provide skincare recommendations. Return your analysis in JSON format with fields: acneType (string), severity (string), affectedAreas (array), recommendations (array), confidence (number 0-100), and summary (string).";
          break;
        case "general":
          analysisPrompt = "Perform a general health assessment of this image. Look for visible health indicators, skin condition, signs of fatigue or vitality, and provide general wellness recommendations. Return your analysis in JSON format with fields: healthIndicators (array), recommendations (array), confidence (number 0-100), and summary (string).";
          break;
      }

      // Call OpenAI Vision API
      const visionResponse = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const analysisResult = JSON.parse(visionResponse.choices[0].message.content || "{}");
      
      // Create scan record
      const scanData = insertScanSchema.parse({
        userId: null, // For demo purposes, not requiring user auth
        type: scanType,
        imageData: base64Image,
        analysis: analysisResult,
        confidence: analysisResult.confidence || 85,
        status: "completed"
      });

      const scan = await storage.createScan(scanData);

      // Create recommendations if analysis successful
      if (analysisResult.recommendations && Array.isArray(analysisResult.recommendations)) {
        for (const rec of analysisResult.recommendations) {
          await storage.createRecommendation({
            scanId: scan.id,
            type: scanType === "acne" ? "skincare" : "nutrition",
            title: rec.title || rec,
            description: rec.description || rec,
            priority: rec.priority || "medium"
          });
        }
      }

      res.json({
        scanId: scan.id,
        analysis: analysisResult,
        confidence: analysisResult.confidence || 85
      });

    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze image. Please check your image format and try again.",
        error: error.message 
      });
    }
  });

  // Get recent scans
  app.get("/api/scans", async (req, res) => {
    try {
      const scans = await storage.getScansByUserId("demo-user"); // Demo user for now
      res.json(scans);
    } catch (error) {
      console.error("Get scans error:", error);
      res.status(500).json({ message: "Failed to retrieve scans" });
    }
  });

  // Get scan by ID
  app.get("/api/scans/:id", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      res.json(scan);
    } catch (error) {
      console.error("Get scan error:", error);
      res.status(500).json({ message: "Failed to retrieve scan" });
    }
  });

  // Get recommendations
  app.get("/api/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getRecentRecommendations(10);
      res.json(recommendations);
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ message: "Failed to retrieve recommendations" });
    }
  });

  // Text-to-Speech endpoint
  app.post("/api/text-to-speech", async (req, res) => {
    try {
      const { text, voice = "alloy" } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const response = await openai.audio.speech.create({
        model: "tts-1", // Using standard TTS model
        voice: voice,
        input: text,
        response_format: "mp3"
      });

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length
      });
      
      res.send(audioBuffer);

    } catch (error) {
      console.error("TTS error:", error);
      res.status(500).json({ 
        message: "Failed to generate speech. Please try again.",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
