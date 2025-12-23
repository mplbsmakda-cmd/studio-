
import { GoogleGenAI } from "@google/genai";

export const getAITutorResponse = async (prompt: string, context?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    You are an AI Education Assistant for SMK LPPMRI 2 KEDUNGREJA. 
    You help students and teachers with their academic queries. 
    Keep answers concise, accurate, and supportive. 
    If context is provided, use it to answer the question.
    Answer in Indonesian language unless asked otherwise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maaf, asisten AI sedang mengalami gangguan. Silakan coba lagi nanti.";
  }
};
