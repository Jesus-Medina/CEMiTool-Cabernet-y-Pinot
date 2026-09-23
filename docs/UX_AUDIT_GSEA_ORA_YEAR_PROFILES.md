# UX/UI audit — reporte integrado GSEA · ORA · perfiles por año

**Fecha:** 2026-09-23  
**Pantalla auditada:** `site/public/reports/gsea_ora_year_profiles.html`  
**Motivo:** reducir fricción, evitar navegación oculta y mantener juntas las piezas de una misma evidencia científica.

## Hallazgo principal

La versión anterior tenía navegación interna por pestañas dentro de GSEA, ORA y Perfiles. Esa estructura era innecesaria porque las pestañas no representaban tareas mutuamente excluyentes: fragmentaban una misma lectura científica.

Ejemplo GSEA:

- Resumen
- Figura CEMiTool
- Matriz ES/NES/padj
- Años y clases
- Método y límites

Esas cinco piezas forman una secuencia lógica y deben poder leerse sin hacer clic ni recordar qué había en otra pestaña.

## Problemas detectados

### 1. Profundidad de navegación innecesaria

La página ya tenía navegación primaria entre:

- Auditoría
- GSEA
- ORA
- Perfiles

Agregar otra capa de tabs dentro de cada sección generaba navegación anidada sin necesidad.

### 2. Evidencia relacionada quedaba oculta

La validación de años podía quedar en una pestaña distinta de la matriz GSEA.

La cobertura de ORA podía quedar separada de los términos.

Los hubs centrales usados por Hub-core podían quedar separados de los gráficos y tablas de la misma sensibilidad.

### 3. Mayor carga de memoria

El lector debía recordar información de una pestaña al cambiar a otra para reconstruir la interpretación.

### 4. La página dejaba de comportarse como “una sola página”

Aunque técnicamente todo estaba en un HTML, la experiencia era la de varias mini-páginas ocultas.

## Decisión UX V2

La única navegación de sección queda en la barra superior:

`Auditoría → GSEA → ORA → Perfiles por año`

Dentro de cada sección el contenido pasa a lectura continua.

### GSEA

Orden:

1. resumen;
2. figura nativa CEMiTool;
3. matriz interactiva ES/NES/padj;
4. composición exacta 2012/2013/2014;
5. método y límites.

### ORA

Orden:

1. panorama;
2. ORA por término;
3. temas MapMan;
4. cobertura/QC;
5. auditoría M5;
6. GO auditado;
7. método y límites.

### Perfiles

Orden conceptual:

1. relación eigengene canónico vs Hub-core;
2. resumen de sensibilidad por módulo;
3. gráficos;
4. tabla completa;
5. hubs centrales utilizados;
6. contrastes Hub-core;
7. método y límites.

Los hubs permanecen como evidencia de cómo se construye la sensibilidad Hub-core; no se presentan como si fueran parte del cálculo del eigengene canónico.

## Qué interactividad sí se conserva

Se mantienen controles que cambian datos y responden a una tarea real:

- selector ES/NES/padj;
- selector de módulo;
- selector de fuente ORA;
- búsqueda de términos;
- selector de año;
- eigengene canónico vs Hub-core;
- descarga CSV;
- desplegables de imágenes canónicas.

Estos son controles de análisis, no navegación de contenido.

## Regla reutilizable

> Si dos bloques deben leerse juntos para interpretar correctamente un resultado, no deben vivir detrás de pestañas distintas.

Usar tabs solo cuando:
- hay modos mutuamente excluyentes;
- mostrar todo simultáneamente perjudicaría de forma clara la tarea;
- el usuario entiende que cambia de modo, no que está perdiendo contexto científico.

## Estado

Implementado en el reporte integrado. No se modificaron resultados científicos, tablas canónicas ni cálculos.
