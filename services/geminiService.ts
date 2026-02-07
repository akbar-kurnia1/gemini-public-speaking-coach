import { GoogleGenAI } from "@google/genai";
import { ChatMessage, LevelNode, Mistake, EvaluationMetrics } from "../types";

const getClient = () => {
  if (process.env.API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return null;
};

// Returns a simulated conversational response
export const generateAIResponse = async (
  history: ChatMessage[],
  newMessage: string,
  level: LevelNode
): Promise<string> => {
  const client = getClient();
  
  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return `[Mock AI] I heard you say "${newMessage}". Keep eye contact with the camera. Please continue.`;
  }

  try {
    const prompt = `
      You are a Strict Voice Coach.
      Scenario: ${level.title}
      Context: ${level.promptContext}
      User said: "${newMessage}"
      
      Respond in character (under 30 words).
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "I didn't quite catch that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection error. Please try again.";
  }
};

// Generates structured evaluation data (Text + Visual Simulation)
export const generateMultimodalEvaluation = async (messages: ChatMessage[]): Promise<EvaluationMetrics> => {
  const client = getClient();
  const userMessages = messages.filter(m => m.sender === 'user');
  const transcript = userMessages.map(m => m.text).join(' ');

  // Mock Fallback
  if (!client || userMessages.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      score: 82,
      feedbackSummary: "Your pacing was excellent. Visually, you maintained good eye contact but slouched slightly during the middle section.",
      mistakes: [
        { original: "I runned the team", correction: "I ran the team", type: "grammar", explanation: "Irregular verb error." }
      ]
    };
  }

  try {
    const prompt = `
      Analyze this transcript: "${transcript}"
      Return JSON:
      {
        "score": number (0-100),
        "feedbackSummary": "string",
        "mistakes": [{ "original": "string", "correction": "string", "type": "grammar", "explanation": "string" }]
      }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      score: data.score || 70,
      feedbackSummary: data.feedbackSummary || "Analysis complete.",
      mistakes: data.mistakes || []
    };
  } catch (error) {
    console.error("Evaluation Error:", error);
    return {
      score: 0,
      feedbackSummary: "Error calculating score.",
      mistakes: []
    };
  }
};