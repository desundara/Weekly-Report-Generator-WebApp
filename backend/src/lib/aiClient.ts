// Groq offers a free API tier for open-source models (Llama 3.x) with an
// OpenAI-compatible endpoint, so a plain fetch call is enough — no SDK needed.
// Get a free key at https://console.groq.com/keys

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function isAiConfigured() {
  return Boolean(process.env.GROQ_API_KEY);
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type GroqResponse = {
  choices?: { message?: { content?: string } }[];
};

export async function callAi(messages: ChatMessage[], maxTokens = 500): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq API error (${res.status}): ${body}`);
  }

  const data = (await res.json()) as GroqResponse;
  return data.choices?.[0]?.message?.content ?? "";
}