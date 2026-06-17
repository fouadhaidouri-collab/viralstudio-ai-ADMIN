const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

const FREE_MODELS = {
  "deepseek/deepseek-chat": { name: "DeepSeek V3", free: true },
  "deepseek/deepseek-r1": { name: "DeepSeek R1", free: true },
  "meta-llama/llama-3.1-8b-instruct": { name: "Llama 3.1 8B", free: true },
  "mistralai/mistral-7b-instruct": { name: "Mistral 7B", free: true },
  "google/gemini-2.0-flash-lite-preview": { name: "Gemini Flash Lite", free: true },
};

const DEFAULT_MODEL = "deepseek/deepseek-chat";

export async function callLLM(prompt, { model = DEFAULT_MODEL, system, temperature = 0.3, maxTokens = 4096 } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured in .env.local");
  }

  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://viralstudio.ai",
      "X-Title": "ViralStudio AI",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function callLLMJSON(prompt, options = {}) {
  const raw = await callLLM(prompt, { ...options, temperature: 0.1 });
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/{[\s\S]*?}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch {
      return JSON.parse(jsonMatch[0]);
    }
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse LLM response as JSON: " + raw.slice(0, 200));
  }
}

export { FREE_MODELS, DEFAULT_MODEL };
