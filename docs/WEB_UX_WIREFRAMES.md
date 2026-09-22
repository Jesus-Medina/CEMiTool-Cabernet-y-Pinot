# WEB UX Wireframes — UX-03

**Proyecto:** CEMiTool Cabernet Sauvignon × Pinot noir Explorer
**Fecha:** 2026-09-22
**Estado:** COMPLETE
**Fase:** WEB-013 / UX-03

## 1. Principios

Estos wireframes definen jerarquía, orden, navegación, progressive disclosure, responsive y relación entre resultados y evidencia. No fijan color, tipografía ni estilo visual final.

Orden obligatorio por pantalla: ANSWER → EVIDENCE → EXPLORE → AUDIT.

## 2. Shell global

### Desktop

┌──────────────────────────────────────────────────────────────────────────────┐
│ CEMiTool Explorer      Overview  Results  Methods  Reproducibility          │
│ Cabernet × Pinot                                  Search  Ask  T-008  GitHub │
└──────────────────────────────────────────────────────────────────────────────┘

Reglas: máximo 4 destinos principales; utilidades separadas; header sticky compacto; sin códigos WEB; sin scroll horizontal.

### Mobile

┌─────────────────────────────┐
│ CP  CEMiTool       Search ☰ │
└─────────────────────────────┘

El menú móvil contiene Overview, Results, Methods, Reproducibility y, en sección secundaria, Ask, T-008 Status y GitHub.

# W01 — Overview

Objetivo: entender pregunta, diseño, hallazgo principal, robustez y límites en menos de un minuto.

### Desktop

┌──────────────────────────────────────────────────────────────────────────────┐
│ OVERVIEW                                                                     │
│ Caracterización transcriptómica comparativa                                 │
│ Cabernet Sauvignon × Pinot noir                                             │
│ Pregunta científica resumida                                                │
│ [Explorar resultados]                         Baseline: 54 muestras          │
│                                                Pericarpio completo            │
├──────────────────────────────────────────────────────────────────────────────┤
│ DISEÑO EXPERIMENTAL                                                         │
│ Cabernet / Pinot × FruitSet → Veraison → Harvest × 2012/2013/2014 × reps    │
├──────────────────────────────────────────────────────────────────────────────┤
│ HALLAZGOS PRINCIPALES                                                       │
│ [01 M5] [02 Robustez interanual] [03 Evidencia externa en piel]             │
├──────────────────────────────────────────────────────────────────────────────┤
│ RESULTADO DESTACADO — M5                                                    │
│ [mini gráfico trayectoria]              resumen humano + caveat              │
│ [Abrir M5] [Evidence]                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ VALIDACIÓN: baseline pericarpio → evidencia independiente en piel            │
├──────────────────────────────────────────────────────────────────────────────┤
│ QUÉ SABEMOS / QUÉ NO SABEMOS                                                │
│ ✓ programas diferenciales  ✓ robustez  ✕ causalidad  ✕ grosor directo      │
└──────────────────────────────────────────────────────────────────────────────┘

Se elimina orbit STORY/EXPLORE/EVIDENCE, portal cards duplicadas y múltiples CTAs equivalentes.

### Mobile

Orden: título/pregunta → resumen diseño → flujo experimental → hallazgo M5 → evidencia externa → sabemos/no sabemos.

# W02 — Results / Modules

Objetivo: comparar módulos sin cards gigantes ni score inventado.

### Desktop

┌──────────────────────────────────────────────────────────────────────────────┐
│ RESULTS / MODULES                                                           │
│ [Modules] [Validation] [Genes]                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Summary: 10 módulos · prioritarios · significativos · enriched              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Filters + Search                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ MÓDULO │ GENES │ CULT×STAGE │ ROBUSTEZ │ FUNCTION │ EXTERNAL │ ACTION       │
│ M5     │ ...   │ strong     │ year-dep │ yes      │ yes      │ Open         │
│ M10    │ ...   │ ...        │ reproduc │ yes      │ yes      │ Open         │
│ M2     │ ...   │ ...        │ provisional│ ...    │ ...      │ Open         │
│ ...                                                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Selected module summary + [Abrir] [Evidence]                                │
└──────────────────────────────────────────────────────────────────────────────┘

### Mobile

Lista compacta por módulo con genes, Cult×Stage, robustez, function, external y Abrir. Filtros en sheet.

# W03 — Module Workspace / M5

Objetivo: mantener M5 como contexto mientras cambia la dimensión analítica.

### Shell desktop

Results / Modules / M5
M5 · 108 genes · estado de robustez
[Overview] [Trajectory] [Function] [Hubs & Network] [Validation] [Evidence]

### Overview

ANSWER: lectura principal del módulo.
Resumen: genes | FDR | robustez | hubs | enrichment | external.
Previews: trayectoria, función, red/hubs, validación.
Boundary: eigengene ≠ causalidad; hub ≠ regulador causal.

### Trajectory

[2012] [2013] [2014] [Todos] + mostrar réplicas
[TRAJECTORY CHART]
[Evidence] [Ver datos]
[CONTRAST MATRIX Stage × Year]

### Function

ANSWER → summary funcional → themes → Explore terms → Annotation audit CHS/STS → Evidence / Ver tabla.

### Hubs & Network

ANSWER → Top hubs → controles → Cytoscape + Inspector → chr16/locus → Evidence / edges.

### Mobile

Context Bar persistente: M5 · Network ▾. La red se presenta como preview + Abrir red en pantalla completa.

# W04 — Validation

Objetivo: explicar primero qué pregunta responde cada dataset y separar baseline de piel.

### Desktop

RESULTS / VALIDATION
Pregunta: ¿los candidatos del baseline encuentran apoyo independiente en piel?

Baseline: GSE98923 · pericarpio · 54 muestras
↓ comparación observacional
External: GSE72421 · piel | PRJNA260535 · piel

Dataset comparison → ANSWER agregado → filtros → scatter/concordance → [Evidence] [Ver genes] → tabla opcional → limitation.

### Mobile

Baseline → External → dataset cards compactas → resultado agregado → filtros → scatter → Ver genes / Evidence.

# W05 — T-008 Status

Objetivo: responder instantáneamente si el reprocesamiento está listo.

### Desktop

┌──────────────────────────────────────────────────────────────────────────────┐
│ STATUS / T-008                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ NOT READY · x/54 · No existe matriz moderna completa                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ Progress + PASS / FAIL / RUNNING / PENDING                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ BLOCKERS                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ DESIGN COVERAGE 2×3                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ PROBLEM RUNS                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ Full ledger [Abrir] · Events [Abrir] · Evidence                            │
└──────────────────────────────────────────────────────────────────────────────┘

### Mobile

NOT READY → x/54 → blockers → design coverage → problem runs → full ledger/evidence.

# W06 — Reproducibility

Objetivo: auditar claims y artefactos sin conocer la estructura del repo.

### Desktop

REPRODUCIBILITY
[Buscar claim, gen, archivo, script]
[Claims] [Artifacts] [Data] [Scripts] [Build]

Dos columnas: lista de claims a la izquierda; detail a la derecha con Claim, Sources, Generated by, Parameters, Commit/hash y Open GitHub.

### Evidence Drawer

Panel lateral contextual con Claim → Sources → Generated by → Parameters → Commit/hash → Open file → Full reproducibility.

En mobile el drawer pasa a bottom/full-screen sheet.

# W07 — Methods

Objetivo: documentación científica navegable, no placeholder.

### Desktop

Sidebar sticky: Study design, Input data, Preprocessing, CEMiTool, Statistics, Enrichment, Validation, T-008.
Content: explicación corta + diagrama + parámetros + Evidence + Script + siguiente sección.

### Mobile

Selector Section ▾ → contenido → Evidence/Script → Next.

# W08 — Gene Detail

Objetivo: ficha corta y útil.

### Desktop

Gene ID + annotation + module badge + rank + View in M5 + Evidence.
WHY THIS GENE.
Dos columnas: Network / Annotation.
Baseline.
External evidence.
Interpretation boundary.

### Mobile

Gene header → Why this gene → Network → Annotation → Baseline → External evidence → Boundary.

# W09 — Ask

Objetivo: utilidad contextual con citas accionables.

### Desktop

ASK / Pregúntale al proyecto
Contexto activo: M5 / Network [Quitar contexto]

Thread principal + sidebar de suggestions/limits.
Cada respuesta tiene Sources accionables: artifact, file, Open evidence, GitHub.
Composer al pie.

### Mobile

Contexto → thread → source cards → composer. Suggestions solo al inicio o vía botón.

## 3. Comportamientos transversales

- Acción uniforme para auditoría: Evidence.
- Acción uniforme para datos profundos: Ver datos.
- Un único patrón Interpretation boundary.
- El contexto activo siempre es visible: módulo, dataset, año o gen.
- Los filtros que cambian interpretación se reflejan en URL.
- Tablas anchas no aparecen por defecto en mobile.

## 4. Responsive

<=900 px: header móvil, ContextBar, filtros en sheet, columnas a una, sidebars no sticky.
<=620 px: tablas tras Ver datos, Cytoscape dedicado, Evidence full-screen si hace falta, charts priorizan lectura, sin headers gigantes, sin navegación horizontal escondida.

## 5. No se define todavía

Hex final, gradientes, sombras, tipografía, radios, iconografía, motion ni estilo final de charts. Eso corresponde a UX-04.

## 6. Cobertura de journeys

W01 Entender estudio; W02 Comparar módulos; W03 Explorar módulo; W04 Validación; W05 T-008; W06 Auditar claim; W07 Métodos; W08 Gen; W09 Preguntar.

## 7. Decisiones consolidadas

1. Overview absorbe la narrativa corta de Story.
2. Results es la entrada científica única.
3. Modules usa lista/matriz, no cards grandes.
4. M5 usa Module Workspace compartido.
5. Enrichment vive en Function.
6. Validation existe globalmente y dentro de módulo.
7. Evidence es contextual + Reproducibility profundo.
8. T-008 es Status.
9. Ask es utilidad transversal.
10. Gene Detail deja de ser placeholder.
11. Mobile usa ContextBar y sheets.
12. Tablas y provenance son capas de auditoría.

## 8. Criterios de aceptación UX-03

- wireframes desktop + mobile para W01–W09;
- journeys de UX-02 representados;
- shell global definido;
- Module Workspace definido;
- Evidence Drawer definido;
- responsive definido;
- progressive disclosure visible;
- sin decisiones visuales prematuras;
- sin cambios en datos científicos;
- listo para UX-04.

## 9. Resultado

**UX-03 queda completado a nivel low-fidelity.**

Siguiente fase: UX-04 — Design System: paleta, tipografía, grid, spacing, radius, elevation, surfaces, buttons, nav, context bar, filters, cards, callouts, badges, tables, charts, Evidence Drawer, sheets, estados y accesibilidad.