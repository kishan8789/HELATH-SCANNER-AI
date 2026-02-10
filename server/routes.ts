import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScanSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

const HF_TOKEN = process.env.HF_TOKEN || "";

export async function registerRoutes(app: Express): Promise<Server> {

  app.post("/api/analyze-image", upload.single("image"), async (req: any, res) => {
    try {
      const imageFile = req.file;
      const scanType = req.body.scanType || "general";
      const aiMetadata = req.body.aiMetadata ? JSON.parse(req.body.aiMetadata) : null;

      if (!imageFile) return res.status(400).json({ message: "Image upload karein" });

      console.log(`--- Starting ${scanType} Pipeline ---`);
      const binaryData = new Uint8Array(imageFile.buffer);
      const base64Image = imageFile.buffer.toString("base64");

      // 🧠 Models to try (Hugging Face)
      const models = [
        "dermatology/skin-lesion-classification",
        "google/vit-base-patch16-224"
      ];

      let finalLabel = aiMetadata?.name || "Healthy Surface";
      let confidence = aiMetadata?.riskFactor || 85;
      let success = false;

      // 🔄 Real-time AI Inference Loop
      for (const model of models) {
        try {
          const hfResponse = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
            headers: { Authorization: `Bearer ${HF_TOKEN.trim()}`, "Content-Type": "application/octet-stream" },
            method: "POST",
            body: binaryData,
            signal: AbortSignal.timeout(4000)
          });

          if (hfResponse.ok) {
            const hfOutput: any = await hfResponse.json();
            const topResult = Array.isArray(hfOutput) ? hfOutput[0] : null;
            if (topResult) {
              // Agar Hugging Face kuch detect karta hai toh confidence wahan se lo
              confidence = Math.round(topResult.score * 100);
              success = true;
              break;
            }
          }
        } catch (e) { continue; }
      }

      // 🛠️ Dynamic Mapping (Ensures History is unique)
      const analysisResult = {
        name: aiMetadata?.name || finalLabel,
        summary: aiMetadata?.message || "Analysis complete.",
        medicine: aiMetadata?.medicine || "Doctor se consult karein.",
        food: aiMetadata?.food || "Balanced diet lein.",
        riskFactor: confidence,
        recommendations: [
          { title: "Personalized Precautions", description: aiMetadata?.precautions || "Cleanliness maintain karein.", priority: "high" },
          { title: "Next Step", description: "Monitor progress with weekly scans.", priority: "medium" }
        ]
      };

      // 💾 Save to Database (shared/schema.ts ke mutabik)
      const scanData = insertScanSchema.parse({
        userId: "1", 
        type: scanType, 
        imageData: base64Image,
        analysis: analysisResult, 
        confidence: confidence,
        status: "completed",
      });

      const scan = await storage.createScan(scanData);
      console.log(`✅ Saved Scan ID: ${scan.id} for Type: ${scanType}`);
      
      res.json({ scanId: scan.id, analysis: analysisResult, confidence: confidence });

    } catch (error: any) {
      console.error("❌ Route Error:", error.message);
      res.status(500).json({ message: "Inference failed", error: error.message });
    }
  });

  app.get("/api/scans", async (_req, res) => {
    const scans = await storage.getScansByUserId("1");
    // reverse() taaki naya scan sabse upar dikhe
    res.json(scans.reverse());
  });

  return createServer(app);
}