# CEMiTool Cabernet–Pinot Explorer

Frontend del explorador científico interactivo del proyecto.

## Estado

- WEB-001: scaffold React + TypeScript + Vite completado.
- WEB-002: capa canónica de exportación/validación en implementación.

La interfaz todavía no presenta gráficos científicos; primero se valida el contrato de datos.

## Desarrollo

```bash
cd site
npm install
python scripts/export_site_data.py
python scripts/validate_site_data.py
npm run dev
```

## Validación

El workflow `.github/workflows/site-check.yml` regenera los datos de frontend y ejecuta:

```bash
python scripts/export_site_data.py
python scripts/validate_site_data.py
npm run lint
npm run typecheck
npm run build
```

## GitHub Pages

Vite usa como base:

```text
/CEMiTool-Cabernet-y-Pinot/
```

El deployment público se incorporará en WEB-012.

## Regla científica

La UI no recalcula CEMiTool ni modelos estadísticos. `export_site_data.py` lee tablas canónicas, valida sus columnas, convierte NA de forma explícita y genera JSON de frontend junto con un manifiesto de provenance y hashes SHA-256.
