/**
 * Seed conversations for the demo user.
 * Each conversation has a fixed UUID so the daily reset can upsert them.
 * The messages showcase different capabilities of the agent.
 */

export interface SeedConversation {
  id: string;
  title: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

export const SEED_CONVERSATIONS: SeedConversation[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    title: "Consulta de inventario",
    messages: [
      {
        role: "user",
        content: "¿Cuánto stock hay de laptops en la bodega principal?",
      },
      {
        role: "assistant",
        content:
          "En la bodega Principal (Cali) hay 25 unidades de Laptop HP Pavilion y 18 unidades de Laptop Dell Inspiron en stock.",
      },
      {
        role: "user",
        content: "¿Y cuáles fueron los últimos movimientos de esas laptops?",
      },
      {
        role: "assistant",
        content:
          "Los últimos movimientos de laptops en la bodega Principal fueron:\n\n" +
          "**Laptop HP Pavilion:**\n" +
          "- Entrada de 30 unidades (compra a TechSupplies) — hace 5 días\n" +
          "- Salida de 5 unidades (venta) — hace 2 días\n\n" +
          "**Laptop Dell Inspiron:**\n" +
          "- Entrada de 20 unidades (compra a TechSupplies) — hace 7 días\n" +
          "- Salida de 2 unidades (venta) — hace 1 día",
      },
    ],
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    title: "Búsqueda semántica (RAG)",
    messages: [
      {
        role: "user",
        content: "¿Qué productos tengo para limpiar pisos?",
      },
      {
        role: "assistant",
        content:
          "Basándome en una búsqueda semántica, encontré estos productos relacionados con limpieza de pisos:\n\n" +
          "1. **Limpiador multiusos** — Limpiador concentrado para todo tipo de superficies (SKU: LIMP-001)\n" +
          "2. **Desinfectante de pisos** — Desinfectante con aroma a lavanda para pisos (SKU: LIMP-003)\n" +
          "3. **Trapeador industrial** — Trapeador de microfibra para uso comercial (SKU: LIMP-005)\n\n" +
          "¿Necesitas ver el stock o precios de alguno de estos productos?",
      },
    ],
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    title: "Reporte de compras",
    messages: [
      {
        role: "user",
        content: "Genera un reporte de compras sugeridas para la bodega Norte",
      },
      {
        role: "assistant",
        content:
          "Aquí tienes el reporte de compras sugeridas para la bodega Norte (Bogotá):\n\n" +
          "**Productos con stock bajo:**\n\n" +
          "| Producto | Stock actual | Mínimo sugerido | Cantidad a pedir |\n" +
          "|----------|-------------|-----------------|------------------|\n" +
          "| Arroz premium 1kg | 5 | 20 | 15 |\n" +
          "| Aceite de oliva 500ml | 3 | 15 | 12 |\n" +
          "| Monitor Samsung 24\" | 2 | 10 | 8 |\n\n" +
          "**Proveedor sugerido:** TechSupplies (electrónica), Distribuidora Alimentos del Valle (alimentos)\n\n" +
          "¿Quieres que detalle los precios de compra de cada producto?",
      },
    ],
  },
];