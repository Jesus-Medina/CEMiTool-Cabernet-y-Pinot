# Sistema visual y reglas de migración web

**Estado:** vigente desde UX04-08  
**Implementación canónica:** `site/src/components/ui.tsx` y tokens de `site/src/global.css`

Este documento evita que cada página vuelva a definir su propia tipografía, botón, badge, aviso, tabla o estado. No describe una maqueta ideal: registra las decisiones que el código ya aplica.

## 1. Principios

1. La interfaz debe ayudar a leer evidencia científica, no competir con ella.
2. El contenido canónico y sus límites interpretativos tienen prioridad sobre ornamentación.
3. Una misma función usa el mismo componente, comportamiento de teclado y lenguaje visual.
4. Las variantes expresan jerarquía o estado semántico; no se crean sólo para decorar una página.
5. Una migración puede reducir deuda legacy, nunca aumentarla.

## 2. Tokens obligatorios

- Tipografía: `--font-display`, `--font-sans`, `--font-mono` y la escala `--text-*`.
- Color: usar `--color-brand-*`, `--color-text-*`, `--color-surface-*`, `--color-border-*` y `--color-status-*`.
- Espaciado: usar `--space-1` a `--space-8`, `--page-gutter`, `--panel-padding`, `--grid-gap` y `--control-height`.
- Layout: `--layout-max`, `--layout-reading` y `--layout-narrow`.

No se añade un color, tamaño o separación local si un token existente expresa la misma decisión. Los aliases legacy (`--cabernet`, `--muted`, etc.) sólo permanecen para migración gradual.

## 3. Primitivas canónicas

| Necesidad | Componente | Regla |
|---|---|---|
| Acción que navega | `ButtonLink` | `primary` sólo para la acción principal; `secondary` o `quiet` para el resto |
| Estado breve | `Badge` | Elegir tone semántico; no codificar estado sólo mediante color |
| Límite o interpretación | `Callout` | Título explícito y tono acorde a la evidencia |
| Enlace dentro de contenido | `ActionLink` | Texto descriptivo; la flecha es decorativa |
| Destino funcional | `ActionCard` | Toda la tarjeta es un enlace y conserva foco visible |
| Carga/error/vacío | `AsyncState` / `EmptyState` | Error usa `role=alert`; carga y vacío usan `role=status` |
| Controles de una vista | `FilterBar` | Agrupar controles relacionados; conservar labels visibles |
| Tabla científica ancha | `TableFrame` | Proporcionar `label`; scroll interno y foco de teclado |
| Figura cuantitativa | `ChartCard` | Título, leyenda/acciones y descripción accesible del gráfico |

## 4. Contexto y navegación

- El header tiene cuatro destinos primarios: Resumen, Resultados, Métodos y Reproducibilidad.
- Buscar, Preguntar y GitHub son herramientas, no destinos narrativos.
- `research-context` es la única barra para fuente de evidencia, límite, workspace y breadcrumb.
- No se recrean `DatasetContext`, `ModuleContext` o breadcrumbs como franjas independientes.
- Baseline de pericarpio y validación externa de piel deben permanecer visual y textualmente separados.

## 5. Responsive y accesibilidad

- Probar como mínimo 320, 390, 768, 1024 y 1440 px.
- Ninguna vista debe producir overflow horizontal del documento.
- Controles interactivos mantienen al menos `--control-height` y foco visible de 3 px.
- Tablas pueden desplazarse dentro de `TableFrame`; no se ocultan columnas para simular adaptación.
- No depender sólo de color para significancia, estado de QC o procedencia de evidencia.
- El orden narrativo y semántico debe ser el mismo en desktop y móvil.

## 6. Proceso para una nueva vista

1. Identificar la evidencia canónica, provenance y límites científicos.
2. Componer la vista con primitivas existentes antes de escribir CSS local.
3. Añadir una variante a una primitiva sólo si la necesidad se repite y cambia semántica o comportamiento.
4. Mantener CSS local únicamente para layouts o visualizaciones específicas de dominio.
5. Ejecutar `npm run qa:ui`, `npm run qa:scientific`, lint, typecheck y build.
6. Validar teclado, estados vacíos/error y los cinco anchos mínimos.

## 7. Presupuesto de deuda legacy

`site/scripts/check_ui_consistency.mjs` impide aumentar patrones locales equivalentes. Algunos usos antiguos siguen temporalmente permitidos con un máximo congelado. Cada tarea de migración debe reducir esos máximos cuando elimina usos; nunca elevarlos para hacer pasar el chequeo.

Si el chequeo falla, la solución es migrar al componente común. No se cambia el presupuesto salvo que exista una decisión documentada en `docs/DECISIONS.md`.
