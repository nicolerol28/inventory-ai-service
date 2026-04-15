import { createScorer } from "@mastra/core/evals";

export const responseLanguageScorer = createScorer({
  id: "response-language",
  description: "Checks if the agent response is in Spanish",
  type: "agent",
}).generateScore(({ run }) => {
  // content is an object with { format, parts, content: string }
  const rawContent = run.output?.[0]?.content;
  const text =
    typeof rawContent === "string"
      ? rawContent
      : typeof rawContent === "object" && rawContent !== null && "content" in rawContent
        ? String((rawContent as { content: string }).content)
        : "";

  if (!text || text.trim().length === 0) {
    return 0;
  }

  const spanishPatterns = [
    /\b(el|la|los|las|un|una|unos|unas)\b/i,
    /\b(de|en|con|por|para|que|del|al)\b/i,
    /\b(es|son|está|están|tiene|tienen|hay)\b/i,
    /\b(no|sí|también|pero|como|más|muy)\b/i,
    /[áéíóúñ¿¡]/i,
    /\b(producto|categoría|bodega|proveedor|inventario|stock)\b/i,
  ];

  const matches = spanishPatterns.filter((p) => p.test(text)).length;
  return Math.min(matches / 4, 1);
});