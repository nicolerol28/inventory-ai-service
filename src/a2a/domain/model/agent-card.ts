import type { AgentCard } from "./a2a.js";

export function buildAgentCard(baseUrl: string): AgentCard {
  return {
    name: "inventory-agent",
    description:
      "Agente de inventario que consulta productos, stock, movimientos, " +
      "categorías, proveedores y bodegas. Responde en español.",
    url: `${baseUrl}/a2a`,
    version: "1.0.0",
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    skills: [
      {
        id: "search-products",
        name: "Buscar productos",
        description:
          "Busca productos por nombre, categoría o unidad con filtros estructurados.",
      },
      {
        id: "semantic-search",
        name: "Búsqueda semántica",
        description:
          "Busca productos por concepto o uso mediante embeddings de IA. " +
          "Ejemplo: 'productos para cocinar', 'artículos de limpieza'.",
      },
      {
        id: "stock-query",
        name: "Consultar stock",
        description:
          "Consulta niveles de stock por producto y bodega, o todo el stock de una bodega.",
      },
      {
        id: "movements-query",
        name: "Consultar movimientos",
        description:
          "Consulta movimientos de inventario por producto, bodega, tipo o rango de fechas.",
      },
      {
        id: "catalog-query",
        name: "Consultar catálogos",
        description:
          "Consulta categorías, unidades de medida, bodegas y proveedores.",
      },
      {
        id: "purchase-report",
        name: "Reporte de compras sugeridas",
        description:
          "Genera un reporte de productos con stock bajo mínimo y sus proveedores sugeridos.",
      },
    ],
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    security: [{ bearerAuth: [] }],
  };
}