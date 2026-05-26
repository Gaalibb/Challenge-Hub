import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Evaluation Route
app.post("/evaluate-response", async (req, res) => {
  try {
    const { answer, question } = req.body;

    if (!answer || !question) {
      return res.status(400).json({
        error: "Both 'answer' and 'question' fields are required."
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an academic evaluator. Analyze the student's answer and return a JSON object ONLY.

Question: ${question}
Student Answer: ${answer}

Return ONLY this JSON structure:
{
  "score": number between 0 and 100,
  "feedback": "short helpful feedback",
  "topic": "detected topic of the question"
}
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Clean JSON in case Gemini adds extra characters
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const aiData = JSON.parse(cleaned);

    res.json(aiData);

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      error: "AI evaluation failed. Check your prompt or API key.",
      details: error.message
    });
  }
});

// Start server
app.listen(5000, () => {
  console.log("AI server running on port 5000");
});
