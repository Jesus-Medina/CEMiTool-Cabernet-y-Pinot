# Plan maestro de implementación UX/UI — CEMiTool Explorer

**Estado:** ACTIVO  
**Fecha base:** 2026-09-23  
**Alcance:** arquitectura de información, sistema visual, navegación, presentación científica, recuperación de funcionalidades históricas y QA UX.  
**Siguiente tarea ejecutable:** `UX05B-02 — Convertir cards M1–M10 en comparación compacta y accesible`.

Este documento es la fuente operativa para implementar el rediseño por fases. Complementa, pero no reemplaza, la auditoría, los flujos y los wireframes existentes:

- `docs/WEB_UX_UI_AUDIT.md` — problemas y causas raíz;
- `docs/WEB_UX_UI_AUDIT_REDESIGN_PLAN.md` — dirección del rediseño;
- `docs/WEB_UX_FLOWS.md` — arquitectura, journeys y reglas de navegación;
- `docs/WEB_UX_WIREFRAMES.md` — jerarquía low-fidelity;
- este archivo — tareas, dependencias, criterios de aceptación y orden de ejecución.

---

## 1. Resultado que debe producir el rediseño

El sitio debe funcionar simultáneamente como:

1. **resumen científico:** permite entender pregunta, diseño, hallazgo principal, robustez y límites en menos de un minuto;
2. **explorador:** permite comparar módulos, profundizar en M5/M10/M2, explorar genes, función, redes y validación;
3. **registro auditable:** conecta cada claim con fuente, script, parámetros, commit y archivos descargables;
4. **estado de proyecto:** comunica T-008 sin presentarlo como resultado biológico terminado.

La interfaz debe organizarse según las preguntas del visitante, no según el orden histórico del pipeline ni según la fecha en que se añadió cada feature.

---

## 2. Invariantes científicos y de producto

Ningún cambio visual puede modificar o insinuar cambios en estas condiciones:

- baseline GSE98923: 54 muestras, 2 cultivares × 3 etapas × 3 años × 3 réplicas;
- tejido primario: pericarpio completo, no piel aislada;
- beta 10 es la red principal y beta 7 la sensibilidad;
- la evidencia externa de piel no aumenta el N=54;
- eigengene, coexpresión, hub y proximidad genómica no implican causalidad;
- GSE98923 no mide grosor de piel;
- Year debe permanecer explícito;
- T-008 sigue incompleto hasta cumplir sus criterios científicos, aunque llegue a 54/54 descargas;
- la UI consume resultados canónicos: no recalcula CEMiTool ni inventa scores agregados.

Las mejoras deben conservar URL state, provenance, descargas, tablas completas, NA explícitos y límites interpretativos.

---

## 3. Diagnóstico base verificable

La auditoría del 2026-09-23 fija este punto de partida:

- 7 archivos CSS, 8.722 líneas en total;
- 379 declaraciones `font-size` y 123 valores diferentes;
- 160 declaraciones menores de `0.75rem`;
- Home usa Georgia como identidad editorial y las vistas internas se presentan principalmente en Inter;
- M5 reúne aproximadamente 20 headings, 17 botones y 4 tablas en una sola página;
- existen demasiadas capas simultáneas de contexto, navegación y acciones antes de la evidencia principal;
- el sitio conserva datos y herramientas potentes, pero la experiencia está fragmentada por features.

Este baseline se utilizará para demostrar reducción de complejidad, no sólo cambio estético.

---

## 4. Principios obligatorios de diseño

### 4.1 Orden científico común

Toda vista científica debe ordenar su contenido así:

1. **Respuesta:** qué debe entender el visitante;
2. **Evidencia:** qué visualización o resultado sostiene la respuesta;
3. **Exploración:** qué puede filtrar, comparar o inspeccionar;
4. **Auditoría:** de dónde sale exactamente el resultado.

### 4.2 Progressive disclosure

- La conclusión y su límite aparecen antes que filtros, tablas y provenance detallado.
- Las tablas completas y artefactos de auditoría son accesibles, pero no dominan el primer viewport.
- No se repite la misma advertencia en cinco cards; se usa un `LimitationCallout` consistente y contextual.
- Los IDs internos sólo aparecen cuando ayudan a buscar, reproducir o auditar.

### 4.3 Consistencia

- Un concepto usa el mismo nombre, componente y jerarquía en todas las rutas.
- Navegación primaria estable en desktop y menú real en tablet/móvil.
- Los mismos estados científicos usan los mismos badges y colores.
- Las mismas acciones usan los mismos verbos: `Explorar`, `Comparar`, `Ver datos`, `Auditar evidencia`, `Descargar`.

### 4.4 Accesibilidad y legibilidad

- cuerpo base de 16–18 px;
- metadata no menor de 13 px salvo excepciones justificadas en gráficos;
- contraste y foco visibles;
- color nunca es la única señal;
- tablas con caption/resumen y alternativa móvil;
- visualizaciones con título, cómo leer, takeaway, fuente y fallback tabular.

---

## 5. Arquitectura de información objetivo

### Navegación primaria

1. **Resumen** — pregunta, diseño, hallazgos, robustez y límites.
2. **Resultados** — comparación de módulos, module workspace, validación y genes.
3. **Métodos** — diseño, preprocessing, CEMiTool, beta, modelos, versiones y decisiones.
4. **Reproducibilidad** — claims, fuentes, scripts, parámetros, commits, hashes y descargas.

### Utilidades

- Buscar;
- Preguntar;
- Estado del reprocesamiento moderno — T-008;
- GitHub;
- versión/build del sitio.

### Familia Resultados

```text
Resultados
├── Comparar módulos
├── Module Workspace
│   ├── Resumen
│   ├── Trayectoria
│   ├── Función
│   ├── Hubs y red
│   ├── Validación
│   └── Evidencia
├── Validación global
└── Genes
```

`Enrichment` deja de competir como destino global primario: su hogar normal es `Module Workspace → Función`. `Evidence` pasa a llamarse `Reproducibilidad` en navegación y se mantiene además como acción contextual. `T-008` y `Preguntar` son utilidades, no resultados científicos equivalentes a M5.

---

## 6. Sistema visual objetivo

### Tipografía propuesta

- **Source Serif 4:** títulos editoriales, hallazgos y narrativa científica;
- **Inter:** cuerpo, navegación, controles, tablas y gráficos;
- **monospace del sistema:** IDs, coordenadas, hashes, commits y rutas.

La tipografía serif debe extender la identidad de Home al resto del sitio sin convertir controles y tablas en piezas editoriales.

### Escala inicial a validar

| Token | Uso | Valor inicial |
|---|---|---:|
| `display` | hero principal de Resumen | `clamp(2.75rem, 5vw, 4.75rem)` |
| `h1` | título de página | `clamp(2.25rem, 4vw, 3.75rem)` |
| `h2` | sección científica | `clamp(1.6rem, 2.5vw, 2.4rem)` |
| `h3` | card/panel | `1.25rem` |
| `body-lg` | lede/takeaway | `1.125rem` |
| `body` | lectura general | `1rem` |
| `small` | ayuda/metadata | `0.875rem` |
| `micro` | uso excepcional | `0.8125rem` |

### Componentes semánticos mínimos

`GlobalHeader`, `UtilityNav`, `Breadcrumb`, `DatasetContext`, `ModuleContext`, `PageIntro`, `FindingSummary`, `ResultSummary`, `ModuleTabs`, `FilterBar`, `ChartCard`, `DataTable`, `DatasetBadge`, `StatusBadge`, `LimitationCallout`, `EvidenceAction`, `EvidenceDrawer`, `EmptyState`, `LoadingState`, `MobileFilterSheet`.

No se aceptan nuevos estilos de card, badge, hero o filtro fuera de estos patrones sin registrar primero la necesidad.

---

## 7. Recuperación de versiones anteriores

| Elemento histórico | Decisión | Destino |
|---|---|---|
| Story científica de siete pasos | Recuperar e integrar | Resumen, no ruta primaria duplicada |
| Diseño 2×3×3 y flujo de etapas | Recuperar | Resumen + Métodos |
| “Qué sabemos / qué no sabemos” | Recuperar | Resumen y límites contextuales |
| Module Workspace con tabs | Recuperar y ampliar | Todas las rutas de módulo |
| Guías “cómo interpretar” | Recuperar | Encabezado de charts/tablas complejas |
| Evidence Browser | Conservar | Reproducibilidad + drawer contextual |
| Enrichment global | Reubicar | Función del módulo; comparación avanzada opcional |
| Chat grounded | Conservar como utilidad | Preguntar; ocultar CTA principal si no hay endpoint |
| Dashboard T-008 | Conservar y simplificar | Status, separado de resultados biológicos |
| Heroes enormes repetidos | Eliminar | Sólo Resumen usa hero editorial dominante |
| Cards equivalentes para todo | Reducir | Superficies según función, no decoración |

Commits históricos útiles para consulta, no para restauración ciega: `abeb5e4` (Home + Story), `b940af4` (M5 inicial), `37e868a` (módulos), `e6845b8` (Evidence) y `97a6e50` (Module Workspace).

---

## 8. Fases y tareas

Los estados permitidos son `PENDING`, `IN PROGRESS`, `BLOCKED` y `DONE`. Una tarea sólo pasa a `DONE` cuando cumple sus criterios y deja evidencia de validación.

### Fase UX-04 — Design system y shell global

**Objetivo:** detener la divergencia visual antes de rediseñar más páginas.

| ID | Estado | Tarea | Dependencia |
|---|---|---|---|
| UX04-01 | DONE | Crear tokens tipográficos, cargar Source Serif 4, normalizar Inter y eliminar tamaños arbitrarios del shell | — |
| UX04-02 | DONE | Definir tokens semánticos de color, superficies, bordes, estados y foco | UX04-01 |
| UX04-03 | DONE | Definir spacing, grid, anchos de lectura y densidades responsive | UX04-01 |
| UX04-04 | DONE | Construir primitivas comunes: botones, badges, callouts, cards funcionales y links | UX04-01–03 |
| UX04-05 | DONE | Estandarizar `ChartCard`, `DataTable`, `FilterBar` y estados vacíos/carga/error | UX04-04 |
| UX04-06 | DONE | Refactorizar header: 4 destinos primarios + utilidades, desktop y móvil | UX04-01–04 |
| UX04-07 | DONE | Consolidar Breadcrumb, DatasetContext y ModuleContext sin capas redundantes | UX04-06 |
| UX04-08 | DONE | Documentar reglas de migración y prohibir nuevos estilos locales equivalentes | UX04-01–07 |

**Aceptación de fase:** Home y una ruta interna comparten tipografía y shell; ningún texto UI crítico es menor de 13 px; header y foco funcionan con teclado; tokens sustituyen decisiones locales en componentes globales; lint, typecheck y build pasan.

### Fase UX-05A — Resumen científico

**Objetivo:** una persona nueva entiende el estudio sin conocer CEMiTool ni M5.

| ID | Estado | Tarea | Dependencia |
|---|---|---|---|
| UX05A-01 | DONE | Reescribir la jerarquía de Home como pregunta → diseño → hallazgos → límites | UX-04 |
| UX05A-02 | DONE | Integrar la Story histórica en bloques breves, sin ruta primaria duplicada | UX05A-01 |
| UX05A-03 | DONE | Mostrar diseño 2×3×3, etapas y N=54 desde datos canónicos | UX05A-01 |
| UX05A-04 | DONE | Presentar M5 como resultado destacado con mini trayectoria y caveat | UX05A-01 |
| UX05A-05 | DONE | Restaurar “qué sabemos / qué no sabemos” | UX05A-01 |
| UX05A-06 | DONE | Reducir CTAs a una ruta principal y acciones secundarias claras | UX05A-01–05 |

**Aceptación de fase:** pregunta, dataset, hallazgo y límites se identifican en menos de 60 segundos; sólo hay una acción primaria; pericarpio/piel y causalidad quedan inequívocos; desktop y móvil respetan el mismo orden narrativo.

### Fase UX-05B — Resultados y comparación de módulos

**Objetivo:** comparar M1–M10 antes de abrir una vista especializada.

| ID | Estado | Tarea | Dependencia |
|---|---|---|---|
| UX05B-01 | DONE | Crear landing Results con Modules, Validation y Genes como subfamilias | UX-04 |
| UX05B-02 | PENDING | Convertir cards M1–M10 en comparación compacta y accesible | UX05B-01 |
| UX05B-03 | PENDING | Estandarizar filtros y conservar estado científico en URL | UX04-05 |
| UX05B-04 | PENDING | Añadir explicación de columnas, robustez y ausencia de score total | UX05B-02 |
| UX05B-05 | PENDING | Diseñar lista móvil sin depender de tabla horizontal dominante | UX05B-02–04 |

**Aceptación de fase:** se comparan módulos por genes, Cultivar×Stage, robustez, función y evidencia externa; M2/M5/M10 conservan sus límites; filtros son compartibles; móvil no requiere comprender una tabla de escritorio reducida.

### Fase UX-05C — Module Workspace, con M5 como patrón

**Objetivo:** mantener el módulo como contexto mientras cambia la dimensión analítica.

| ID | Estado | Tarea | Dependencia |
|---|---|---|---|
| UX05C-01 | PENDING | Crear shell de módulo y tabs canónicos | UX-04, UX05B |
| UX05C-02 | PENDING | Resumen: takeaway, métricas, previews y límites | UX05C-01 |
| UX05C-03 | PENDING | Trayectoria: gráfico, años/réplicas, contrastes y datos | UX05C-01 |
| UX05C-04 | PENDING | Función: temas, términos, cobertura y auditoría CHS/STS | UX05C-01 |
| UX05C-05 | PENDING | Hubs y red: ranking, Cytoscape, inspector y locus chr16 | UX05C-01 |
| UX05C-06 | PENDING | Validación: apoyo externo separado del baseline | UX05C-01 |
| UX05C-07 | PENDING | Evidencia: drawer y acceso a tablas/scripts | UX05C-01 |
| UX05C-08 | PENDING | Adaptar los demás módulos sin fingir datos ausentes | UX05C-02–07 |

**Aceptación de fase:** M5 deja de ser una página monolítica; cambiar de dimensión no pierde módulo, filtros ni contexto; cada tab comienza con respuesta y termina con auditoría; red móvil usa preview + modo dedicado; otros módulos comparten shell y muestran estados vacíos honestos.

### Fase UX-05D — Validación, Métodos y Reproducibilidad

| ID | Estado | Tarea | Dependencia |
|---|---|---|---|
| UX05D-01 | PENDING | Validación: explicar primero qué pregunta responde cada dataset | UX-04 |
| UX05D-02 | PENDING | Distinguir visualmente baseline pericarpio de evidencia externa en piel | UX05D-01 |
| UX05D-03 | PENDING | Métodos: arquitectura pregunta-respuesta con profundidad progresiva | UX-04 |
| UX05D-04 | PENDING | Reproducibilidad: landing de claims/artefactos y búsqueda | UX-04 |
| UX05D-05 | PENDING | Evidence Drawer común enlazado desde resultados principales | UX05D-04 |
| UX05D-06 | PENDING | Unificar descargas, nombres humanos e IDs técnicos | UX05D-03–05 |

**Aceptación de fase:** un claim principal llega a su fuente en máximo dos interacciones; la validación no equipara magnitudes entre plataformas; Methods distingue decisiones, parámetros y límites; provenance profunda sigue disponible sin dominar la lectura inicial.

### Fase UX-05E — Genes, T-008 y Preguntar

| ID | Estado | Tarea | Dependencia |
|---|---|---|---|
| UX05E-01 | PENDING | Estandarizar ficha de gen: resumen, baseline, red, externo, anotación y evidencia | UX05C, UX05D |
| UX05E-02 | PENDING | Simplificar T-008 alrededor de “estado, bloqueo y consecuencia” | UX-04 |
| UX05E-03 | PENDING | Mantener ledger de 54 runs como detalle secundario auditable | UX05E-02 |
| UX05E-04 | PENDING | Integrar búsqueda global por resultados, genes, métodos y evidencia | UX05D-04 |
| UX05E-05 | PENDING | Convertir Chat en Preguntar contextual con citas accionables | UX05D-05 |
| UX05E-06 | PENDING | Si falta el endpoint, mostrar estado honesto sin CTA principal inútil | UX05E-05 |

### Fase UX-06 — Prototipo y validación de tareas

| ID | Estado | Tarea |
|---|---|---|
| UX06-01 | PENDING | Probar “entender el estudio” con visitante nuevo |
| UX06-02 | PENDING | Probar “comparar módulos y abrir M5” |
| UX06-03 | PENDING | Probar “encontrar un gen y entender por qué importa” |
| UX06-04 | PENDING | Probar “auditar un claim hasta su fuente” |
| UX06-05 | PENDING | Probar “determinar si T-008 está listo y qué falta” |
| UX06-06 | PENDING | Registrar fricciones y corregir antes de migración completa |

### Fase UX-07 — Migración controlada

- Migrar por componentes y familias de rutas, no mediante una reescritura total.
- Cada migración debe eliminar o aislar estilos legacy equivalentes.
- Mantener rutas antiguas mediante redirects cuando corresponda.
- No publicar una mezcla incoherente sin una estrategia temporal explícita.
- No borrar funcionalidad científica para simplificar la UI: reubicarla o aplicar disclosure.

### Fase UX-08 — QA final

| Área | Criterio mínimo |
|---|---|
| Científica | valores, límites e invariantes iguales a fuentes canónicas |
| Navegación | ubicación actual evidente; back/forward y deep links preservan estado |
| Legibilidad | escala tipográfica consistente; sin texto crítico diminuto |
| Accesibilidad | teclado, foco, contraste, reduced motion y alternativas textuales |
| Responsive | 360, 768, 1024 y 1440 px sin overflow de documento |
| Tareas | cinco journeys críticos completables sin explicación del equipo |
| Técnico | export, validation, lint, typecheck, build y Playwright pasan |
| Rendimiento | red lazy y presupuesto de bundle no empeoran sin justificación |

---

## 9. Protocolo por tarea

Antes de implementar:

1. confirmar el ID activo en este documento y `docs/TASK_LEDGER.md`;
2. inspeccionar componente, datos y estilos actuales;
3. revisar el wireframe y journey correspondientes;
4. identificar la fuente científica exacta;
5. definir qué CSS legacy podrá retirarse después de migrar.

Al cerrar una tarea:

1. validar desktop y móvil;
2. ejecutar lint, typecheck, build y pruebas relevantes;
3. comprobar contenido científico y provenance;
4. capturar evidencia visual cuando haya cambio de interfaz;
5. cambiar el estado sólo si cumple aceptación;
6. actualizar este documento, `docs/TASK_LEDGER.md` y `CHANGELOG.md`;
7. registrar deuda o decisión pendiente sin esconderla dentro del código.

---

## 10. Métricas de éxito

- pregunta, dataset, hallazgo y límites identificables en menos de 60 segundos;
- un claim principal llega a provenance en no más de dos interacciones;
- un módulo puede explorarse sin perder el contexto del módulo;
- la navegación primaria no supera cuatro destinos;
- ninguna página operativa comienza con un hero que compita con Home;
- reducción sustancial de tamaños tipográficos y patrones visuales únicos;
- tablas y filtros dejan de dominar móvil;
- T-008 no se confunde con un resultado terminado;
- el sitio permite lectura rápida, exploración y auditoría sin mostrar los tres niveles simultáneamente.

---

## 11. Registro de progreso

| Fecha | Tarea | Estado | Evidencia |
|---|---|---|---|
| 2026-09-23 | Auditoría histórica, visual y de arquitectura | DONE | Git, UI local, CSS y literatura de visualización científica |
| 2026-09-23 | Creación del plan maestro ejecutable | DONE | Este documento |
| 2026-09-23 | UX04-01 Fundamentos tipográficos y tokens | DONE | Fuentes variables locales, escala/tokenización base, shell/Home/M5 migrados; QA científico, lint, typecheck, build y viewport móvil 390 px pasan |
| 2026-09-23 | UX04-02 Color, superficies, estados y foco | DONE | Tokens semánticos, aliases legacy, estados T-008/validación y foco sólido; contrastes AA, QA y viewports 390/1440 px pasan |
| 2026-09-23 | UX04-03 Spacing, grid y densidad responsive | DONE | Escala espacial de 4–64 px, gutter fluido, ancho máximo de 1240 px, ancho de lectura, controles de 44 px y primera migración de shell, Home, context strips y módulos; 79 usos de tokens y cinco rutas verificadas entre 320–1440 px |
| 2026-09-23 | UX04-04 Primitivas comunes | DONE | `ButtonLink`, `Badge`, `Callout`, `ActionLink` y `ActionCard`; primera migración en Home, módulos M2/M10/M5, prioridades y gate T-008; seis rutas verificadas entre 320–1440 px y corrección del overflow móvil de tablas internas |
| 2026-09-23 | UX04-05 Gráficos, tablas, filtros y estados | DONE | `ChartCard`, `TableFrame`, `FilterBar`, `AsyncState` y `EmptyState`; migración inicial en Home, Modules, M5 y Validation; tablas como regiones enfocables, scroll contenido y seis rutas verificadas entre 320–1440 px |
| 2026-09-23 | UX04-06 Header global responsive | DONE | Cuatro destinos primarios permanentes en desktop, herramientas separadas, panel móvil compacto, foco inicial, Escape, restauración de foco, cierre exterior y cierre al navegar; breakpoints 320–1440 px verificados |
| 2026-09-23 | UX04-07 Contexto científico consolidado | DONE | DatasetContext, ModuleContext y breadcrumb reunidos en una sola barra; baseline/externo, límite, workspace y ruta mantienen semántica; módulos, gen y validación comprobados en 320–1440 px |
| 2026-09-23 | UX04-08 Reglas y guardrail del sistema visual | DONE | Guía canónica `WEB_DESIGN_SYSTEM.md`, presupuesto congelado de deuda legacy, `npm run qa:ui` y ejecución obligatoria en CI; fase UX-04 cerrada |
| 2026-09-23 | UX05A-01 Jerarquía narrativa de Home | DONE | Pregunta científica explícita; orden DOM pregunta → diseño → hallazgos → M5 → límites; responsive y jerarquía de encabezados verificados en 320–1440 px |
| 2026-09-23 | UX05A-02 Story integrada en Home | DONE | Ruta de evidencia en cuatro bloques canónicos; Story duplicada eliminada y `/story` redirige a Home; una H1, cuatro pasos, sin alertas ni overflow corporal en 320–1440 px |
| 2026-09-23 | UX05A-03 Diseño experimental explícito | DONE | Ecuación 2 cultivares × 3 etapas × 3 años × 3 réplicas = 54 y matriz cultivar-etapa con 9 muestras por cruce; datos canónicos, balance, año y tejido visibles; 320–1440 px verificados |
| 2026-09-23 | UX05A-04 M5 destacado con trayectoria canónica | DONE | Mini small multiples 2012–2014 desde 18 medias canónicas, dos cultivares, FDR y genes visibles; caveat year-dependent y límites de causalidad/tejido/anotación; 320–1440 px verificados |

---

## 12. Mejoras potenciales futuras — cartera de oportunidades

Esta sección registra capacidades que **no forman parte del rediseño base UX-04–UX-08**, pero que pueden convertir el repositorio en un portal científico mucho más valioso. No deben implementarse antes de estabilizar arquitectura, sistema visual y journeys principales.

### 12.1 Activos disponibles

El inventario del repositorio, excluyendo dependencias y outputs temporales, contiene aproximadamente:

- 198 tablas TSV/CSV — 189,73 MB;
- 64 scripts R/Python;
- 75 informes HTML/PDF;
- 61 documentos Markdown;
- 17 objetos R — 5,95 GB;
- 23 JSON propios del proyecto.

La oportunidad no consiste sólo en mostrar más archivos. Consiste en convertirlos en entidades relacionadas, encontrables, interpretables y reutilizables sin perder la distinción entre evidencia validada y exploración nueva.

### 12.2 Principios para funcionalidades futuras

- Toda computación nueva debe etiquetarse como `exploratoria` hasta pasar validación y versionado.
- Una salida generada por el usuario no puede presentarse como resultado canónico del estudio.
- Los cálculos deben declarar input, versión, parámetros y fecha.
- Las funcionalidades futuras reutilizan el grafo `claim → dato → script → parámetro → build`; no crean otra capa de provenance paralela.
- Priorizar capacidades que reduzcan tiempo para encontrar, interpretar o reproducir evidencia.
- No añadir una feature sólo porque sea técnicamente llamativa: debe resolver una tarea científica identificable.

### 12.3 Horizonte A — alto valor sobre activos existentes

| ID | Oportunidad | Qué permitiría | Dependencias | Riesgo |
|---|---|---|---|---|
| FUT-01 | **Catálogo semántico de datos** | Navegar tablas por tema, entidad, columnas, unidad, dimensión, origen, versión y análisis que las consume | Reproducibilidad + schemas | Bajo |
| FUT-02 | **Buscador universal de entidades** | Buscar `M5`, un gen, cultivar, etapa, dataset, término funcional, claim, script o archivo desde un único lugar | Índice estático unificado | Bajo |
| FUT-03 | **Grafo visual de procedencia** | Ver y recorrer `claim → figura/tabla → output → script → input → commit` | Modelo común de provenance | Bajo–medio |
| FUT-04 | **Vistas compartibles y snapshots** | Copiar una URL que preserve módulo, tab, año, filtros, genes seleccionados y dataset | URL state canónico | Bajo |
| FUT-05 | **Figure & Table Studio** | Exportar SVG/PNG/CSV y captions metodológicos listos para informe, indicando versión y filtros | Componentes de gráficos unificados | Medio |
| FUT-06 | **Data dictionary inteligente** | Explicar cada columna, valores permitidos, NA, unidades, claves y relaciones entre tablas | Schemas de tablas | Bajo |
| FUT-07 | **Time machine de releases** | Comparar qué cambió entre dos builds: datos, claims, figuras, scripts, hashes y estado T-008 | Releases versionadas | Medio |
| FUT-08 | **Generador de cita y paquete de descarga** | Descargar la evidencia de un claim con cita, licencia, versión, fuentes y README | Metadata de publicación | Bajo–medio |

#### Resultado esperado del Horizonte A

El sitio deja de ser sólo una colección de pantallas y se convierte en un índice vivo del repositorio. Un investigador puede encontrar una entidad, entenderla, abrir su evidencia y compartir exactamente la misma vista.

### 12.4 Horizonte B — nuevas herramientas de exploración

| ID | Oportunidad | Qué permitiría | Condición científica | Riesgo |
|---|---|---|---|---|
| FUT-09 | **Atlas de las 54 muestras** | Explorar diseño, metadata, QC, expresión y pertenencia a grupos antes de interpretar módulos | No alterar el conjunto balanceado | Medio |
| FUT-10 | **Gene List Lab** | Pegar una lista de genes y consultar solapamiento con módulos, hubs, términos, validación y conflictos de anotación | Resultado marcado exploratorio; universo explícito | Alto |
| FUT-11 | **Tablero de comparación de módulos** | Fijar 2–4 módulos y comparar trayectoria, robustez, función, hubs y validación lado a lado | No inventar score compuesto | Medio |
| FUT-12 | **Constructor de informes** | Seleccionar figuras, tablas, métodos, límites y provenance para generar un informe reproducible | Plantillas versionadas | Medio |
| FUT-13 | **Colecciones y bookmarks locales** | Guardar genes, módulos, claims y vistas para una sesión de revisión sin backend | Persistencia local + export JSON | Bajo |
| FUT-14 | **Modo enseñanza / glosario contextual** | Explicar eigengene, FDR, hub, ORA, beta, pericarpio y validación al nivel elegido | Copy científico revisado | Bajo |
| FUT-15 | **Auditor de afirmaciones** | Clasificar claims por evidencia, robustez, límites, datasets y estado de actualización | Taxonomía de evidencia | Medio |
| FUT-16 | **Explorador de sensibilidad** | Comparar beta 7 vs beta 10, años, fuentes de anotación y reglas de robustez sin mezclar conclusiones | Sólo resultados ya calculados | Medio–alto |

#### Regla para FUT-10 y FUT-16

Estas herramientas no deben ejecutar análisis confirmatorios improvisados ni producir frases automáticas de significancia. Deben mostrar el resultado como consulta exploratoria, declarar universo y multiplicidad, y ofrecer exportación reproducible de inputs y parámetros.

### 12.5 Horizonte C — capacidades ambiciosas

| ID | Oportunidad | Visión | Precondición | Riesgo/costo |
|---|---|---|---|---|
| FUT-17 | **Research Capsule / RO-Crate** | Descargar un resultado o release como paquete autocontenido con datos, código, metadata y relaciones | Catálogo + provenance estable | Medio |
| FUT-18 | **Notebook ejecutable en navegador** | Abrir datasets pequeños y notebooks educativos sin instalar R/Python ni enviar datos a un servidor | Curación de ejemplos + presupuesto WASM | Alto |
| FUT-19 | **Copiloto científico contextual** | Preguntar desde M5 o un gen y recibir respuestas grounded con citas accionables y límites | Índice estable, endpoint seguro, evaluación | Alto |
| FUT-20 | **Knowledge graph del estudio** | Navegar relaciones entre muestras, módulos, genes, procesos, datasets, claims, figuras y scripts | IDs y ontología comunes | Alto |
| FUT-21 | **Comparador histórico vs reprocesamiento moderno** | Cuando T-008 esté científicamente completo, contrastar conservación de módulos, genes y conclusiones entre pipelines | T-008 completo y análisis de preservación validado | Muy alto |
| FUT-22 | **Portal offline/PWA** | Consultar narrativa, metadata, tablas pequeñas y vistas guardadas sin conexión | Estrategia de caché y versionado | Medio |
| FUT-23 | **Anotaciones colaborativas** | Revisores dejan notas ligadas a claim, gen o figura y exportan una revisión estructurada | Identidad/backend o archivos portables | Alto |
| FUT-24 | **API estática y metadatos Bioschemas** | Permitir que máquinas, buscadores y otros portales descubran datasets, genes y workflows | Schemas, URLs persistentes y versionado | Medio |

### 12.6 La oportunidad más transformadora

La combinación más potente sería:

```text
Buscador universal
        ↓
Entidad científica (módulo, gen, claim, dataset)
        ↓
Visualización + interpretación + límites
        ↓
Grafo de procedencia
        ↓
Paquete reproducible / notebook / cita
```

Esto aprovecha simultáneamente las tablas, scripts, informes y documentación ya existentes. El portal permitiría pasar de una pregunta biológica a una prueba auditable sin recorrer manualmente el repositorio.

### 12.7 Priorización recomendada

1. **Después de UX-08:** FUT-01 catálogo, FUT-02 búsqueda, FUT-03 provenance graph y FUT-04 snapshots.
2. **Segunda expansión:** FUT-05 export studio, FUT-09 atlas de muestras, FUT-11 comparación y FUT-14 glosario.
3. **Producto de reproducibilidad:** FUT-06 schemas, FUT-08 citas, FUT-17 RO-Crate y FUT-24 metadata machine-readable.
4. **Exploración avanzada:** FUT-10 Gene List Lab, FUT-12 report builder, FUT-15 auditor y FUT-16 sensibilidad.
5. **Sólo con evaluación y recursos:** FUT-18 notebooks, FUT-19 copiloto, FUT-20 knowledge graph y FUT-23 colaboración.
6. **Bloqueada científicamente por T-008:** FUT-21 comparador histórico-moderno.

### 12.8 Criterio de entrada al roadmap activo

Una oportunidad `FUT-*` sólo pasa al roadmap activo cuando tiene:

1. usuario y tarea concreta;
2. fuente de datos identificada;
3. frontera entre canónico y exploratorio;
4. prototipo de interacción;
5. costo de mantenimiento estimado;
6. criterios científicos y UX de aceptación;
7. decisión explícita de prioridad frente a deuda pendiente.

### 12.9 Base técnica y estándares investigados

- [RO-Crate 1.3](https://www.researchobject.org/ro-crate/specification) permite empaquetar datos de investigación y metadata asociada como un objeto interoperable.
- [W3C PROV-O](https://www.w3.org/TR/prov-o/) proporciona un modelo estándar para representar e intercambiar procedencia.
- [Bioschemas](https://bioschemas.org/profiles/) define perfiles para Dataset, Gene y ComputationalWorkflow orientados a recursos de ciencias de la vida.
- [Frictionless Table Schema](https://specs.frictionlessdata.io/table-schema/) permite documentar campos, tipos, claves, valores faltantes y restricciones de tablas.
- [JupyterLite](https://jupyterlite.readthedocs.io/en/stable/quickstart/standalone.html) demuestra que notebooks y kernels WebAssembly pueden desplegarse como activos estáticos en navegador.
- [DataCite versioning](https://support.datacite.org/docs/versioning) distingue cambios menores y versiones mayores enlazadas, útil para releases científicas citables.
- [WorkflowHub](https://about.workflowhub.eu/) usa Research Objects y RO-Crate para publicar workflows FAIR con metadata, tests y ejemplos.

Estos estándares no se adoptan automáticamente. Sirven para evitar formatos propietarios y orientar pruebas de concepto compatibles con el carácter público y reproducible del proyecto.
