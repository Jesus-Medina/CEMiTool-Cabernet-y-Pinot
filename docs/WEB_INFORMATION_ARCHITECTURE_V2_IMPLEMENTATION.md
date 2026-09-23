# WEB Information Architecture V2 — Implementation Tracker

**Fuente de verdad:** `docs/WEB_INFORMATION_ARCHITECTURE_V2.md`  
**Estado:** IN PROGRESS  
**Inicio:** 2026-09-23

## Fases

| Fase | Estado | Alcance |
|---|---|---|
| F0 | DONE | Auditoría de arquitectura y definición V2 |
| F1 | CODE COMPLETE · QA PENDING | Resumen / Home visual y navegación primaria |
| F2 | TODO | Resultados M1–M10 |
| F3 | TODO | Module Workspace |
| F4 | TODO | Module Summary |
| F5 | TODO | Trajectory |
| F6 | TODO | Biología y red |
| F7 | TODO | Validación de módulo |
| F8 | TODO | Methods / Reproducibility / Gene Detail |
| F9 | TODO | QA UX completo |

## F1 — Resumen

### Objetivo

Replicar la dirección visual aprobada para la primera pantalla sin alterar resultados científicos.

### Decisiones

- navegación principal: Resumen / Resultados / Métodos / Reproducibilidad;
- Buscar y Preguntar como utilidades;
- hero editorial, no dashboard;
- datos de diseño visibles en Home;
- cuatro hallazgos principales;
- flujo visual del estudio;
- M5 como caso destacado, sin presentarlo como ranking;
- usar gráfico M5 real del repositorio;
- límites interpretativos visibles;
- preservar años y cifras desde datos canónicos aunque el mockup visual contenga texto ilustrativo distinto.

### Archivos previstos

- `site/src/pages.tsx`
- `site/src/global.css`
- `site/src/SiteShell.tsx` si el shell requiere ajustes visuales
- `site/public/assets/home/*`
- `site/tests/qa.spec.ts`

### QA requerido

- lint;
- typecheck;
- build;
- QA científico existente;
- Chrome / Firefox / mobile;
- overflow mobile;
- enlaces Home.

## Commits

- `17903b5` — crea tracker de implementación V2.
- `81da283` — publica asset visual del hero y gráfico M5 canónico para Home.
- `b573434` — reconstruye Home con la jerarquía científica aprobada.
- `0610d18` — alinea header con el mockup aprobado.
- `901f1f8` — replica el lenguaje visual editorial de la portada.
- `b7bcc68` — añade QA específico para la portada V2 y sus assets.

## Estado F1

Código terminado. Validaciones ya aprobadas:
- export canónico;
- validación de datos;
- scientific value QA;
- lint;
- TypeScript;
- build;
- bundle performance budget;
- checks del chatbot.

Pendiente al momento de este registro:
- instalación de navegadores del workflow;
- Chrome / Firefox / mobile QA;
- deploy final de GitHub Pages.
