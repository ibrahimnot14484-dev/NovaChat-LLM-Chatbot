import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are NovaChat, a helpful, friendly and concise AI assistant.
Answer clearly and accurately. If you are unsure about something, say so rather than inventing facts.
Use the conversation history to understand follow-up questions.`;

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const cleanMessages = messages
      .filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim()
      )
      .slice(-20);

    if (!cleanMessages.length) {
      return Response.json(
        { error: "Please send a message first." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const contents = cleanMessages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    let response;

    // Try twice because Gemini can temporarily return 503
    // when the model is experiencing high demand.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        });

        break;
      } catch (error) {
        if (error?.status === 503 && attempt === 1) {
          console.log("Gemini is busy. Retrying...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }

        throw error;
      }
    }

    const reply = response?.text;

    if (!reply) {
      return Response.json(
        { error: "The model returned an empty response." },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);

    if (error?.status === 503) {
      return Response.json(
        {
          error:
            "NovaChat is temporarily busy. Please try sending your message again in a moment.",
        },
        { status: 503 }
      );
    }

    return Response.json(
      {
        error:
          "Gemini API request failed. Please try again.",
      },
      { status: 500 }
    );
  }
}