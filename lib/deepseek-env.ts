/**
 * Resolve a chave DeepSeek em runtime (Vercel, .env, .env.local).
 * Aceita nomes alternativos por compatibilidade com integrações antigas.
 */
export function getDeepseekApiKey(): string | undefined {
  const candidates = [
    process.env.DEEPSEEK_API_KEY,
    process.env.DEEPSEEK_KEY,
    process.env.DEEPSEEK_SECRET,
  ];
  for (const raw of candidates) {
    const v = raw?.trim();
    if (v) return v;
  }
  return undefined;
}
