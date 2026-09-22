# Chatbot RAG del proyecto CEMiTool Cabernet-Pinot

Esta carpeta añade un chatbot científico al explorador web sin exponer la clave de Gemini en el navegador.

## Arquitectura

```text
GitHub Pages (React)
        |
        | POST /chat
        v
Cloudflare Worker (secreto GEMINI_API_KEY)
        |
        v
Gemini Interactions API + File Search
        |
        v
File Search store con fuentes canónicas del repositorio
```

La web sigue siendo estática en GitHub Pages. El Worker existe solo para proteger la API key y aplicar las reglas científicas del asistente.

## Qué está implementado

- ruta web `#/chat`;
- interfaz de chat responsive;
- respuestas con citas reales devueltas por File Search;
- límites científicos explícitos;
- proxy seguro en Cloudflare Worker;
- indexador reproducible de fuentes;
- manifiesto curado `source_manifest.txt`;
- soporte opcional para añadir PDFs/imágenes/documentos exportados desde NotebookLM;
- el build de GitHub Pages lee `VITE_CHAT_API_URL` desde una variable de Actions.

## Importante: no necesitamos el notebook para construir el RAG

Las fuentes canónicas del repositorio son preferibles porque tienen rutas, scripts y resultados trazables. Si quieres añadir material del notebook (por ejemplo el guion final, PDF o figuras), colócalo en una carpeta local y usa `--extra-dir` al indexar.

El video de NotebookLM no se indexa: File Search no usa audio/video como fuente RAG. El video puede integrarse aparte en la web.

## 1. Crear una API key de Gemini

Crea una API key en Google AI Studio.

No pegues esa clave:
- en React;
- en GitHub;
- en un archivo versionado;
- en `VITE_*`.

La clave solo vive como secreto del Worker y temporalmente en tu sesión local para indexar.

## 2. Indexar las fuentes

### Windows automático

Desde la raíz del repo:

```powershell
powershell -ExecutionPolicy Bypass -File .\chatbot\indexer\INDEXAR_FUENTES_WINDOWS.ps1
```

El script:
1. crea un entorno virtual;
2. instala `google-genai`;
3. solicita la API key sin mostrarla;
4. crea un File Search store;
5. indexa todas las rutas de `chatbot/source_manifest.txt`;
6. guarda SOLO el nombre del store en `chatbot/indexer/.file-search-store`.

### Manual

```powershell
cd chatbot\indexer
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:GEMINI_API_KEY="TU_CLAVE"
python index_sources.py --repo-root ..\..
```

Para añadir una carpeta con fuentes del notebook:

```powershell
python index_sources.py --repo-root ..\.. --extra-dir "C:\ruta\a\fuentes_notebook"
```

El indexador crea un store nuevo por defecto. Esto evita mezclar una indexación nueva con documentos obsoletos de una corrida anterior.

## 3. Desplegar el Worker

Necesitas una cuenta de Cloudflare. El Worker puede usar el plan gratuito para una demo pequeña.

### Windows automático

```powershell
powershell -ExecutionPolicy Bypass -File .\chatbot\worker\DEPLOYAR_WORKER_WINDOWS.ps1
```

El script instala Wrangler, abre el login de Cloudflare, configura:
- `GEMINI_API_KEY` como secreto;
- `GEMINI_FILE_SEARCH_STORE` como secreto;
- despliega el Worker.

El origen permitido de producción ya incluye:

```text
https://jesus-medina.github.io
```

y localhost para desarrollo.

## 4. Conectar GitHub Pages al Worker

Después del deploy copia la URL, por ejemplo:

```text
https://cemitool-cabernet-pinot-chat.<tu-subdominio>.workers.dev
```

En GitHub:

```text
Repositorio
-> Settings
-> Secrets and variables
-> Actions
-> Variables
-> New repository variable
```

Nombre:

```text
VITE_CHAT_API_URL
```

Valor: la URL del Worker, sin `/chat`.

Luego ejecuta de nuevo el workflow de Pages o haz un commit que afecte `site/**`.

## 5. Prueba del backend

```text
GET https://TU-WORKER.workers.dev/health
```

Debe responder algo equivalente a:

```json
{
  "ok": true,
  "storeConfigured": true,
  "apiKeyConfigured": true
}
```

La respuesta de health nunca revela la API key ni el nombre del store.

## 6. Desarrollo local

Crea `site/.env.local`:

```text
VITE_CHAT_API_URL=http://localhost:8787
```

Terminal 1:

```powershell
cd chatbot\worker
npm install
npx wrangler dev
```

Terminal 2:

```powershell
cd site
npm install
npm run dev
```

## Seguridad y límites

- La API key nunca llega al navegador.
- El Worker restringe CORS a los orígenes configurados.
- Se limita el tamaño de mensajes e historial.
- El asistente opera en modo stateless (`store=false`) para no depender del historial almacenado por Gemini.
- Para una web con tráfico alto conviene añadir Cloudflare Turnstile y rate limiting adicional.
- Las citas mostradas por React provienen de anotaciones reales de File Search, no de texto inventado por el modelo.

## Actualizar el RAG cuando cambie el proyecto

Cuando cambie una fuente científica importante:
1. actualiza `source_manifest.txt` si corresponde;
2. vuelve a ejecutar el indexador para crear un store nuevo;
3. actualiza el secreto `GEMINI_FILE_SEARCH_STORE` del Worker;
4. no es necesario tocar React.

Esto mantiene separada la capa científica de la interfaz.
