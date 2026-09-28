# CEMiTool Cabernet–Pinot Explorer

Frontend del explorador científico interactivo del proyecto.

## Estado

La versión estable incluye:

- resumen científico y comparación interactiva de módulos;
- exploración de M5, su red y el locus de cromosoma 16;
- enriquecimiento funcional MapMan v3/v5.1 y Gene Ontology con términos obsoletos filtrados;
- validación externa en piel, mantenida como evidencia observacional separada;
- reprocesamiento moderno de las 54 corridas y análisis de preservación con cobertura explícita;
- navegador de evidencia con fuentes, scripts, parámetros y hashes;
- síntesis científica integrada, manuscrito e informe técnico canónicos;
- validación responsive y multinavegador.

- GitHub Pages: `https://jesus-medina.github.io/CEMiTool-Cabernet-y-Pinot/`.

## Desarrollo

```bash
cd site
npm install
python scripts/export_site_data.py
python scripts/validate_site_data.py
python scripts/sync_public_reports.py
npm run dev
```

## Validación

El workflow `.github/workflows/site-check.yml` regenera los datos de frontend y ejecuta:

```bash
python scripts/export_site_data.py
python scripts/validate_site_data.py
python scripts/sync_public_reports.py
npm run lint
npm run typecheck
npm run build
```

## GitHub Pages

El deployment se realiza desde `.github/workflows/deploy-site.yml`.

Vite usa como base:

```text
/CEMiTool-Cabernet-y-Pinot/
```

La aplicación usa `HashRouter` para que rutas como M5, Story o Evidence funcionen al abrirse o recargarse directamente desde GitHub Pages sin depender de un servidor SPA.

El artifact publicado es `site/dist/`, generado después de reconstruir y validar los JSON científicos.

Pages ya está habilitado con **GitHub Actions**. Los cambios relevantes en datos científicos o frontend disparan el workflow de deployment automáticamente.

## Regla científica

La UI no recalcula CEMiTool ni modelos estadísticos. `export_site_data.py` lee tablas canónicas, valida sus columnas, convierte NA de forma explícita y genera JSON de frontend junto con un manifiesto de provenance y hashes SHA-256.


## Chat RAG

La ruta `#/chat` integra un asistente científico basado en Gemini File Search a través de un backend externo seguro.

El frontend nunca contiene la API key. En producción espera:

```text
VITE_CHAT_API_URL
```

El workflow de GitHub Pages inyecta esa variable desde **Settings → Secrets and variables → Actions → Variables**.

Si la variable no está definida, el sitio sigue compilando y la página de chat muestra un estado de configuración pendiente.

Implementación y despliegue:

```text
../chatbot/README.md
../docs/CHATBOT_RAG_IMPLEMENTATION.md
```
