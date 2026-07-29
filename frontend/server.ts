import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with User-Agent header as specified in skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "DeutschMastery" });
});

// AI Tutor Chat Route
app.post("/api/ai-tutor", async (req, res) => {
  try {
    const { message, history, targetLanguage = "uz", userLevel = "B2" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const langNames: Record<string, string> = {
      uz: "Uzbek (O'zbekcha)",
      ru: "Russian (Русский)",
      en: "English",
      de: "German (Deutsch)",
    };

    const targetLangName = langNames[targetLanguage] || "Uzbek";

    const systemInstruction = `You are DeutschMastery AI, a warm, highly encouraging, and expert German language tutor for a learner at ${userLevel} level.
Your primary goal is to help the user practice German, answer grammar questions, explain German vocabulary, and check their German sentences.
Follow these guidelines:
1. Speak primarily in clear German suited for level ${userLevel}, but provide translations or explanations in ${targetLangName} when helpful or requested.
2. If the user makes a mistake in German, gently correct them in a dedicated section called "💡 Grammar Correction" before continuing the conversation naturally.
3. Keep answers interactive, concise, structured, and engaging.
4. When introducing new vocabulary, include phonetic pronunciation guide and example sentences.
5. You support Uzbek, Russian, English, and German natively.`;

    const contents = history && history.length > 0
      ? [
          ...history.map((h: { role: string; content: string }) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }],
          })),
          { role: "user", parts: [{ text: message }] },
        ]
      : message;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Entschuldigung, ich konnte das nicht verarbeiten.";
    res.json({ reply });
  } catch (error: any) {
    console.error("AI Tutor API Error:", error);
    res.status(500).json({
      error: "AI Tutor service error",
      details: error.message || String(error),
    });
  }
});

// OCR & Document Analysis Route
app.post("/api/ocr-analyze", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", textContent, targetLanguage = "uz" } = req.body;

    if (!imageBase64 && !textContent) {
      return res.status(400).json({ error: "Image base64 or text content is required" });
    }

    const langNames: Record<string, string> = {
      uz: "Uzbek",
      ru: "Russian",
      en: "English",
      de: "German",
    };

    const targetLangName = langNames[targetLanguage] || "Uzbek";

    const prompt = `Perform complete German text OCR and linguistic analysis.
Return your analysis in valid JSON format matching this schema:
{
  "extractedText": "Original extracted German text",
  "translation": "Full translation into ${targetLangName}",
  "cefrLevel": "Estimated CEFR level (A1, A2, B1, B2, C1)",
  "vocabularyList": [
    {
      "word": "German word with article if noun (e.g. die Herausforderung)",
      "translation": "Translation in ${targetLangName}",
      "context": "Context sentence from text",
      "type": "noun/verb/adjective/etc"
    }
  ],
  "grammarNotes": [
    "Key grammar explanation or sentence structure observation"
  ]
}`;

    let contents;
    if (imageBase64) {
      const imagePart = {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      };
      contents = { parts: [imagePart, { text: prompt }] };
    } else {
      contents = `${prompt}\n\nGerman Text to Analyze:\n"${textContent}"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("OCR API Error:", error);
    res.status(500).json({
      error: "OCR analysis error",
      details: error.message || String(error),
    });
  }
});

// Grammar Checker Endpoint
app.post("/api/grammar-check", async (req, res) => {
  try {
    const { sentence, targetLanguage = "uz" } = req.body;

    if (!sentence) {
      return res.status(400).json({ error: "Sentence is required" });
    }

    const langNames: Record<string, string> = {
      uz: "Uzbek",
      ru: "Russian",
      en: "English",
      de: "German",
    };

    const targetLangName = langNames[targetLanguage] || "Uzbek";

    const prompt = `Check this German sentence for grammatical accuracy, word order (V2 rule, Nebensatz verb end, etc.), case declension, and modal verb usage.
Provide output in JSON format matching this schema:
{
  "isCorrect": boolean,
  "original": "${sentence}",
  "corrected": "Corrected German sentence",
  "score": percentage_integer_between_0_and_100,
  "explanation": "Detailed explanation of mistakes and grammar rules in ${targetLangName}",
  "suggestions": ["Optional stylistic or vocabulary suggestions"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Grammar Check Error:", error);
    res.status(500).json({ error: "Grammar checker failed", details: error.message });
  }
});

// Start Server with Vite Middleware or Production Static Serve
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DeutschMastery server running on http://0.0.0.0:${PORT}`);
  });
}

start();
