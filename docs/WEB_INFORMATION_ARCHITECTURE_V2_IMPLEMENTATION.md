# WEB INFORMATION ARCHITECTURE V2 IMPLEMENTATION

## Estado Actual (Fase 0 - Auditoría)

- La navegación actual en `SiteShell.tsx` contiene: Inicio, Story, Módulos, Enriquecimiento, Validación, T-008, Métodos, Evidencia, Chat.
- Las páginas de resultados biológicos están fragmentadas, obligando a salir del módulo para ver Validación, Evidencia o Enriquecimiento.
- M5 tiene su propio componente `M5Explorer` que mezcla muchas cosas, mientras que otros módulos usan `ModuleExplorerDetailPage`.
- La pantalla "Story" actúa como un resumen paso a paso, pero "Inicio" ya tiene resumen.
- Faltan vistas autosuficientes por módulo que agrupen: Resumen, Trayectoria, Biología y Red, Validación.

## Diferencias frente a V2

1. **Navegación Global**:
   - V1 (Actual): Inicio, Story, Módulos, Enriquecimiento, Validación, T-008, Métodos, Evidencia, Chat.
   - V2 (Objetivo): Resumen, Resultados, Métodos, Reproducibilidad. (Secundarias: Buscar, Preguntar, GitHub, T-008).
2. **Jerarquía Científica**:
   - V1: Módulos, Función, Validación, Genes como secciones paralelas.
   - V2: ESTUDIO → RESULTADOS → ENTIDAD CIENTÍFICA (Módulo/Gen) → EVIDENCIA (Panel contextual).
3. **Flujo de Resultados**:
   - V1: /modules lleva a un listado/landing.
   - V2: /results muestra directamente M1-M10 como composición visual.
4. **Vistas de Módulo**:
   - V1: Vistas incompletas, navegación fragmentada.
   - V2: 4 vistas unificadas (Resumen, Trayectoria, Biología y red, Validación) accesibles mediante tabulaciones o layout consolidado dentro del mismo contenedor del módulo.

## Plan de Migración

- **Fase 1**: Refactorizar el "Shell" principal (`SiteShell.tsx`) y las rutas (`App.tsx`). Limpiar la barra superior y ocultar `T-008`, `Validación`, `Enriquecimiento` de la vista primaria. Mantener redirects de rutas antiguas a las nuevas si corresponde, o simplemente ocultarlas de la UI principal pero dejarlas operativas.
- **Fase 2**: Crear la vista consolidada de Resultados (`/results` -> M1-M10).
- **Fase 3**: Diseñar el Module Workspace universal (`/results/modules/:moduleId`).
- **Fase 4, 5, 6, 7**: Rellenar las sub-vistas del módulo progresivamente.

## Progreso de Tareas

- [x] Fase 0: Auditoría y plan
- [x] Fase 1: Nuevo Shell y navegación
- [x] Fase 2: Resultados M1–M10

### Fase 3: Shell del Module Workspace
- [x] Crear `site/src/ModuleWorkspace.tsx`.
- [x] Implementar layout principal: Header con título y metadatos básicos.
- [x] Implementar navegación superior `[← Prev | Todos | Next →]`.
- [x] Implementar sistema de pestañas (Resumen, Trayectoria, Biología y red, Validación).
- [x] Mapear ruta `/results/modules/:moduleId` hacia este componente en `pages.tsx`.
- [x] Eliminar división `M5Explorer` / `ModuleExplorerDetailPage`.

### Fase 4: Pestaña "Resumen" (Foco: Fenotipo y Robustez)
- [x] Aislar componentes de resumen (hub principal, métrica de validación) en `site/src/components/ModuleComponents.tsx`.
- [x] Cargar la imagen generada por CEMiTool (`profile_M*.png`) para todos los módulos de manera dinámica.
- [x] Mostrar `ContrastMatrix` general.
- [x] Integrar en pestaña `Resumen` del `ModuleWorkspace`.

### Fase 5: Pestaña "Trayectoria" (Foco: Perfil temporal)
- [x] Extraer gráficos iterativos de M5 (de `M5Explorer`).
- [x] Adaptar pestaña para mostrar SVG interactivo si es M5.
- [x] Adaptar pestaña para mostrar imagen de perfil y matriz estática si es M1-M4, M6-M10.
- [x] Integrar matriz de contraste de Harvest para visualizar dependencia de año.

### Fase 6: Pestaña "Biología y Red" (Foco: Mecanismo)
- [x] Extraer resumen de ORA (MapMan/GO) a `ModuleComponents.tsx`.
- [x] Extraer tabla de priorización de Hubs a `ModuleComponents.tsx`.
- [x] Renderizar `M5NetworkExplorer` (con su conflicto de anotación explícito) solo cuando sea M5.
- [x] Armar pestaña `Biología y red` conectando ORA + Hubs + (Red M5).

### Fase 7: Pestaña "Validación" (Foco: Piel aislada)
- [x] Aislar `ModuleExternalSummary` (comparación con PRJNA260535 y GSE72421).
- [x] Agregar nota metodológica transversal: "No es evidencia de causalidad mecanicista".
- [x] Armar pestaña de validación en `ModuleWorkspace`.

## Archivos Modificados (Registro de Commits)
- `feat(nav): implement V2 global information architecture`: `App.tsx`, `SiteShell.tsx`, `pages.tsx`, `WEB_INFORMATION_ARCHITECTURE_V2_IMPLEMENTATION.md`.
- `feat(results): rebuild M1-M10 scientific overview`: `ResultsPage.tsx`, `hooks/useModuleExplorerData.ts`, copia de assets canónicos.

### Fase 8: Vistas Globales de Exploración (Enrichment y Validation)
- [x] Ocultar de la navegación primaria.
- [x] Refinar acceso vía `ResultsPage` (`/validation` y `/enrichment`).
- [x] Mantener capacidad de comparar transversalmente entre M1-M10.

### Fase 9: Ficha Individual de Gen y Buscador
- [x] Crear `GeneExplorerPage.tsx`.
- [x] Implementar `/results/genes` (Buscador/Tabla general de genes priorizados).
- [x] Implementar `/results/genes/:geneId` (Ficha individual con métricas de robustez, anotaciones v3/v5 y métricas externas).
- [x] Enlazar desde los módulos hacia la ficha individual.
