# WEB UX Architecture & Flows — UX-02

**Proyecto:** CEMiTool Cabernet Sauvignon × Pinot noir Explorer  
**Fecha:** 2026-09-22  
**Estado:** COMPLETE  
**Fase:** WEB-013 / UX-02  
**Entrada:** docs/WEB_UX_UI_AUDIT.md  
**Objetivo:** definir una arquitectura de información orientada a tareas humanas, con contexto persistente, rutas compartibles y separación clara entre lectura científica, exploración, operaciones y auditoría.

---

# 1. Decisión central

La nueva arquitectura no sigue las fases WEB ni la secuencia interna del pipeline.

Sigue cuatro preguntas del visitante:

1. **¿Qué estudió este proyecto y qué encontró?**
2. **¿Qué resultados puedo explorar?**
3. **¿Cómo se hizo?**
4. **¿Cómo compruebo de dónde sale cada afirmación?**

Estas preguntas se convierten en las cuatro familias de navegación primaria:

- Overview
- Results
- Methods
- Reproducibility

T-008, Chat, Search y GitHub pasan a ser utilidades, no destinos científicos equivalentes.

---

# 2. Audiencias y tareas

## A. Lector científico

### Objetivo
Entender el estudio sin conocer previamente la estructura del repositorio.

### Tareas
- entender la pregunta;
- identificar diseño y tejido;
- reconocer hallazgos principales;
- distinguir resultado de interpretación;
- conocer límites;
- profundizar solo si le interesa.

### Ruta dominante
Overview → Results → Module / Validation.

---

## B. Explorador / investigador

### Objetivo
Comparar y profundizar resultados.

### Tareas
- comparar módulos;
- seleccionar M5/M10/M2 u otro;
- ver trayectorias;
- revisar función;
- inspeccionar hubs/red;
- revisar evidencia externa;
- abrir genes.

### Ruta dominante
Results → Modules → Module Workspace.

---

## C. Revisor / auditor

### Objetivo
Verificar trazabilidad.

### Tareas
- identificar fuente;
- ver script;
- revisar parámetros;
- abrir commit/hash;
- navegar artefactos;
- reproducir la cadena de evidencia.

### Ruta dominante
Resultado → Evidence Drawer → Reproducibility.

---

## D. Equipo del proyecto

### Objetivo
Supervisar progreso y diagnosticar tareas operativas.

### Tareas
- revisar T-008;
- identificar corridas pendientes/fallidas;
- revisar cobertura del diseño;
- abrir ledger;
- consultar el proyecto mediante Chat.

### Ruta dominante
Status → T-008 y Ask.

---

# 3. Arquitectura global

## 3.1 Navegación primaria

### Overview
Resumen científico y narrativa corta.

### Results
Todo resultado explorable.

### Methods
Cómo se construyó la evidencia.

### Reproducibility
Cómo auditarla y reproducirla.

---

## 3.2 Navegación utilitaria

Siempre accesible pero visualmente secundaria:

- Search
- Ask
- T-008 Status
- GitHub
- versión/build

No deben competir visualmente con Overview/Results/Methods/Reproducibility.

---

# 4. Sitemap propuesto

\`\`\`text
/
└── Overview

/results
├── Modules
│   └── /modules/:moduleId
│       ├── overview
│       ├── trajectory
│       ├── function
│       ├── network
│       ├── validation
│       └── evidence
│
├── Validation
│   ├── overview
│   └── explore
│
└── Genes
    └── /genes/:geneId

/methods
├── Study design
├── Preprocessing
├── CEMiTool network
├── Statistical models
├── Functional enrichment
├── External validation
└── Modern reprocessing

/reproducibility
├── Evidence catalog
├── Data artifacts
├── Scripts
├── Parameters
└── Build / commits / hashes

/status/t008
└── T-008 monitor

/ask
└── Project assistant
\`\`\`

---

# 5. Rutas canónicas propuestas

La URL debe describir la tarea o entidad, no la fase de implementación.

| Función | Ruta propuesta |
|---|---|
| Overview | \`/\` |
| Results landing | \`/results\` |
| Modules | \`/results/modules\` |
| Module overview | \`/results/modules/M5\` |
| Module trajectory | \`/results/modules/M5/trajectory\` |
| Module function | \`/results/modules/M5/function\` |
| Module network | \`/results/modules/M5/network\` |
| Module validation | \`/results/modules/M5/validation\` |
| Module evidence | \`/results/modules/M5/evidence\` |
| Validation global | \`/results/validation\` |
| Genes index/search | \`/results/genes\` |
| Gene detail | \`/results/genes/:geneId\` |
| Methods | \`/methods\` |
| Reproducibility | \`/reproducibility\` |
| T-008 | \`/status/t008\` |
| Ask | \`/ask\` |

---

# 6. Compatibilidad con rutas actuales

No romper URLs ya compartidas.

Durante implementación se mantienen redirects:

| Ruta actual | Destino nuevo |
|---|---|
| \`/story\` | \`/\` con anchor/section Story o Overview |
| \`/modules\` | \`/results/modules\` |
| \`/modules/:moduleId\` | \`/results/modules/:moduleId\` |
| \`/enrichment\` | \`/results/modules/M5/function\` por defecto o \`/results/modules/:moduleId/function\` si existe contexto |
| \`/genes/:geneId\` | \`/results/genes/:geneId\` |
| \`/validation\` | \`/results/validation\` |
| \`/t008\` | \`/status/t008\` |
| \`/evidence\` | \`/reproducibility\` |
| \`/chat\` | \`/ask\` |
| \`/methods\` | se conserva |

Los redirects deben preservar query parameters cuando sea posible.

---

# 7. Navegación desktop

## Header

### Izquierda
Brand:
**CEMiTool Explorer**
Cabernet Sauvignon × Pinot noir

### Centro
- Overview
- Results
- Methods
- Reproducibility

### Derecha
- Search
- Ask
- T-008 Status
- GitHub

No mostrar códigos WEB en el header.

---

# 8. Navegación mobile

## Header compacto

Fila principal:
- brand;
- Search;
- Menu.

El menú abre un panel con:

### Principal
- Overview
- Results
- Methods
- Reproducibility

### Utilities
- Ask
- T-008 Status
- GitHub

Si el usuario está dentro de un módulo, debajo del header aparece una **Context Bar** compacta:

\`M5 · Network ▾\`

Al tocarla abre las secciones del módulo.

No usar scroll horizontal oculto como mecanismo principal de navegación.

---

# 9. Results como familia

Results no debe ser una lista de features técnicas.

Debe responder:

**“¿Qué resultados puedo explorar?”**

## Results landing

Tres entradas principales:

### Modules
Comparar la red M1–M10 y abrir un módulo.

### Validation
Revisar evidencia externa en piel aislada.

### Genes
Buscar genes priorizados y abrir fichas.

M5 puede aparecer destacado como finding principal, pero no como cuarto sistema paralelo.

---

# 10. Module Workspace

Esta es la pieza central de la nueva arquitectura.

## 10.1 Regla

Una vez que el usuario abre un módulo, **el módulo permanece como contexto**.

Ejemplo:

\`\`\`text
Results / Modules / M5

M5
[Overview] [Trajectory] [Function] [Hubs & Network] [Validation] [Evidence]
\`\`\`

Cambiar de tab/sección no debe perder M5.

---

## 10.2 Estructura común

### Overview
Debe responder:
- ¿qué es este módulo?
- ¿cuántos genes tiene?
- ¿tiene interacción Cultivar×Stage?
- ¿cómo se clasifica su robustez?
- ¿tiene enrichment?
- ¿tiene evidencia externa?
- ¿por qué debería importarme?

### Trajectory
- eigengene;
- stage × year;
- replicates opcionales;
- contrast matrix;
- descarga de datos.

### Function
- summary funcional;
- MapMan;
- GO;
- cobertura;
- annotation conflicts.

### Hubs & Network
- top hubs;
- búsqueda;
- Cytoscape;
- inspector;
- locus cuando aplique.

### Validation
- datasets externos;
- cobertura;
- concordancia;
- genes evaluables.

### Evidence
- claims del módulo;
- fuentes;
- scripts;
- parámetros;
- provenance completo.

---

## 10.3 M5 vs otros módulos

M5 puede tener contenido adicional:
- CHS/STS audit;
- NAC/CuAO;
- chr16;
- red rica.

Pero debe usar la misma carcasa de navegación.

Si una sección no aplica a M1/M3/etc., mostrar un estado explícito:
**“No hay validación externa preespecificada para este módulo”**
en lugar de eliminar la estructura.

---

# 11. Estado persistente y URLs

## Regla 1 — estado científico compartible

Todo estado que cambia la interpretación visible debería reflejarse en URL cuando sea razonable.

Ejemplos:

\`\`\`text
/results/modules/M5/trajectory?year=2013&replicates=1
/results/modules/M5/function?source=v5_mapman&scope=significant
/results/modules/M5/network?top=40&threshold=0.12&gene=VIT_...
/results/validation?dataset=GSE72421&module=M5
\`\`\`

---

## Regla 2 — filtros efímeros pueden permanecer locales

Ejemplos:
- panel abierto/cerrado;
- tooltip;
- hover;
- orden temporal no significativo.

---

## Regla 3 — Back/Forward debe reconstruir la vista

El navegador debe ser parte del modelo de navegación, no un accidente.

---

## Regla 4 — los links entre vistas deben transportar contexto

Desde M10 Function hacia Validation:

\`/results/modules/M10/validation\`

No enviar simplemente a \`/results/validation\` sin módulo.

---

# 12. Flujo 1 — Entender el estudio

## Persona
Lector nuevo.

## Entry points
- Home;
- link compartido;
- buscador web.

## Flujo

\`\`\`text
Overview
↓
Pregunta científica
↓
Diseño experimental
↓
Hallazgos principales
↓
M5 destacado
↓
Robustez interanual
↓
Función / fenoles
↓
Validación externa en piel
↓
Qué sabemos / qué no sabemos
↓
Explore Results
\`\`\`

## Reglas

- no exigir interacción para entender el argumento;
- no abrir tablas por defecto;
- términos técnicos tienen explicación breve;
- M5 se introduce como resultado antes de usarlo como etiqueta;
- límites aparecen junto a la afirmación relevante.

## Éxito

Una persona puede explicar:
- qué se comparó;
- qué tejido tiene el baseline;
- por qué M5 importa;
- por qué la validación externa es separada;
- qué falta confirmar.

---

# 13. Flujo 2 — Comparar módulos

## Entry
Results → Modules.

## Flujo

\`\`\`text
Results
↓
Modules comparison
↓
filtrar / ordenar
↓
seleccionar M5/M10/M2/otro
↓
Module Overview
\`\`\`

## Vista de comparación

No usar cards gigantes.

Preferir:
- tabla/matriz visual;
- filas por módulo;
- columnas clave;
- row select;
- panel de detalle opcional.

### Columnas prioritarias

- módulo;
- genes;
- Cultivar×Stage;
- robustez;
- enrichment;
- external evidence.

No inventar score total.

## Éxito

Comparar M5, M10 y M2 sin scroll excesivo ni recordar métricas de cards anteriores.

---

# 14. Flujo 3 — Explorar un módulo

## Entry
Módulo desde Results, Overview, Gene o Search.

## Flujo

\`\`\`text
Module Overview
├── Trajectory
├── Function
├── Hubs & Network
├── Validation
└── Evidence
\`\`\`

## Context Bar

Debe mostrar siempre:
- módulo;
- sección;
- estado importante.

Ejemplo:
\`M2 · Function · provisional hasta T-008\`

## Éxito

El usuario nunca tiene que recordar manualmente “estoy viendo M10”.

---

# 15. Flujo 4 — Explorar un gen

## Entry
- búsqueda global;
- hub ranking;
- network;
- annotation conflict;
- validation table.

## Flujo

\`\`\`text
Gene detail
↓
Identidad y anotación
↓
Módulo + rank
↓
Baseline
↓
rol en red
↓
evidencia externa
↓
annotation caveat
↓
Evidence
\`\`\`

## Estructura

### Header compacto
- Gene ID;
- aliases/annotation;
- module badge;
- rank.

### Summary
- por qué aparece;
- qué evidencia tiene.

### Baseline
- efecto/trayectoria relevante.

### Network
- kWithin/kME;
- vecinos/centralidad.

### External evidence
- evaluable/no evaluable;
- concordancia.

### Annotation
- conflicto cuando exista.

### Evidence
- provenance contextual.

## Regla
Nunca presentar un hub como regulador causal.

---

# 16. Flujo 5 — Validation global

## Entry
Results → Validation.

## Propósito
Comparar datasets externos y explicar qué pueden o no validar.

## Flujo

\`\`\`text
Validation Overview
↓
¿Qué pregunta responde cada dataset?
↓
resultado agregado
↓
seleccionar dataset
↓
scatter / concordancia
↓
genes
↓
data table opcional
↓
Evidence
\`\`\`

## Primer bloque obligatorio

Comparación simple:

| Dataset | Tejido | Plataforma | Condición principal | Uso |
|---|---|---|---|---|
| GSE72421 | piel | microarray | WW | evidencia externa |
| PRJNA260535 | piel | RNA-seq | 24 °Brix | evidencia externa |

La tabla exacta se alimentará de metadata canónica, no texto manual cuando exista fuente.

---

# 17. Flujo 6 — Auditar un resultado

## Entry
Cualquier claim, gráfico, tabla o finding.

## Interacción primaria

Botón:
**Evidence**

Abre un **Evidence Drawer** sin sacar al usuario del contexto.

## Drawer

### Claim
Qué afirmación se está auditando.

### Sources
TSV/resultados.

### Generated by
Scripts.

### Parameters
Parámetros pertinentes.

### Build
Commit + hashes.

### Actions
- Abrir archivo;
- Abrir script;
- Ver en Reproducibility.

## Deep link

El estado puede expresarse como:

\`?evidence=functional_enrichment\`

o equivalente.

Así el drawer también puede compartirse.

---

# 18. Flujo 7 — Reproducibility

## Entry
Header principal o Evidence Drawer.

## Landing

Debe responder:
**“¿Cómo puedo verificar y reproducir lo que veo?”**

## Secciones

- Claims
- Artifacts
- Data files
- Scripts
- Parameters
- Build provenance

La vista actual Evidence Browser se reutiliza, pero se reorganiza bajo este concepto.

---

# 19. Flujo 8 — T-008 Status

## Entry
Utility nav.

## Flujo

\`\`\`text
T-008 Status
↓
Ready / Not ready
↓
Progress
↓
Blockers
↓
Design coverage
↓
Problem runs
↓
Full ledger
↓
Events / provenance
\`\`\`

## Header de estado

Debe comunicar inmediatamente:

### Estado
**NOT READY — modern matrix incomplete**

### Progreso
x / 54.

### Consecuencia
No existe aún conclusión moderna de preservación.

No obligar al usuario a deducir esto desde varias cards.

---

# 20. Flujo 9 — Ask / Chat

## Rol

Chat es una utilidad transversal, no una sección científica primaria.

## Entry

- botón Ask en header;
- acción contextual “Ask about this”;
- ruta /ask para experiencia completa.

## Contexto permitido

Cuando el usuario abre Ask desde una vista, la UI puede enviar explícitamente:

\`\`\`json
{
  "route": "/results/modules/M5/network",
  "module": "M5",
  "selectedGene": "VIT_...",
  "dataset": null
}
\`\`\`

Este contexto debe ser visible para el usuario y no sustituye retrieval.

## Citas

Cada citation debe ser accionable:

- abrir Evidence;
- abrir archivo;
- identificar artifact.

No dejar citations como texto monoespaciado sin acción.

---

# 21. Search

## Búsqueda global propuesta

Search debe encontrar:
- módulo;
- gene ID;
- dataset;
- claim;
- artifact;
- método.

## Resultado

Agrupar por tipo:

### Results
M5, Validation.

### Genes
VIT_...

### Methods
Network construction.

### Evidence
module_contrasts.tsv.

No implementar búsqueda global hasta wireframes, pero reservar su lugar en arquitectura.

---

# 22. Breadcrumbs y Context Bar

## Breadcrumbs

Usar para jerarquía documental:

\`Results / Modules / M5\`

No repetirlos en Home.

## Context Bar

Usar para workspaces.

Ejemplo desktop:

\`\`\`text
M5   Overview | Trajectory | Function | Hubs & Network | Validation | Evidence
\`\`\`

Ejemplo mobile:

\`\`\`text
M5 · Hubs & Network  ▾
\`\`\`

Breadcrumb y Context Bar cumplen funciones distintas.

---

# 23. Jerarquía dentro de cada pantalla

Toda pantalla científica debe respetar:

## Nivel 1 — Answer
Una frase que diga qué debe entenderse.

## Nivel 2 — Evidence
Gráfico / resumen que lo sustenta.

## Nivel 3 — Explore
Filtros, comparaciones y búsqueda.

## Nivel 4 — Audit
Tabla, raw values, provenance.

No invertir ese orden sin una razón específica.

---

# 24. Reglas de tablas

Las tablas científicas siguen existiendo, pero cambian de rol.

## Desktop
- pueden abrirse inline;
- sticky header;
- búsqueda/filtros cuando corresponda.

## Mobile
- no mostrar tablas anchas como contenido inicial;
- usar “Ver datos”;
- drawer/full-screen horizontal cuando sea necesario;
- resúmenes/card rows solo si no deforman el significado.

No convertir datos tabulares complejos en cards si se pierde comparabilidad.

---

# 25. Reglas de filtros

## Desktop
FilterBar visible cuando la exploración lo requiere.

## Mobile
Botón “Filtros (n)” abre MobileFilterSheet.

## URL state
Persistir:
- module;
- dataset;
- year;
- enrichment source;
- network subset;
cuando cambien materialmente la vista.

## Reset
Siempre debe existir “Restablecer”.

---

# 26. Métodos

Methods deja de ser placeholder.

## Arquitectura propuesta

\`\`\`text
Methods
├── Study design
├── Input data
├── Preprocessing
├── CEMiTool
│   ├── beta selection
│   ├── modules
│   └── eigengenes
├── Statistics
├── Functional enrichment
├── External validation
└── Modern reprocessing T-008
\`\`\`

## Navegación
Desktop: índice lateral sticky.
Mobile: índice desplegable.

Cada sección enlaza sus scripts/evidence, pero no duplica todo Reproducibility.

---

# 27. Story

## Decisión

No mantener “Story” como destino primario independiente en v2.

La narrativa científica corta se integra en Overview.

Si más adelante se quiere una Story editorial larga, se puede mantener como contenido secundario enlazado desde Overview, pero no debe competir con Results.

Esto elimina duplicación Home/Story.

---

# 28. Enrichment

## Decisión

Enrichment deja de ser una sección global primaria.

Su hogar natural es:

\`Module Workspace → Function\`

La comparación transversal entre módulos puede existir dentro de Results/Modules como modo avanzado.

Esto resuelve pérdida de contexto y evita que el usuario tenga que seleccionar de nuevo el módulo.

---

# 29. Evidence

## Decisión

“Evidence” deja de ser término de navegación primaria.

La familia se llama **Reproducibility**.

Evidence sigue existiendo como:
- acción contextual;
- drawer;
- catálogo interno dentro de Reproducibility.

---

# 30. T-008

## Decisión

T-008 deja la navegación primaria.

Se ubica bajo **Status**, accesible como utilidad.

La etiqueta T-008 puede mantenerse porque identifica una línea real del proyecto, pero siempre acompañada por una descripción humana:
**Modern reprocessing status** / **Estado del reprocesamiento moderno**.

---

# 31. Chat

## Decisión

“Chat” se renombra en UI como **Ask** o **Preguntar**.

Se considera utilidad transversal.

Ruta completa:
\`/ask\`

Puede coexistir con un panel contextual en fases posteriores.

---

# 32. Política lingüística

## Interfaz
Español.

## Nombres científicos / estándares
Mantener original cuando sea correcto:
- CEMiTool;
- MapMan;
- GO;
- kWithin;
- kME;
- Salmon;
- FASTQ.

## Labels auxiliares
Traducir cuando no sean nombres propios:
- Story → Historia / absorbida por Overview;
- Evidence Browser → Reproducibilidad;
- Generated by → Generado por;
- Result / Input → Resultado / entrada;
- Ask puede evaluarse contra “Preguntar” en high-fi.

---

# 33. Política de códigos internos

## Ocultar de UI narrativa
- WEB-001...WEB-013.

## Mostrar solo cuando ayuden
- T-008: sí, acompañado por nombre humano;
- T-007/T-005A: provenance/methods, no headings de lectura general.

---

# 34. Flujo de navegación entre entidades

## Module → Gene
Conservar módulo como backlink/context:

\`/results/genes/VIT_...?from=M5\`

## Gene → Module
CTA:
“Ver en M5”.

## Module → Validation
Usar ruta del workspace:
\`/results/modules/M5/validation\`

## Validation global → Module
Permitir:
“Ver M5 en contexto”.

## Claim → Evidence
Drawer, no page jump obligatorio.

---

# 35. Diagrama de navegación principal

\`\`\`mermaid
flowchart TD
  O[Overview] --> R[Results]
  O --> M[Methods]
  O --> P[Reproducibility]

  R --> RM[Modules]
  R --> RV[Validation]
  R --> RG[Genes]

  RM --> MW[Module Workspace]
  MW --> MT[Trajectory]
  MW --> MF[Function]
  MW --> MN[Hubs & Network]
  MW --> MV[Validation]
  MW --> ME[Evidence]

  RG --> GD[Gene Detail]
  GD --> MW

  RV --> MW
  ME --> P

  U[Utilities] --> S[Search]
  U --> A[Ask]
  U --> T[T-008 Status]
  U --> G[GitHub]
\`\`\`

---

# 36. Journey map resumido

| Journey | Entrada | Resultado esperado | Máximo de decisiones importantes |
|---|---|---|---:|
| Entender estudio | Overview | comprender pregunta/hallazgo/límite | 1 |
| Comparar módulos | Results | elegir módulo informado | 2 |
| Explorar M5 | Module Workspace | recorrer evidencia sin perder contexto | 1 por sección |
| Explorar gen | Gene/Network/Search | comprender rol y evidencia | 2 |
| Validar hallazgo | Validation | distinguir baseline de piel | 2 |
| Auditar claim | Evidence action | llegar a fuente/script | 2 |
| Revisar T-008 | Status | saber readiness y blocker | 1 |
| Preguntar | Ask | respuesta grounded con fuente accionable | 1 |

---

# 37. Componentes estructurales derivados de UX-02

Los wireframes UX-03 deben contemplar:

- GlobalHeader
- MobileMenu
- UtilityNav
- Breadcrumb
- ContextBar
- ResultsLanding
- ModuleComparison
- ModuleWorkspace
- ModuleTabs
- ResultSummary
- FindingCallout
- FilterBar
- MobileFilterSheet
- ChartCard
- DataView
- DataTable
- EvidenceButton
- EvidenceDrawer
- LimitationCallout
- DatasetContext
- GeneSummary
- StatusHero
- AskLauncher

---

# 38. Reglas de implementación futura

1. No cambiar rutas y UI simultáneamente sin redirects.
2. No copiar datos científicos manualmente al nuevo layout.
3. No remover límites para simplificar visualmente.
4. No crear un score global de módulos.
5. No mezclar baseline y external validation.
6. No presentar T-008 como completo antes de 54/54 y pasos analíticos posteriores.
7. No hacer que una pestaña cambie contenido importante sin URL compartible.
8. No esconder provenance; moverlo a una capa contextual.
9. No publicar links hacia placeholders.
10. No implementar high-fi antes de aprobar wireframes.

---

# 39. Wireframes requeridos en UX-03

## Desktop + mobile

### W01 — Overview
Debe validar:
- pregunta;
- diseño;
- findings;
- M5;
- límites;
- CTA Results.

### W02 — Results / Modules
Debe validar:
- comparación M1–M10;
- filtros;
- selección;
- prioridad sin score.

### W03 — Module Workspace / M5
Debe validar:
- context bar;
- tabs/rutas;
- answer/evidence/explore/audit.

### W04 — Validation
Debe validar:
- separación datasets;
- baseline vs external;
- summary → scatter → detail.

### W05 — T-008 Status
Debe validar:
- readiness;
- blockers;
- progreso;
- ledger secundario.

### W06 — Reproducibility
Debe validar:
- claim → artifact → source/script.

### W07 — Methods
Debe validar:
- índice;
- profundidad;
- enlaces a provenance.

### W08 — Gene Detail
Debe validar:
- identidad;
- módulo;
- evidencia;
- network;
- external.

### W09 — Ask
Debe validar:
- utilidad transversal;
- contexto;
- citas accionables.

---

# 40. Criterios de aceptación UX-02

UX-02 se considera completo cuando:

- existe un sitemap único;
- la navegación primaria tiene máximo cuatro familias;
- T-008 y Chat están separados como utilidades;
- Story deja de competir como familia primaria;
- Enrichment se integra en Module Workspace;
- M5 y otros módulos comparten arquitectura;
- se definen rutas profundas compartibles;
- se preservan redirects de rutas existentes;
- Module context persiste entre secciones;
- Evidence puede abrirse contextualmente;
- se define política de query state;
- se especifican journeys principales;
- se define navegación mobile;
- se enumeran wireframes obligatorios.

---

# 41. Resultado

**UX-02 queda definido y listo para wireframing.**

La arquitectura objetivo reduce nueve destinos principales a cuatro familias, convierte Results en la entrada unificada a la exploración científica y transforma los módulos en workspaces persistentes y compartibles.

La siguiente fase es:

## UX-03 — Wireframes low-fidelity

Primero deben dibujarse:
1. Overview;
2. Results / Modules;
3. Module Workspace / M5;
4. Validation;
5. T-008 Status;
6. Reproducibility;
7. Methods;
8. Gene Detail;
9. Ask.

No se deben implementar todavía cambios estructurales en React hasta revisar estos wireframes.
