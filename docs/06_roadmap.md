# 06 — Roadmap del estudio

## Estado actual

Completado:

- [x] pregunta y alcance corregidos;
- [x] dataset principal definido;
- [x] 54 muestras balanceadas;
- [x] pipeline reproducible;
- [x] beta7 explícito;
- [x] beta10 explícito;
- [x] diagnósticos de beta;
- [x] tamaños de módulos;
- [x] comparación de pertenencia beta7 vs beta10;
- [x] beta10 definido como red principal;
- [x] script de modelo factorial preparado.

## Próximo paso inmediato

Ejecutar:

```r
source("scripts/post/07_module_statistics_beta10.R")
```

Resultados esperados:

- `module_eigengenes_54.tsv`
- `module_eigengenes_with_metadata_54.tsv`
- `module_factorial_ANOVA_typeIII.tsv`
- `cabernet_vs_pinot_within_each_stage.tsv`
- `significant_cultivar_stage_interactions_FDR05.tsv`
- `significant_cabernet_vs_pinot_stage_contrasts_FDR05.tsv`
- QC y diagnósticos del modelo

## Después

### Fase 1 — selección estadística
Priorizar módulos con:
- interacción Cultivar × Stage;
- contrastes cultivar dentro de etapa;
- FDR;
- tamaño/estabilidad de módulo.

### Fase 2 — consistencia temporal
Visualizar actividad por año y comprobar que el resultado no dependa de un solo vintage.

### Fase 3 — anotación y enriquecimiento
Actualizar IDs y evaluar:
- cell wall organization;
- pectin metabolism;
- cellulose/hemicellulose;
- lignification;
- cutin/wax;
- epidermal development;
- phenylpropanoid/flavonoid/anthocyanin pathways.

### Fase 4 — hubs
Priorizar genes altamente centrales dentro de módulos candidatos.

### Fase 5 — validación skin-only
Validar dirección/presencia de la señal en datasets externos de piel.

### Fase 6 — versión fortalecida desde FASTQ
Reprocesar reads con pipeline actual y evaluar preservación.

### Fase 7 — integración final
Preparar:
- resultados principales;
- figuras;
- tablas;
- métodos reproducibles;
- discusión y limitaciones;
- material suplementario.
