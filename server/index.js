import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/flashcards", async (req, res) => {
  try {
    // 1. EXTRACT prompt FROM req.body
    // We expect the frontend to send { transcript: "...", prompt: "..." }
    const { transcript, prompt } = req.body;

    // 2. Validation
    if (!transcript || !prompt) {
        return res.status(400).json({ error: "Transcript or Prompt is missing" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer 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`, 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0,
          messages: [
            {
              role: "user",
              // 3. USE THE RECEIVED PROMPT VARIABLE
              content: prompt, 
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Groq API Error:", data); 
        return res.status(response.status).json({ error: data.error || "Groq API error" });
    }

    res.json(data);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});