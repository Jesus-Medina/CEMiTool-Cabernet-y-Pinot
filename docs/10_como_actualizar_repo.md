# 10 — Cómo mantener actualizado este repositorio

Este repositorio funciona como bitácora científica y repositorio reproducible, no solo como almacenamiento del “resultado final”.

## Regla de actualización

Cada vez que se complete una etapa:

1. conservar el script que produjo el resultado;
2. guardar parámetros y resúmenes de ejecución;
3. guardar tablas pequeñas y resultados clave;
4. actualizar `CHANGELOG.md`;
5. actualizar la bitácora metodológica si cambió una decisión;
6. registrar limitaciones o problemas encontrados;
7. no borrar versiones anteriores que expliquen cómo se llegó a la decisión actual.

## Convención de carpetas

### scripts/baseline
Primeros workflows reproducibles y versiones históricas importantes.

### scripts/master
Workflows integrales que crean la estructura completa del proyecto.

### scripts/post
Análisis posteriores a CEMiTool: robustez, modelos estadísticos, enriquecimiento, hubs y validación.

### results/history
Corridas o decisiones metodológicas históricas que ya no son la versión principal pero explican la evolución del estudio.

### results/beta7 y results/beta10
Parámetros y resultados resumidos de cada red.

### results/comparisons
Comparaciones entre configuraciones, métodos o validaciones.

### docs
Narrativa científica del proyecto: pregunta, metodología, decisiones, limitaciones, resultados y roadmap.

## Qué NO borrar

No borrar beta7 aunque beta10 sea la red principal. Beta7 funciona como evidencia de sensibilidad y ayuda a justificar que la estructura beta10 no apareció por un cambio arbitrario del parámetro.

## Próxima actualización prevista

Cuando termine `07_module_statistics_beta10.R`, agregar:

- tablas factoriales;
- contrastes Cabernet vs Pinot por etapa;
- módulos con interacción significativa;
- QC de eigengenes/modelos;
- interpretación preliminar;
- actualización de README, CHANGELOG y roadmap.

Después se abrirá la etapa de anotación funcional y validación skin-only.
