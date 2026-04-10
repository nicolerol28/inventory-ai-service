import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProducts } from "../lib/inventoryClient.js";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  categoryId: number;
  supplierId: number;
  active: boolean;
}

interface Fragment {
  text: string;
  embedding: number[];
}

// ─── Paso 1: Convertir producto en texto legible ──────────────────────────────

function productoATexto(p: Product): string {
  return `
${p.name} (SKU: ${p.sku})
Descripción: ${p.description}
Precio compra: $${p.purchasePrice.toLocaleString("es-CO")} | Precio venta: $${p.salePrice.toLocaleString("es-CO")}
Categoría ID: ${p.categoryId} | Proveedor ID: ${p.supplierId} | Activo: ${p.active ? "sí" : "no"}
  `.trim();
}

// ─── Paso 2: Similitud coseno entre dos vectores ──────────────────────────────

function similitudCoseno(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

// ─── Paso 3: Generar embedding de un texto ───────────────────────────────────

async function generarEmbedding(texto: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env["GOOGLE_GENERATIVE_AI_API_KEY"]}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text: texto }] },
      }),
    }
  );
  const data = await response.json();
  return (data as any).embedding.values;
}

// ─── Programa principal ───────────────────────────────────────────────────────

async function main() {
  console.log("\nIniciando experimento RAG manual — Fase 1\n");

  // 1. Traer productos reales de la API Java
  console.log("Trayendo productos del inventario...");
  const productos = await getProducts() as Product[];
  console.log(`   ${productos.length} productos encontrados\n`);

  // 2. Convertir cada producto en un fragmento de texto
  console.log("Convirtiendo productos a texto...");
  const textos = productos.map(productoATexto);
  textos.forEach((t, i) => console.log(`   Fragmento ${i + 1}:\n${t}\n`));

  // 3. Generar embeddings de los fragmentos (sin mostrarlos todavía)
  console.log("Generando embeddings de los fragmentos...");
  const fragmentos: Fragment[] = [];
  for (const texto of textos) {
    const embedding = await generarEmbedding(texto);
    fragmentos.push({ text: texto, embedding });
    console.log(`   Embedding generado (${embedding.length} dimensiones)`);
  }

  // 4. La pregunta del usuario
  const pregunta = "¿Qué productos están inactivos?";
  console.log(`\n Pregunta: "${pregunta}"\n`);

  // 5. Generar embedding de la pregunta y mostrarlo
  console.log("Generando embedding de la pregunta...");
  const embeddingPregunta = await generarEmbedding(pregunta);
  console.log(`\n Embedding de la PREGUNTA (primeros 10 de ${embeddingPregunta.length} números):`);
  console.log("   ", embeddingPregunta.slice(0, 10).map(n => n.toFixed(4)).join(", "), "...\n");

  // 6. Calcular similitud coseno
  console.log(" Calculando similitud coseno...\n");
  const resultados = fragmentos
    .map((f) => ({
      text: f.text,
      embedding: f.embedding,
      similitud: similitudCoseno(embeddingPregunta, f.embedding),
    }))
    .sort((a, b) => b.similitud - a.similitud)
    .slice(0, 3);

  // 7. Mostrar los 3 fragmentos más relevantes con sus embeddings para comparar
  console.log("Fragmentos más relevantes + sus embeddings:\n");
  resultados.forEach((r, i) => {
    console.log(`── ${i + 1}. Similitud: ${r.similitud.toFixed(4)} ──────────────────`);
    console.log(r.text);
    console.log(`\n    Embedding de este fragmento (primeros 10):`);
    console.log("   ", r.embedding.slice(0, 10).map(n => n.toFixed(4)).join(", "), "...");
    console.log(`\n    Embedding de la PREGUNTA (primeros 10):`);
    console.log("   ", embeddingPregunta.slice(0, 10).map(n => n.toFixed(4)).join(", "), "...\n");
  });

  // 8. Construir el prompt y enviar a Gemini
  const contexto = resultados.map((r) => r.text).join("\n\n---\n\n");
  const prompt = `
Eres un asistente de inventario. Responde en español basándote SOLO en la información proporcionada.

INFORMACIÓN DEL INVENTARIO:
${contexto}

PREGUNTA: ${pregunta}
  `.trim();

  console.log("Enviando a Gemini...\n");
  const genAI = new GoogleGenerativeAI(process.env["GOOGLE_GENERATIVE_AI_API_KEY"]!);
  const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const chatResult = await chatModel.generateContent(prompt);
  const text = chatResult.response.text();

  // 9. Respuesta
  console.log("Respuesta de Gemini:");
  console.log(text);
}

main().catch(console.error);