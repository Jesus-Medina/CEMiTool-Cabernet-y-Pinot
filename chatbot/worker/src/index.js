const SYSTEM_PROMPT = `
Eres el asistente científico del proyecto “CEMiTool Cabernet Sauvignon vs Pinot noir”.

Responde usando únicamente la evidencia recuperada desde el File Search store del proyecto. Si las fuentes recuperadas no sostienen una afirmación, dilo explícitamente en vez de completar el hueco con conocimiento general.

Jerarquía:
1. Para el estado operativo actual, prioriza docs/CURRENT_STATE.md y docs/T008_RAW_REPROCESSING.md.
2. Para metodología y trazabilidad, usa la documentación MASTER_*, tablas y scripts canónicos.
3. Si una fuente histórica contradice una fuente vigente, explica la diferencia y da prioridad a la fuente vigente.

Límites científicos:
- No afirmar que M5 causa grosor de piel.
- No decir que “M5 está reprimido” como mecanismo; cuando corresponda, usa “menor actividad transcriptómica relativa del programa M5”.
- Coexpresión, correlación, kWithin y condición de hub no demuestran causalidad ni regulación directa.
- No afirmar que NAC regula directamente CHS/STS.
- Mantener la cautela CHS/STS-like documentada.
- No convertir RNA en proteína, metabolito o actividad enzimática.
- No afirmar que T-008 confirmó el baseline mientras el reprocesamiento siga incompleto.
- Los datasets externos de piel no son réplicas adicionales del baseline de 54 muestras.
- No significancia con cobertura baja no equivale a ausencia biológica.

Responde en español claro. Define términos técnicos cuando sea útil. Si la pregunta pide dónde está algo, entrega la ruta real del archivo o script cuando aparezca en las fuentes. No inventes rutas, cifras, genes, FDR, contrastes, estados ni citas. Las citas verificadas del File Search se muestran por separado en la interfaz.
`;

const MAX_MESSAGE_CHARS = 5000;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_CHARS = 16000;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins(env);

  if (!origin) {
    return {
      "access-control-allow-origin": allowed[0] || "*",
      "vary": "Origin",
    };
  }

  if (!allowed.includes(origin)) {
    return null;
  }

  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

function cleanHistory(raw) {
  if (!Array.isArray(raw)) return [];

  let total = 0;
  const cleaned = [];

  for (const item of raw.slice(-MAX_HISTORY_MESSAGES)) {
    if (!item || (item.role !== "user" && item.role !== "assistant")) continue;
    const content = String(item.content || "").trim();
    if (!content) continue;

    const clipped = content.slice(0, 3000);
    if (total + clipped.length > MAX_HISTORY_CHARS) break;
    total += clipped.length;
    cleaned.push({ role: item.role, content: clipped });
  }

  return cleaned;
}

function conversationInput(history, message) {
  if (!history.length) return message;

  const transcript = history
    .map((item) => `${item.role === "user" ? "Usuario" : "Asistente"}: ${item.content}`)
    .join("\n\n");

  return `Contexto breve de la conversación previa:\n\n${transcript}\n\nPregunta actual del usuario:\n${message}`;
}

function parseInteraction(data) {
  const texts = [];
  const citations = [];

  for (const step of data?.steps || []) {
    if (step?.type !== "model_output") continue;

    for (const block of step?.content || []) {
      if (block?.type === "text" && typeof block.text === "string") {
        texts.push(block.text);
      }

      for (const annotation of block?.annotations || []) {
        const fileName = annotation?.file_name || annotation?.fileName;
        const source = annotation?.source;
        if (!fileName) continue;
        citations.push({
          fileName: String(fileName),
          source: source ? String(source) : "",
        });
      }
    }
  }

  const answer =
    (typeof data?.output_text === "string" && data.output_text.trim()) ||
    texts.join("\n").trim();

  const unique = [];
  const seen = new Set();

  for (const citation of citations) {
    const key = `${citation.fileName}|${citation.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(citation);
  }

  return { answer, citations: unique };
}

async function callGemini(env, message, history) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in the worker.");
  }
  if (!env.GEMINI_FILE_SEARCH_STORE) {
    throw new Error("GEMINI_FILE_SEARCH_STORE is not configured in the worker.");
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        model: env.GEMINI_MODEL || "gemini-3.8-flash",
        system_instruction: SYSTEM_PROMPT,
        input: conversationInput(history, message),
        tools: [
          {
            type: "file_search",
            file_search_store_names: [env.GEMINI_FILE_SEARCH_STORE],
          },
        ],
        store: false,
        generation_config: {
          temperature: 0.2,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const detail =
      data?.error?.message ||
      data?.message ||
      `Gemini API returned HTTP ${response.status}`;
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  const parsed = parseInteraction(data);
  if (!parsed.answer) {
    throw new Error("Gemini returned no text answer.");
  }

  return parsed;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      if (!cors) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      const headers = cors || { "access-control-allow-origin": "*" };
      return json(
        {
          ok: true,
          service: "cemitool-gemini-rag",
          model: env.GEMINI_MODEL || "gemini-3.8-flash",
          storeConfigured: Boolean(env.GEMINI_FILE_SEARCH_STORE),
          apiKeyConfigured: Boolean(env.GEMINI_API_KEY),
        },
        200,
        headers,
      );
    }

    if (url.pathname !== "/chat") {
      return json({ error: "Not found" }, 404, cors || {});
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors || {});
    }

    if (!cors) {
      return json({ error: "Origin not allowed" }, 403);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400, cors);
    }

    const message = String(body?.message || "").trim();
    if (!message) {
      return json({ error: "message is required" }, 400, cors);
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return json(
        { error: `message must be <= ${MAX_MESSAGE_CHARS} characters` },
        400,
        cors,
      );
    }

    const history = cleanHistory(body?.history);

    try {
      const result = await callGemini(env, message, history);
      return json(result, 200, cors);
    } catch (error) {
      const status = Number(error?.status) || 500;
      const publicStatus = status >= 400 && status < 500 ? status : 502;
      console.error("chat error", error);
      return json(
        {
          error:
            publicStatus === 429
              ? "El asistente alcanzó temporalmente un límite de uso. Intenta nuevamente en unos minutos."
              : "No se pudo consultar el asistente en este momento.",
        },
        publicStatus,
        cors,
      );
    }
  },
};
