# WEB-013 — Auditoría UX/UI y rediseño del CEMiTool Explorer

**Estado:** IN PROGRESS  
**Inicio:** 2026-09-22  
**Objetivo:** rediseñar la experiencia del sitio sin alterar los resultados científicos ni el pipeline de datos.

---

## 1. Problema observado

El sitio actual es funcional y auditable, pero la experiencia está organizada principalmente por la estructura técnica/científica de implementación y no por las tareas reales del visitante.

Se observan síntomas recurrentes:

- demasiadas opciones de primer nivel en navegación;
- páginas muy largas con bloques de peso visual similar;
- jerarquía insuficiente entre hallazgo principal, evidencia secundaria y detalle técnico;
- mezcla de lenguaje de producto/desarrollo con lenguaje científico visible al usuario (WEB-00X, T-00X);
- repetición de hero + tarjetas + límites + tablas en muchas páginas;
- transición poco clara entre Story, módulos, enriquecimiento, validación y evidencia;
- tablas y controles dominan demasiado pronto la lectura;
- mobile resuelve overflow, pero no necesariamente una buena experiencia;
- falta una noción persistente de contexto: qué módulo, dataset o evidencia se está explorando;
- provenance y métodos tienen valor alto, pero compiten visualmente con la narrativa principal;
- el sitio parece una colección de dashboards separados en vez de una experiencia científica unificada.

La auditoría debe distinguir:
1. problemas de arquitectura de información;
2. problemas de flujo;
3. problemas de jerarquía visual;
4. problemas de interacción;
5. problemas de consistencia;
6. problemas de contenido/microcopy;
7. problemas de responsive y accesibilidad.

---

## 2. Principio de rediseño

No rediseñar pantalla por pantalla de forma aislada.

Orden obligatorio:

1. definir usuarios y tareas;
2. definir arquitectura de información;
3. diseñar flujos;
4. diseñar wireframes low-fi;
5. definir sistema visual;
6. diseñar pantallas high-fi;
7. prototipar interacciones críticas;
8. implementar componentes;
9. validar con QA UX y científico.

La capa científica canónica no cambia por razones visuales.

---

## 3. Audiencias principales

### A. Lector científico
Quiere responder rápidamente:
- ¿qué pregunta se estudió?
- ¿qué dataset se usó?
- ¿cuál es el hallazgo principal?
- ¿qué tan robusto es?
- ¿qué limitaciones tiene?

### B. Explorador / investigador
Quiere:
- comparar módulos;
- profundizar en M5/M10/M2;
- explorar genes/hubs;
- revisar enriquecimiento;
- contrastar evidencia externa.

### C. Revisor / auditor
Quiere:
- ver fuente exacta;
- revisar tablas;
- abrir scripts;
- conocer commit/hash;
- reproducir la cadena de evidencia.

### D. Equipo del proyecto
Quiere:
- revisar estado T-008;
- diagnosticar progreso;
- navegar resultados sin perder contexto.

Estas audiencias no deben recibir el mismo nivel de detalle al mismo tiempo.

---

## 4. Arquitectura de información propuesta

### Navegación primaria

**Overview**
- resumen científico;
- pregunta;
- diseño;
- hallazgos clave;
- límites.

**Results**
- módulos;
- M5 como caso principal;
- enriquecimiento;
- genes/hubs;
- validación externa.

**Methods**
- diseño;
- CEMiTool;
- modelos;
- validación;
- versiones y decisiones.

**Reproducibility**
- evidence/provenance;
- scripts;
- TSV;
- commits/hashes;
- descargas.

### Navegación secundaria / utilitaria

- T-008 status;
- buscador;
- chatbot/asistente;
- GitHub;
- versión del sitio.

T-008 no debe competir necesariamente con Resultados como destino primario para un lector externo.

---

## 5. Flujo principal propuesto

### Flujo 1 — “Entender el estudio”

Inicio
→ Pregunta científica
→ Diseño del experimento
→ Hallazgo principal
→ ¿Por qué M5 importa?
→ Robustez entre años
→ Función biológica
→ Evidencia externa en piel
→ Qué sabemos / qué no sabemos
→ Explorar detalles

Objetivo: llegar al núcleo del trabajo sin abrir tablas ni conocer CEMiTool previamente.

### Flujo 2 — “Explorar un módulo”

Results
→ Module overview
→ seleccionar módulo
→ Summary del módulo
→ Trayectoria
→ Robustez
→ Enriquecimiento
→ Hubs
→ Validación
→ Evidencia / provenance

El módulo debe ser el contexto persistente. Evitar obligar al usuario a saltar entre páginas independientes para reconstruirlo mentalmente.

### Flujo 3 — “Explorar un gen”

Módulo / buscador
→ ficha de gen
→ identidad/anotación
→ rol en red
→ efecto por año/etapa
→ evidencia externa
→ conflicto de anotación
→ fuente exacta

### Flujo 4 — “Auditar un resultado”

Cualquier gráfico/claim
→ botón Evidence
→ drawer/modal de provenance
→ fuente
→ script
→ parámetros
→ commit/hash
→ abrir Evidence completo si necesita más.

### Flujo 5 — “Revisar T-008”

Status utilitario
→ progreso global
→ alertas / bloqueos
→ cobertura del diseño
→ runs problemáticos
→ ledger detallado

La vista debe responder primero “¿está listo?” y después “¿qué run falla?”.

---

## 6. Nuevo mapa de pantallas

### 1. Overview
Una sola portada científica, no tres metáforas paralelas.

Orden sugerido:
1. título + pregunta;
2. visual experimental compacto;
3. 3 hallazgos principales;
4. M5 highlight;
5. robustez / validación;
6. límites;
7. CTA Explorar resultados.

### 2. Results / Modules
Vista comparativa compacta.
- módulos M1–M10;
- filtros;
- resumen visual;
- elegir módulo.

Evitar diez tarjetas enormes si una matriz/lista comparativa comunica mejor.

### 3. Module workspace
Una vista consistente para M1–M10 con tabs/subnav:
- Overview
- Trajectory
- Function
- Hubs / Network
- Validation
- Evidence

M5 puede tener contenido más rico, pero no una arquitectura totalmente distinta.

### 4. Gene detail
Página enfocada y corta:
- identidad;
- módulo/rank;
- annotations;
- baseline;
- external evidence;
- evidence.

### 5. Validation
Debe ser una comparación de evidencia externa, no otro dashboard genérico.
Primero:
- qué datasets;
- qué pregunta responde cada uno;
- resultado agregado;
después:
- scatter;
- genes;
- detalles técnicos.

### 6. Methods
Documentación navegable por secciones.
Evitar bloques de texto gigantes; usar índice lateral y diagramas.

### 7. Reproducibility / Evidence
Orientado a auditoría.
Puede ser más técnico porque esa es su función.

### 8. T-008 Status
Producto operativo separado del relato científico principal.

---

## 7. Sistema de navegación propuesto

Desktop:

CEMiTool Explorer
[Overview] [Results] [Methods] [Reproducibility]

lado derecho:
[Search] [T-008 status] [GitHub]

Dentro de Results:
Modules / Validation / Genes

Dentro de un módulo:
M5
Overview | Trajectory | Function | Network | Validation | Evidence

Mobile:
- header compacto;
- menú;
- context bar para módulo actual;
- filtros en bottom sheet/drawer;
- tablas como vistas secundarias, no contenido inicial.

---

## 8. Jerarquía de contenido

Cada pantalla debe responder en este orden:

### Nivel 1 — respuesta
¿Qué debo entender?

### Nivel 2 — evidencia visual
¿Qué gráfico/resultado lo sostiene?

### Nivel 3 — exploración
¿Qué puedo filtrar o comparar?

### Nivel 4 — auditoría
¿De dónde sale exactamente?

Actualmente varios lugares comienzan demasiado cerca del Nivel 3/4.

---

## 9. Componentes a rediseñar

- GlobalHeader
- ContextBar
- Breadcrumb
- ScientificHero
- FindingCard
- ResultSummary
- ModuleSelector
- ModuleTabs
- FilterBar
- ChartCard
- DataTable
- EvidenceDrawer
- LimitationCallout
- DatasetBadge
- StatusBadge
- EmptyState
- LoadingState
- MobileFilterSheet

Regla: un mismo concepto debe usar el mismo componente visual en todo el sitio.

---

## 10. Problemas específicos a auditar por pantalla

### Home
- exceso de metáforas STORY / EXPLORE / EVIDENCE;
- demasiados CTAs equivalentes;
- portal cards repiten navegación;
- el hallazgo principal no domina suficientemente.

### Story
- riesgo de convertirse en documento largo;
- falta de navegación por capítulos;
- poca transición explícita hacia resultados interactivos.

### Modules
- tarjetas grandes dificultan comparación;
- mezcla demasiadas métricas sin prioridad visual;
- prioridad M5/M10/M2 debe explicarse, no solo destacarse.

### Module detail / M5
- demasiadas capas en una sola página;
- controles, tabla, candidatos, red, chr16 y provenance compiten;
- necesita tabs o secciones ancladas con contexto persistente.

### Enrichment
- los filtros aparecen antes de explicar qué está viendo el usuario;
- ORA, cobertura, temas y conflicto de anotación requieren mayor separación conceptual;
- términos técnicos necesitan microcopy contextual.

### Validation
- necesita empezar por “qué valida cada dataset”;
- la tabla de hubs debe ser secundaria;
- visualmente debe separar mucho más baseline vs piel.

### T-008
- debe sentirse como monitor de estado;
- primero estado/global blocker;
- después runs;
- detalles del ledger al final.

### Evidence
- arquitectura adecuada para auditores, pero demasiado prominente para lectura normal;
- provenance debería poder abrirse contextual desde cualquier resultado.

---

## 11. Fases de ejecución

### UX-01 — Auditoría completa
- inventario de todas las pantallas;
- heurísticas;
- navegación;
- contenido;
- responsive;
- accesibilidad;
- inconsistencias;
- severidad P0/P1/P2/P3.

**Salida:** `docs/WEB_UX_UI_AUDIT.md`

### UX-02 — Arquitectura y flujos
- sitemap nuevo;
- user journeys;
- navegación primaria/secundaria;
- estructura de Module workspace.

**Salida:** `docs/WEB_UX_FLOWS.md`

### UX-03 — Wireframes
Wireframes desktop + mobile de:
- Overview;
- Results/Modules;
- Module workspace;
- Validation;
- T-008;
- Evidence.

No diseñar high-fi todavía.

### UX-04 — Design system
- paleta final;
- tipografía;
- spacing;
- grid;
- cards;
- buttons;
- status;
- tables;
- chart containers;
- responsive behavior.

### UX-05 — High-fidelity screens
Diseñar pantallas finales con datos reales.

### UX-06 — Prototype
Probar:
- entender estudio;
- explorar M5;
- abrir gen;
- auditar claim;
- revisar T-008.

### UX-07 — Implementación
Migrar por componentes, no reescribir todo de una vez.

### UX-08 — QA UX
- desktop;
- mobile;
- keyboard;
- readability;
- task completion;
- scientific fidelity.

---

## 12. Orden de diseño recomendado

1. Overview
2. Results / Modules
3. Module workspace M5
4. Validation
5. T-008
6. Evidence
7. Methods
8. Gene detail
9. resto de módulos

M5 será el patrón de Module workspace.

---

## 13. Criterio de éxito

La nueva interfaz debe permitir que una persona nueva:

- entienda la pregunta del estudio en < 60 s;
- identifique el hallazgo principal sin saber qué es M5 de antemano;
- llegue desde un hallazgo a su evidencia en <= 2 interacciones;
- explore un módulo sin perder contexto;
- distinga claramente resultado, interpretación y limitación;
- use móvil sin tablas dominando la experiencia;
- encuentre T-008 sin confundirlo con un resultado biológico final;
- audite cualquier claim importante sin leer el repositorio manualmente.
