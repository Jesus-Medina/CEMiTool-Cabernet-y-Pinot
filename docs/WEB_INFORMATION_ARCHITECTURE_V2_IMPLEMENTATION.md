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
- [ ] Fase 3: Module Workspace
- [ ] Fase 4: Module Summary
- [ ] Fase 5: Trajectory
- [ ] Fase 6: Biología y red
- [ ] Fase 7: Validación del módulo

## Archivos Modificados (Registro de Commits)
- `feat(nav): implement V2 global information architecture`: `App.tsx`, `SiteShell.tsx`, `pages.tsx`, `WEB_INFORMATION_ARCHITECTURE_V2_IMPLEMENTATION.md`.
- `feat(results): rebuild M1-M10 scientific overview`: `ResultsPage.tsx`, `hooks/useModuleExplorerData.ts`, copia de assets canónicos.
