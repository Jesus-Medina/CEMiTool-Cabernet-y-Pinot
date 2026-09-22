# CEMiTool Cabernet–Pinot Explorer

Frontend del explorador científico interactivo del proyecto.

## Estado

WEB-001: scaffold de React + TypeScript + Vite. Todavía no consume datos científicos.

## Desarrollo

```bash
cd site
npm install
npm run dev
```

## Validación

```bash
npm run lint
npm run typecheck
npm run build
```

## GitHub Pages

Vite usa como base:

```text
/CEMiTool-Cabernet-y-Pinot/
```

El deployment se incorporará en WEB-012. Hasta entonces, este directorio es solo el frontend versionado y verificable.

## Regla científica

La UI no debe recalcular CEMiTool ni modelos estadísticos. WEB-002 añadirá un exportador que transforma tablas canónicas verificadas en datos de frontend.
