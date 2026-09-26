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

    let response = null;
    let lastError = null;

    // Retry temporary Gemini availability/rate-limit errors.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            maxOutputTokens: 1024,
          },
        });

        break;
      } catch (error) {
        lastError = error;

        const status = error?.status;

        if (status !== 429 && status !== 503) {
          throw error;
        }

        if (attempt < 2) {
          const delay = 2000 * 2 ** attempt;
          console.log(
            `Gemini returned ${status}. Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (!response) {
      if (lastError?.status === 429) {
        return Response.json(
          {
            error:
              "NovaChat is temporarily rate-limited. Please try again in a moment.",
          },
          { status: 429 }
        );
      }

      if (lastError?.status === 503) {
        return Response.json(
          {
            error:
              "NovaChat is temporarily busy. Please try again in a moment.",
          },
          { status: 503 }
        );
      }

      throw lastError;
    }

    const reply = response.text;

    if (!reply) {
      return Response.json(
        { error: "The model returned an empty response." },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);

    return Response.json(
      {
        error:
          "Gemini API request failed. Please try again.",
      },
      { status: 500 }
    );
  }
}