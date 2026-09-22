# WEB UX/UI Audit — UX-01

**Proyecto:** CEMiTool Cabernet Sauvignon × Pinot noir Explorer  
**Fecha:** 2026-09-22  
**Estado:** COMPLETE  
**Fase:** WEB-013 / UX-01

## 1. Resumen ejecutivo

El sitio actual ya es técnicamente sólido en aspectos importantes: consume datos canónicos, expone provenance, tiene QA científico y browser QA, y contiene visualizaciones útiles.

El problema principal no es la ausencia de funcionalidades. La interfaz se construyó siguiendo la estructura de implementación y del pipeline científico, no la estructura mental del visitante.

Hoy el sitio presenta como destinos equivalentes Inicio, Story, Módulos, Enriquecimiento, Validación, T-008, Métodos, Evidencia y Chat. Eso obliga al visitante a conocer de antemano qué significa cada capa del proyecto y a reconstruir mentalmente cómo se relacionan.

La web se siente como una colección de dashboards especializados conectados por links, no como una experiencia científica unificada.

### Fortalezas a conservar

- datos canónicos y trazabilidad;
- límites científicos explícitos;
- resultados interactivos reales;
- buen control contra inferencias no justificadas;
- CI y QA técnico;
- evidencia externa separada del baseline;
- T-008 explícitamente incompleto;
- Evidence Browser útil para auditoría;
- Chat grounded como interfaz complementaria.

### Debilidades principales

- arquitectura de información orientada al pipeline;
- navegación primaria sobrecargada;
- jerarquía visual plana;
- exceso de dashboards largos;
- poca progressive disclosure;
- contexto perdido al navegar entre vistas;
- mezcla de lenguaje público con IDs internos;
- mobile técnicamente válido pero cognitivamente pesado;
- páginas públicas incompletas;
- sistema visual todavía provisional.

---

## 2. Alcance inspeccionado

Rutas públicas actuales:

1. /
2. /story
3. /modules
4. /modules/:moduleId
5. /modules/M5
6. /enrichment
7. /genes/:geneId
8. /validation
9. /t008
10. /methods
11. /evidence
12. /chat
13. fallback 404

Archivos principales inspeccionados:

- site/src/App.tsx
- site/src/SiteShell.tsx
- site/src/pages.tsx
- site/src/ModuleExplorerPage.tsx
- site/src/components/M5Explorer.tsx
- site/src/components/M5NetworkExplorer.tsx
- site/src/EnrichmentPage.tsx
- site/src/ExternalValidationPage.tsx
- site/src/T008DashboardPage.tsx
- site/src/EvidenceBrowserPage.tsx
- site/src/ChatPage.tsx
- global.css y CSS específicos.

También se consideraron los problemas responsive detectados y corregidos durante WEB-011.

---

## 3. Severidad

### P0 — blocker de release
Rompe una tarea prometida, crea un dead-end importante o presenta como terminada una experiencia que no lo está.

### P1 — problema mayor
Genera confusión, pérdida de contexto, alta carga cognitiva o mala arquitectura de interacción.

### P2 — problema moderado
Reduce legibilidad, consistencia, eficiencia, accesibilidad o calidad responsive.

### P3 — polish
Detalle visual que puede esperar hasta después de arquitectura y flujos.

---

# 4. Blockers P0

| ID | Área | Hallazgo | Acción |
|---|---|---|---|
| UX-001 | Métodos | /methods aparece como destino principal pero solo contiene “Métodos interactivos pendientes” | ocultar de navegación pública o completar la experiencia |
| UX-002 | Genes | enlaces reales desde M5/CHS-STS llevan a una ficha que todavía dice “Ficha completa pendiente” | completar ficha antes de promover esos links |
| UX-003 | Release | navegación pública no diferencia funcionalidades completas de secciones experimentales | definir estados y retirar destinos incompletos |

**Conclusión:** WEB-011 está verde técnicamente, pero el sitio todavía no debería considerarse una release UX estable.

---

# 5. Arquitectura de información y navegación

## UX-004 — P1 — nueve destinos principales tienen el mismo peso

La navegación contiene Inicio, Story, Módulos, Enriquecimiento, Validación, T-008, Métodos, Evidencia y Chat.

Problemas:
- mezcla narrativa, resultados, métodos, operaciones, auditoría y asistencia;
- no existe agrupación semántica;
- hace parecer que todas las capas tienen la misma importancia;
- obliga al usuario a entender la arquitectura interna antes de entender el estudio.

**Recomendación:** reducir la navegación primaria a aproximadamente:
- Overview
- Results
- Methods
- Reproducibility

Mover T-008, Chat, Search y GitHub a navegación utilitaria/contextual.

## UX-005 — P1 — la arquitectura sigue el pipeline, no las tareas

Un visitante piensa:
- ¿qué descubrieron?
- ¿qué tan robusto es?
- ¿qué significa?
- ¿qué genes participan?
- ¿cómo lo comprobaron?
- ¿de dónde sale este resultado?

No piensa primero en “Enriquecimiento”, “T-008” o “Evidence Browser”.

## UX-006 — P1 — falta contexto persistente dentro de un módulo

Ejemplo real:
M10 → “Abrir explorador de enriquecimiento” → /enrichment.

La ruta no conserva M10 como contexto. El visitante debe recordar el módulo y volver a configurarlo.

**Recomendación:** Module Workspace persistente o parámetros de ruta/query.

## UX-007 — P1 — no existen breadcrumbs/context bar

Falta una orientación visible como:
Results / Modules / M5 / Network

Esto perjudica rutas profundas y navegación transversal.

## UX-008 — P1 — navegación móvil es una fila horizontal escondida

primary-nav usa overflow horizontal y oculta scrollbar. No existe un menú móvil deliberado.

Problemas:
- destinos fuera de pantalla tienen baja discoverability;
- el usuario puede no saber que debe deslizar;
- header alto;
- no distingue navegación primaria de utilitaria.

## UX-009 — P2 — política idiomática inconsistente

Ejemplos:
- Story
- Interactive scientific explorer
- Functional enrichment
- skin-only
- Evidence Browser
- RESULT / INPUT
- GENERATED BY
- Chat

**Recomendación:** interfaz general en español; términos ingleses solo cuando sean nomenclatura científica útil.

## UX-010 — P1 — IDs internos aparecen como contenido público

Ejemplos:
- WEB-006
- WEB-007
- WEB-008
- WEB-009
- WEB-010
- T-005A
- T-007

Los códigos WEB son metadata de implementación y deberían quedar en provenance/docs, no como headings públicos.

---

# 6. Jerarquía visual y design system

## UX-011 — P1 — la paleta sigue declarada como provisional

global.css conserva el comentario “Provisional scaffold palette. Freeze exact presentation HEX values in WEB-000.”

El sistema visual todavía no está formalmente congelado.

## UX-012 — P1 — casi todas las páginas empiezan con un hero enorme

Home, Modules, M5, Enrichment, Validation, T-008, Evidence y Chat repiten heroes con títulos cercanos a 5.5–6rem.

Problemas:
- consumen el primer viewport;
- retrasan contenido útil;
- convierten cada ruta en una landing independiente;
- reducen sensación de workspace científico.

**Recomendación:** hero editorial grande solo en Overview. Headers compactos en workspaces.

## UX-013 — P1 — demasiados bloques tienen el mismo peso visual

Cards, warnings, summaries, filtros y resultados repiten borde, fondo, radius, padding y tamaños similares.

Resultado: jerarquía plana.

**Necesitamos tres niveles:**
1. hallazgo principal;
2. evidencia/análisis;
3. metadata/auditoría.

## UX-014 — P2 — sobreuso de cards

M1–M10 se comparan peor en tarjetas de gran altura que en una matriz/lista compacta.

## UX-015 — P2 — gradientes, sombras y radios no comunican función

Existe consistencia estética, pero no suficiente semántica visual.

## UX-016 — P2 — headlines demasiado grandes en vistas operativas

En Results, Validation, T-008 y Evidence el título compite con la tarea.

---

# 7. Progressive disclosure y carga cognitiva

## UX-017 — P1 — algunas pantallas empiezan demasiado cerca del detalle técnico

Orden ideal:
1. qué debo entender;
2. qué evidencia lo sostiene;
3. qué puedo explorar;
4. cómo audito el resultado.

Actualmente varias vistas comienzan con filtros, métricas, tablas o lenguaje del pipeline.

## UX-018 — P1 — falta un takeaway visible en páginas técnicas

Enrichment, Validation y T-008 necesitan una lectura principal explícita antes del explorador.

## UX-019 — P2 — límites científicos compiten visualmente con el resultado

Los límites son una fortaleza y deben conservarse, pero conviene estandarizarlos:
- caution local;
- boundary contextual;
- resumen global.

## UX-020 — P2 — vocabulario técnico aparece antes de suficiente microcopy

Eigengene, kWithin, kME, ORA, BH37/BH361, MapMan, unsigned network y mapping son correctos, pero necesitan progressive disclosure.

---

# 8. Home

## UX-021 — P1 — demasiados caminos compiten en el primer viewport

Home ofrece:
- Entrar a la historia;
- Explorar M5;
- Ver evidencia;
- STORY / EXPLORE / EVIDENCE;
- métricas;
- portales inferiores.

Pregunta demasiado pronto “¿a dónde quieres ir?” antes de consolidar “¿qué encontramos?”.

## UX-022 — P1 — STORY / EXPLORE / EVIDENCE duplica la arquitectura

El usuario debe aprender esa taxonomía y además el header de nueve secciones.

## UX-023 — P1 — el hallazgo principal no domina la portada

M5 aparece como “Foco actual” dentro de una métrica.

Overview debería priorizar:
pregunta → diseño → resultado → robustez → límites → explorar.

---

# 9. Story

## UX-024 — P1 — Story funciona como documento largo

Siete pasos se muestran linealmente sin:
- índice;
- chapters;
- deep links;
- estado de progreso;
- navegación siguiente/anterior contextual.

## UX-025 — P2 — Home y Story se solapan

Ambas explican pregunta, diseño, resultado y límites.

UX-02 debe decidir si Overview absorbe la story corta o Story se convierte en una narrativa editorial realmente distinta.

---

# 10. Modules

## UX-026 — P1 — tarjetas M1–M10 dificultan comparar

Cada módulo ocupa una card grande con muchas métricas.

Comparar diez módulos exige scroll y memoria.

**Recomendación:** module matrix/list compacta + detalle seleccionado.

## UX-027 — P1 — “prioridad” necesita explicación más directa

M5/M10/M2 reciben styling especial. Debe quedar claro por qué son prioritarios y que no existe un score científico total.

## UX-028 — P1 — se pierde contexto al saltar a Enrichment/Validation

Los links son globales y no preservan module state.

## UX-029 — P1 — M5 tiene arquitectura propia distinta del resto

M5 usa un explorador especial; los demás módulos usan otro patrón.

**Recomendación:** M5 debe ser la versión rica de un Module Workspace común.

---

# 11. M5 Explorer

## UX-030 — P1 — demasiadas herramientas en una sola página

M5 contiene:
- trayectorias;
- réplicas;
- contrastes;
- candidatos;
- hubs;
- conflicto CHS/STS;
- red;
- chr16;
- tablas;
- provenance.

Todo es útil, pero no todo necesita estar en una única jerarquía vertical.

**Recomendación:**
Overview | Trajectory | Function | Hubs/Network | Validation | Evidence

## UX-031 — P2 — Network ocupa demasiado viewport

Cytoscape usa 600 px desktop y 480 px mobile.

En móvil conviene preview + “Abrir red” + modo full-screen.

## UX-032 — P2 — locus chr16 depende de scroll horizontal

Puede mantenerse si se trata explícitamente como visualización zoom/pan y no como contenido convencional.

---

# 12. Enrichment

## UX-033 — P1 — aparece como herramienta antes de explicar la lectura principal

Fuente, módulo, scope y búsqueda llegan demasiado pronto.

Antes debería haber:
- qué pregunta responde ORA;
- resultado principal;
- cobertura;
- caution.

## UX-034 — P1 — mezcla varias capas conceptuales

Conviven:
- ORA por término;
- cobertura;
- temas preespecificados;
- GO auditado;
- conflicto v3/v5.1.

**Recomendación:** separar Summary, Explore terms y Annotation audit.

## UX-035 — P2 — tabla ancha aparece demasiado naturalmente en el flujo

scientific-table tiene min-width de 850 px.

Debe ser “Ver datos”, no interfaz primaria.

---

# 13. Validation

## UX-036 — P1 — falta explicar primero qué responde cada dataset

Antes de scatter/controles debería existir una comparación simple:
Dataset | tejido | plataforma | pregunta.

## UX-037 — P1 — baseline vs piel necesita distinción visual aún más inmediata

La separación científica está correcta. La UX debe reforzarla con contexto persistente y labels.

## UX-038 — P2 — tabla de genes debe ser secundaria

Es excelente para auditoría, no como lectura inicial.

---

# 14. T-008

## UX-039 — P1 — monitor operativo compite con resultados científicos

T-008 es status/pipeline, no un resultado equivalente a Modules o Validation.

## UX-040 — P1 — debe priorizar “¿está listo?” y “¿qué bloquea?”

Orden propuesto:
1. Ready / Not ready;
2. progreso;
3. blockers;
4. cobertura del diseño;
5. runs problemáticos;
6. ledger completo.

## UX-041 — P2 — ledger de 54 runs debe ser detalle secundario

Importante para reproducibilidad, pero no para la lectura primaria.

---

# 15. Evidence / Reproducibility

## UX-042 — P1 — Evidence es potente pero demasiado aislado

El usuario debería auditar un hallazgo sin abandonar su contexto.

**Recomendación:** Evidence Drawer contextual:
fuente → script → parámetros → commit/hash → abrir auditoría completa.

## UX-043 — P2 — labels de auditoría están en inglés técnico

Conviene normalizar idioma.

---

# 16. Chat

## UX-044 — P1 — Chat no debería competir como noveno destino principal

Es una herramienta transversal.

Puede vivir como:
- acción utilitaria en header;
- botón persistente;
- panel lateral;
- ruta secundaria.

## UX-045 — P1 — citas del Chat no son accionables

ChatPage renderiza citations como elementos code con fileName.

No existe una acción directa para:
- abrir evidencia;
- abrir archivo;
- saltar al resultado.

## UX-046 — P1 condicional — si VITE_CHAT_API_URL no existe, el destino principal no puede cumplir su tarea

La UI contempla correctamente el estado “Chat aún no conectado”, pero ese estado no debería ser navegación principal de una release pública.

## UX-047 — P2 — Chat no hereda contexto visible de la página actual

Si se pregunta desde M5, el asistente debería poder recibir de forma explícita:
- route;
- module;
- dataset;
- gene seleccionado.

---

# 17. Methods

## UX-048 — P0 — ruta pública incompleta

Methods es esencial para un proyecto científico y hoy es placeholder.

La futura página debería usar:
- índice lateral;
- diseño;
- preprocessing;
- network;
- statistics;
- enrichment;
- validation;
- T-008;
- links a scripts.

---

# 18. Gene detail

## UX-049 — P0 — affordance roto

La UI enlaza genes reales hacia una página que declara “Ficha completa pendiente”.

Debe corregirse antes de la release UX.

---

# 19. Mobile

WEB-011 resolvió overflow de documento. Eso no equivale a UX mobile-native.

## UX-050 — P1 — tablas siguen dependiendo de scroll horizontal

Es un fallback técnico válido, pero no debe ser la experiencia principal.

## UX-051 — P1 — navegación móvil necesita menú real

No una fila de links horizontal.

## UX-052 — P2 — visualizaciones complejas necesitan modos móviles propios

Especialmente:
- Cytoscape;
- chr16;
- matrices;
- tablas;
- filtros múltiples.

## UX-053 — P2 — heroes siguen ocupando demasiado espacio en móvil

El problema es estructural, no solo de tamaño tipográfico.

---

# 20. Accesibilidad

La QA actual comprueba main, nav, h1, nombres de controles y errores de rutas. Es una buena base, pero no sustituye una auditoría WCAG completa.

## UX-054 — P2 — falta skip link

Con header sticky y navegación larga sería útil para teclado.

## UX-055 — P2 — tablas no tienen un patrón común de caption/summary/mobile guidance

Debe diseñarse un DataTable accesible único.

## UX-056 — P2 — visualizaciones necesitan una estrategia accesible común

Algunas SVG ya usan title/desc, lo cual debe conservarse y estandarizarse.

---

# 21. Consistencia de interacción

## UX-057 — P1 — filtros no forman un sistema común

Modules, Enrichment, Validation, M5, Network y T-008 implementan controles separados.

**Recomendación:** componentes compartidos:
- FilterBar
- SegmentedControl
- SearchField
- FilterSheet

## UX-058 — P1 — filter state no se conserva consistentemente en URL

Consecuencias:
- no se comparte una vista exacta;
- se pierde contexto;
- back/forward representa mal la exploración.

## UX-059 — P2 — CTAs no tienen jerarquía global

“Abrir”, “Ver”, “Seguir explorando”, buttons secundarios e inline links necesitan reglas semánticas.

---

# 22. Qué debe conservarse

- provenance como principio central;
- límites científicos explícitos;
- fuentes canónicas;
- SVG accesibles y Cytoscape lazy;
- T-008 incompleto hasta 54/54 real;
- separación baseline vs validación externa;
- Evidence Browser como auditoría profunda;
- Chat grounded;
- colores redundantes con formas/labels cuando existan;
- QA científico actual.

---

# 23. Causas raíz

## A. Navegación construida por features
Cada fase WEB añadió otra ruta.

## B. Cada feature diseñó su propia landing
Hero + cards + panels se repiten.

## C. Falta workspace contextual
Módulo, gen y dataset no persisten.

## D. Falta progressive disclosure
Todo intenta aparecer en la misma página.

## E. Design system incompleto
Hay variables CSS, pero no sistema semántico formal.

## F. QA técnico antes que QA de tareas
WEB-011 valida frontend; falta validar journeys humanos.

---

# 24. Backlog priorizado

## Ola 1 — estructura
1. retirar/ocultar placeholders;
2. reducir navegación primaria;
3. definir sitemap;
4. ContextBar/Breadcrumb;
5. Module Workspace;
6. persistir module/dataset/filter state;
7. T-008 como Status;
8. Chat como utilidad transversal.

## Ola 2 — jerarquía
9. rediseñar Overview;
10. Modules como comparación compacta;
11. Result Summary;
12. Evidence Drawer;
13. reducir heroes;
14. separar summary/explore/audit;
15. FilterBar común.

## Ola 3 — mobile
16. menú móvil real;
17. filter sheet;
18. network full-screen;
19. tablas secundarias;
20. visualizaciones mobile específicas.

## Ola 4 — design system
21. paleta final;
22. typography scale;
23. spacing/grid;
24. semantic surfaces;
25. status/badges;
26. callouts;
27. chart containers;
28. focus/accessibility.

---

# 25. Pantallas y magnitud del rediseño

| Pantalla | Contenido reutilizable | Rediseño estructural |
|---|---:|---:|
| Home | Sí | Alto |
| Story | Parcial | Alto |
| Modules | Sí | Alto |
| Module Detail | Sí | Alto |
| M5 | Sí | Crítico |
| Enrichment | Sí | Alto |
| Validation | Sí | Alto |
| T-008 | Sí | Alto |
| Evidence | Sí | Moderado |
| Chat | Sí | Moderado |
| Methods | Incompleto | Crear |
| Gene Detail | Incompleto | Crear |

---

# 26. Hipótesis para UX-02

No se implementan todavía. Se validan en arquitectura y flujos.

## Navegación primaria
- Overview
- Results
- Methods
- Reproducibility

## Utilidades
- Search
- Ask / Chat
- T-008 Status
- GitHub

## Results secondary nav
- Modules
- Validation
- Genes

## Module Workspace
- Overview
- Trajectory
- Function
- Hubs / Network
- Validation
- Evidence

---

# 27. Criterios de resolución

La arquitectura nueva debe permitir que:

1. un visitante entienda la pregunta en menos de un minuto;
2. descubra el hallazgo M5 sin conocer “M5” antes;
3. Results tenga una entrada clara;
4. un módulo permanezca como contexto;
5. ninguna ruta pública importante termine en placeholder;
6. mobile no dependa del header horizontal;
7. las tablas sean detalle, no interfaz primaria;
8. Evidence esté a máximo dos interacciones;
9. Chat tenga citas accionables;
10. T-008 se entienda como operativo/incompleto;
11. exista una sola política lingüística;
12. desaparezcan códigos WEB internos de la narrativa;
13. el sistema visual use tokens finales.

---

# 28. Resultado

**UX-01 queda completado.**

El próximo trabajo correcto no es seguir retocando CSS de páginas individuales.

La siguiente fase es:

## UX-02 — Arquitectura de información y flujos

Debe producir:
- sitemap nuevo;
- jerarquía primaria/secundaria;
- user journeys;
- flujo Overview → Results;
- flujo Module Workspace;
- flujo Gene;
- flujo Evidence;
- flujo T-008;
- integración de Chat;
- reglas de persistencia de contexto.

Después de UX-02 se construyen wireframes.
