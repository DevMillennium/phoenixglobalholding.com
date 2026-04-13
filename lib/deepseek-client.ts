import { getDeepseekApiKey } from "@/lib/deepseek-env";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export async function deepseekChat(params: {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  const apiKey = getDeepseekApiKey();
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY ausente");

  const model = params.model?.trim() || "deepseek-chat";
  const res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: params.temperature ?? 0.35,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`DeepSeek ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Resposta vazia da DeepSeek");
  return text;
}
