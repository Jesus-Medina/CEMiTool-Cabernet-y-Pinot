# CEMiTool Cabernet–Pinot Explorer

Frontend del explorador científico interactivo del proyecto.

## Estado

- WEB-001: scaffold React + TypeScript + Vite completado.
- WEB-002: capa canónica de exportación/validación completada.
- WEB-003: Home + Story conectadas a datos reales.
- WEB-004: M5 Explorer interactivo completado.
- WEB-005: red Cytoscape M5 + locus chr16 completados.
- WEB-006: enriquecimiento funcional MapMan v3/v5.1 + GO T-005A completado.
- WEB-008: validación externa skin-only completada.
- WEB-009: dashboard vivo T-008 completado; refleja el estado canónico actual sin inferir preservación.
- WEB-010: navegador de evidencia y provenance completado.
- WEB-011: QA científica, responsive y multinavegador completada.
- WEB-012: la versión estable incorpora la **Síntesis científica integrada**, publicación automática del manuscrito/informe canónicos y el estado final 54/54 del reprocesamiento moderno.
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
