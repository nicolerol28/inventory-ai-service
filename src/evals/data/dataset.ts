import type { EvalCase } from "../types.js";

// ============================================================
// Category: DIRECT — Exact queries using Java endpoints (~15)
// ============================================================
export const directCases: EvalCase[] = [
  {
    question: "¿Cuántos productos hay en total?",
    groundTruth: {
      expectedAnswer: "Hay 29 productos en total",
      expectedTools: ["searchProducts"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Cuáles son las categorías disponibles?",
    groundTruth: {
      expectedAnswer: "Las categorías son Electrónica, Alimentos y Limpieza",
      expectedTools: ["getCategories"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "Dame el detalle del producto con ID 1",
    groundTruth: {
      expectedAnswer:
        "Laptop Lenovo IdeaPad, SKU TECH-001, precio compra $2,500,000, precio venta $3,200,000, categoría Electrónica",
      expectedTools: ["getProductById"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Qué proveedores tenemos registrados?",
    groundTruth: {
      expectedAnswer:
        "TechSupplies S.A.S (Carlos Mejía), Distribuidora Alimentos del Valle (María López), Productos Limpios Ltda (Juan Torres)",
      expectedTools: ["getSuppliers"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Qué bodegas hay?",
    groundTruth: {
      expectedAnswer:
        "Bodega Principal (Cali), Bodega Norte (Bogotá), Bodega Sur (Medellín)",
      expectedTools: ["getWarehouses"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Qué unidades de medida existen?",
    groundTruth: {
      expectedAnswer: "Unidad (UND), Kilogramo (KG), Litro (LT)",
      expectedTools: ["getUnits"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Cuál es el precio de venta del Mouse Inalámbrico Logitech?",
    groundTruth: {
      expectedAnswer: "El precio de venta es $120,000",
      expectedTools: ["searchProducts"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "Muéstrame los productos de la categoría Electrónica",
    groundTruth: {
      expectedAnswer:
        "Laptop Lenovo, Mouse Logitech, Teclado Redragon, Monitor Samsung, Audífonos Sony, Disco Duro, Webcam Logitech, Hub USB-C, Tablet Samsung, Impresora HP",
      expectedTools: ["getCategories", "searchProducts"],
      maxToolCalls: 3,
    },
    category: "direct",
  },
  {
    question: "¿El producto con ID 29 está activo?",
    groundTruth: {
      expectedAnswer:
        "No, la Escoba Plástica Ref. 40 (ID 29) está inactiva",
      expectedTools: ["getProductById"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Cuántos productos de Limpieza hay?",
    groundTruth: {
      expectedAnswer: "Hay 9 productos en la categoría Limpieza",
      expectedTools: ["searchProducts"],
      maxToolCalls: 2,
    },
    category: "direct",
  },
  {
    question: "¿Cuál es el SKU del Arroz Diana 5kg?",
    groundTruth: {
      expectedAnswer: "El SKU es ALIM-001",
      expectedTools: ["searchProducts"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Cuál es el stock del producto 3 en la bodega 1?",
    groundTruth: {
      expectedAnswer: "Stock del Arroz Diana 5kg en Bodega Principal",
      expectedTools: ["getStock"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "Dame el stock completo de la Bodega Norte",
    groundTruth: {
      expectedAnswer: "Listado de stock de todos los productos en Bodega Norte",
      expectedTools: ["getStockByWarehouse"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Qué movimientos tiene el producto 1 en la bodega 1?",
    groundTruth: {
      expectedAnswer: "Historial de movimientos de Laptop Lenovo en Bodega Principal",
      expectedTools: ["getMovements"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
  {
    question: "¿Quién es el proveedor con ID 2?",
    groundTruth: {
      expectedAnswer:
        "Distribuidora Alimentos del Valle, contacto María López, teléfono 3109876543",
      expectedTools: ["getSupplierById"],
      maxToolCalls: 1,
    },
    category: "direct",
  },
];

// ============================================================
// Category: RAG — Conceptual queries using semantic search (~10)
// ============================================================
export const ragCases: EvalCase[] = [
  {
    question: "¿Qué productos tengo para cocinar?",
    groundTruth: {
      expectedAnswer:
        "Arroz Diana, Aceite Girasol, Harina de Trigo, Pasta Spaghetti, Sal Marina",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: [
        "Arroz Diana 5kg",
        "Aceite Girasol 1L",
        "Harina de Trigo 1kg",
        "Pasta Spaghetti 500g",
        "Sal Marina 1kg",
      ],
    },
    category: "rag",
  },
  {
    question: "¿Qué tengo para limpiar pisos?",
    groundTruth: {
      expectedAnswer:
        "Desinfectante Pino, Jabón Líquido Multiusos, Limpiapisos Fabuloso",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: [
        "Desinfectante Pino",
        "Jabón Líquido Multiusos",
        "Limpiapisos Fabuloso 1L",
      ],
    },
    category: "rag",
  },
  {
    question: "¿Tengo algo para trabajar desde casa?",
    groundTruth: {
      expectedAnswer:
        "Laptop Lenovo, Monitor Samsung, Teclado Redragon, Mouse Logitech, Webcam Logitech, Audífonos Sony",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: [
        "Laptop Lenovo IdeaPad",
        "Monitor Samsung 24",
        "Teclado Mecánico Redragon",
        "Mouse Inalámbrico Logitech",
        "Webcam Logitech C920",
      ],
    },
    category: "rag",
  },
  {
    question: "¿Qué bebidas hay disponibles?",
    groundTruth: {
      expectedAnswer: "Leche Entera Alquería, Café Molido Águila",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: [
        "Leche Entera Alquería 1L",
        "Café Molido Águila 500g",
      ],
    },
    category: "rag",
  },
  {
    question: "¿Qué productos sirven para desinfectar?",
    groundTruth: {
      expectedAnswer:
        "Desinfectante Pino, Blanqueador Concentrado, Jabón Líquido Multiusos",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: [
        "Desinfectante Pino",
        "Blanqueador Concentrado 1L",
        "Jabón Líquido Multiusos",
      ],
    },
    category: "rag",
  },
  {
    question: "¿Qué accesorios de computador tenemos?",
    groundTruth: {
      expectedAnswer:
        "Mouse Logitech, Teclado Redragon, Hub USB-C, Disco Duro Externo, Webcam Logitech",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: [
        "Mouse Inalámbrico Logitech",
        "Teclado Mecánico Redragon",
        "Hub USB-C 7 en 1",
        "Disco Duro Externo 1TB",
      ],
    },
    category: "rag",
  },
  {
    question: "¿Hay productos para el cuidado de la ropa?",
    groundTruth: {
      expectedAnswer: "Detergente en Polvo 2kg",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: ["Detergente en Polvo 2kg"],
    },
    category: "rag",
  },
  {
    question: "¿Qué productos de panadería tenemos?",
    groundTruth: {
      expectedAnswer: "Harina de Trigo 1kg, Azúcar Manuelita, Sal Marina",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: [
        "Harina de Trigo 1kg",
        "Azúcar Manuelita 5kg",
        "Sal Marina 1kg",
      ],
    },
    category: "rag",
  },
  {
    question: "¿Hay algo para conectar dispositivos?",
    groundTruth: {
      expectedAnswer: "Hub USB-C 7 en 1, Disco Duro Externo 1TB",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: [
        "Hub USB-C 7 en 1",
        "Disco Duro Externo 1TB",
      ],
    },
    category: "rag",
  },
  {
    question: "¿Qué enlatados tenemos?",
    groundTruth: {
      expectedAnswer: "Atún en Lata Van Camps 170g",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: ["Atún en Lata Van Camps 170g"],
    },
    category: "rag",
  },
];

// ============================================================
// Category: RAG-BOUNDARY — Ambiguous queries that test RAG vs endpoint (~10)
// ============================================================
export const ragBoundaryCases: EvalCase[] = [
  {
    question: "¿Qué productos me provee TechSupplies?",
    groundTruth: {
      expectedAnswer:
        "Los productos de TechSupplies incluyen Laptop Lenovo, Mouse Logitech, Teclado Redragon, Monitor Samsung, Audífonos Sony, Disco Duro, Webcam, Hub USB-C, Tablet Samsung, Impresora HP",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 2,
      expectedContext: ["TechSupplies"],
    },
    category: "rag-boundary",
  },
  {
    question: "¿Qué productos vende la Distribuidora Alimentos del Valle?",
    groundTruth: {
      expectedAnswer:
        "Arroz Diana, Aceite Girasol, Azúcar Manuelita, Leche Alquería, Harina de Trigo, Pasta Spaghetti, Sal Marina, Café Águila, Atún Van Camps, Panela",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 2,
      expectedContext: ["Distribuidora Alimentos del Valle"],
    },
    category: "rag-boundary",
  },
  {
    question: "Busca productos relacionados con tecnología",
    groundTruth: {
      expectedAnswer:
        "Laptop, Mouse, Teclado, Monitor, Audífonos, Disco Duro, Webcam, Hub USB-C, Tablet, Impresora",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: ["Electrónica"],
    },
    category: "rag-boundary",
  },
  {
    question: "¿Qué productos de aseo tenemos?",
    groundTruth: {
      expectedAnswer:
        "Jabón Líquido, Desinfectante Pino, Blanqueador, Limpiapisos Fabuloso, Esponjas, Detergente, Limpiavidrios, Guantes, Escoba",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: ["Limpieza"],
    },
    category: "rag-boundary",
  },
  {
    question: "¿Cuáles son los productos más caros?",
    groundTruth: {
      expectedAnswer:
        "Laptop Lenovo ($3,200,000), Audífonos Sony ($1,200,000), Impresora HP ($1,150,000), Tablet Samsung ($1,100,000)",
      expectedTools: ["searchProducts"],
      maxToolCalls: 1,
    },
    category: "rag-boundary",
  },
  {
    question: "¿Qué productos se miden en litros?",
    groundTruth: {
      expectedAnswer:
        "Aceite Girasol, Desinfectante Pino, Jabón Líquido, Leche Alquería, Blanqueador, Limpiapisos Fabuloso, Limpiavidrios Cristalín",
      expectedTools: ["searchProducts"],
      maxToolCalls: 2,
    },
    category: "rag-boundary",
  },
  {
    question: "¿Hay algún producto de Sony?",
    groundTruth: {
      expectedAnswer: "Sí, los Audífonos Sony WH-1000XM4",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: ["Sony WH-1000XM4"],
    },
    category: "rag-boundary",
  },
  {
    question: "Productos que sirven para el hogar",
    groundTruth: {
      expectedAnswer:
        "Productos de limpieza: Jabón, Desinfectante, Blanqueador, Limpiapisos, Esponjas, Detergente, Limpiavidrios, Guantes, Escoba",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: ["Limpieza"],
    },
    category: "rag-boundary",
  },
  {
    question: "¿Qué productos están inactivos?",
    groundTruth: {
      expectedAnswer:
        "Escoba Plástica Ref. 40, Impresora HP LaserJet, Panela 500g",
      expectedTools: ["searchProducts"],
      maxToolCalls: 1,
    },
    category: "rag-boundary",
  },
  {
    question: "Busca todo lo que tenga que ver con Samsung",
    groundTruth: {
      expectedAnswer: "Monitor Samsung 24\", Tablet Samsung Galaxy A8",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
      expectedContext: ["Samsung"],
    },
    category: "rag-boundary",
  },
];

// ============================================================
// Category: TOOL-CHAIN — Queries requiring multiple tools (~8)
// ============================================================
export const toolChainCases: EvalCase[] = [
  {
    question:
      "¿Cuál es el stock de los productos de Alimentos en la Bodega Principal?",
    groundTruth: {
      expectedAnswer:
        "Stock de productos de categoría Alimentos en Bodega Principal",
      expectedTools: ["getCategories", "searchProducts", "getStockByWarehouse"],
      maxToolCalls: 4,
    },
    category: "tool-chain",
  },
  {
    question: "Genera un reporte de compras para la Bodega Principal",
    groundTruth: {
      expectedAnswer:
        "Reporte con productos bajo mínimo en Bodega Principal y datos de proveedores",
      expectedTools: ["getWarehouses", "generatePurchaseReport"],
      maxToolCalls: 2,
    },
    category: "tool-chain",
  },
  {
    question:
      "¿Cuánto cuesta el producto más vendido de la Bodega Norte? Muestra sus movimientos",
    groundTruth: {
      expectedAnswer:
        "Precio y movimientos del producto con más movimientos en Bodega Norte",
      expectedTools: ["getStockByWarehouse", "getMovements", "getProductById"],
      maxToolCalls: 4,
    },
    category: "tool-chain",
  },
  {
    question: "¿Quién provee los productos de Electrónica y cuál es su teléfono?",
    groundTruth: {
      expectedAnswer:
        "TechSupplies S.A.S, contacto Carlos Mejía, teléfono 3001234567",
      expectedTools: ["getCategories", "searchProducts", "getSupplierById"],
      maxToolCalls: 4,
    },
    category: "tool-chain",
  },
  {
    question: "¿Cuál es el producto de Limpieza con mayor stock en la Bodega Sur?",
    groundTruth: {
      expectedAnswer:
        "Producto de limpieza con mayor stock en Bodega Sur",
      expectedTools: ["getStockByWarehouse"],
      maxToolCalls: 3,
    },
    category: "tool-chain",
  },
  {
    question:
      "Muéstrame los movimientos de tipo PURCHASE_ENTRY en la Bodega Principal del último mes",
    groundTruth: {
      expectedAnswer:
        "Movimientos de entrada por compra en Bodega Principal en el último mes",
      expectedTools: ["getWarehouses", "getMovementsByDateRange"],
      maxToolCalls: 3,
    },
    category: "tool-chain",
  },
  {
    question: "¿En qué bodega hay más Arroz Diana y cuánto hay?",
    groundTruth: {
      expectedAnswer:
        "Comparación de stock de Arroz Diana entre las 3 bodegas",
      expectedTools: ["searchProducts", "getStock"],
      maxToolCalls: 5,
    },
    category: "tool-chain",
  },
  {
    question:
      "¿Cuántos productos de la categoría Alimentos están bajo el mínimo en Bodega Principal?",
    groundTruth: {
      expectedAnswer:
        "Cantidad de productos de Alimentos bajo mínimo en Bodega Principal",
      expectedTools: ["getWarehouses", "getStockByWarehouse"],
      maxToolCalls: 3,
    },
    category: "tool-chain",
  },
];

// ============================================================
// Category: MEMORY — Multi-turn context retention (~5)
// ============================================================
export const memoryCases: EvalCase[] = [
  // Thread 1: Category context
  {
    question: "¿Qué productos hay en la categoría Alimentos?",
    groundTruth: {
      expectedAnswer: "Listado de productos en categoría Alimentos",
      expectedTools: ["searchProducts"],
      maxToolCalls: 2,
    },
    category: "memory",
    threadId: "eval-memory-thread-1",
    turnOrder: 1,
  },
  {
    question: "¿Cuántos eran?",
    groundTruth: {
      expectedAnswer: "10 productos en la categoría Alimentos",
    },
    category: "memory",
    threadId: "eval-memory-thread-1",
    turnOrder: 2,
  },
  // Thread 2: Product detail context
  {
    question: "¿Cuál es el stock del producto 5 en la bodega 1?",
    groundTruth: {
      expectedAnswer: "Stock de Jabón Líquido Multiusos en Bodega Principal",
      expectedTools: ["getStock"],
      maxToolCalls: 1,
    },
    category: "memory",
    threadId: "eval-memory-thread-2",
    turnOrder: 1,
  },
  {
    question: "¿Y cuál es su precio de venta?",
    groundTruth: {
      expectedAnswer: "El precio de venta del Jabón Líquido Multiusos es $22,000",
    },
    category: "memory",
    threadId: "eval-memory-thread-2",
    turnOrder: 2,
  },
  {
    question: "¿Quién es el proveedor?",
    groundTruth: {
      expectedAnswer: "Productos Limpios Ltda, contacto Juan Torres",
    },
    category: "memory",
    threadId: "eval-memory-thread-2",
    turnOrder: 3,
  },
];

// ============================================================
// Category: EDGE-CASE — Error handling, typos, ambiguity (~7)
// ============================================================
export const edgeCases: EvalCase[] = [
  {
    question: "¿Cuál es el stock del producto 999 en la bodega 1?",
    groundTruth: {
      expectedAnswer: "No se encontró el producto con ID 999",
      expectedTools: ["getStock"],
      maxToolCalls: 1,
    },
    category: "edge-case",
  },
  {
    question: "Busca productos de la categoría Ropa",
    groundTruth: {
      expectedAnswer: "No existe la categoría Ropa",
      expectedTools: ["getCategories"],
      maxToolCalls: 2,
    },
    category: "edge-case",
  },
  {
    question: "¿Qué es un producto?",
    groundTruth: {
      expectedAnswer:
        "Explicación general de qué es un producto en el contexto del inventario",
      maxToolCalls: 0,
    },
    category: "edge-case",
  },
  {
    question: "arroz",
    groundTruth: {
      expectedAnswer: "Información sobre Arroz Diana 5kg",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 1,
    },
    category: "edge-case",
  },
  {
    question: "Muestrame los productos del provvedor TechSuplies",
    groundTruth: {
      expectedAnswer:
        "Productos de TechSupplies (con typos corregidos): Laptop, Mouse, Teclado, Monitor, etc.",
      expectedTools: ["semanticSearch"],
      maxToolCalls: 2,
    },
    category: "edge-case",
  },
  {
    question: "",
    groundTruth: {
      expectedAnswer: "La pregunta no puede estar vacía",
      maxToolCalls: 0,
    },
    category: "edge-case",
  },
  {
    question: "¿Cuál es la capital de Colombia?",
    groundTruth: {
      expectedAnswer:
        "Respuesta indicando que es un asistente de inventario y no puede responder preguntas fuera de ese contexto",
      maxToolCalls: 0,
    },
    category: "edge-case",
  },
];

// ============================================================
// All cases combined
// ============================================================
export const allCases: EvalCase[] = [
  ...directCases,
  ...ragCases,
  ...ragBoundaryCases,
  ...toolChainCases,
  ...memoryCases,
  ...edgeCases,
];

// Helper to get cases by category
export function getCasesByCategory(
  category: EvalCase["category"],
): EvalCase[] {
  return allCases.filter((c) => c.category === category);
}

// Helper to get memory cases grouped by thread
export function getMemoryThreads(): Map<string, EvalCase[]> {
  const threads = new Map<string, EvalCase[]>();
  memoryCases
    .filter((c) => c.threadId)
    .sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0))
    .forEach((c) => {
      const cases = threads.get(c.threadId!) ?? [];
      cases.push(c);
      threads.set(c.threadId!, cases);
    });
  return threads;
}