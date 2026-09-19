# 03 — Bitácora metodológica

## Etapa A — formulación del proyecto

Se eligió GSE98923 por contener Cabernet Sauvignon y Pinot noir seguidos durante el desarrollo de la baya en tres temporadas.

La pregunta inicial orientada a diferencias de piel se reformuló para evitar una inferencia causal no sustentada. El proyecto pasó a buscar módulos de coexpresión cultivar-etapa y posteriormente validar procesos relevantes para piel.

## Etapa B — selección balanceada de 54 muestras

Se fijaron FruitSet, Veraison y Harvest en 2012–2014 con tres réplicas por combinación.

Motivos:

- diseño simétrico;
- comparabilidad entre cultivares;
- preservación del año/vintage;
- evitar usar puntos cercanos como falsas réplicas.

## Etapa C — preprocessing baseline

Se utilizó la matriz RPKM procesada de GEO.

Transformación:

```
log2(RPKM + 1)
```

Parámetros CEMiTool principales:

```
filter = TRUE
filter_pval = 0.1
apply_vst = FALSE
cor_method = "pearson"
network_type = "unsigned"
tom_type = "signed"
merge_similar = TRUE
min_ngen = 30
seed = 1234
```

## Etapa D — problema de selección automática de beta

La selección automática no entregó una solución que satisficiera el criterio esperado. Una primera versión usó el mecanismo force_beta; esto se marcó como punto que debía auditarse y no aceptarse ciegamente.

La red fue reproducida posteriormente fijando explícitamente beta 7 mediante:

```r
set_beta = 7
force_beta = FALSE
```

Resultado:

- R² = 0.5495792734
- 9 grupos reportados por CEMiTool = 8 módulos + Not.Correlated

## Etapa E — prueba beta 10

A partir de las curvas Beta × R² y mean connectivity se ensayó beta 10 como compromiso entre ajuste scale-free y conectividad.

```r
set_beta = 10
force_beta = FALSE
```

Resultado:

- R² = 0.7063742471
- 11 grupos reportados = 10 módulos + Not.Correlated

## Etapa F — comparación estructural beta 7 vs beta 10

No se compararon módulos únicamente por nombre, porque M1/M2/etc. son etiquetas arbitrarias entre corridas.

Se calculó:

- overlap gen-a-gen;
- porcentaje de retención;
- Jaccard por pares de módulos;
- mejor match beta7 → beta10.

La mayoría de módulos mostró alta conservación, permitiendo usar beta10 como red principal y beta7 como sensibilidad.

## Etapa G — modelo factorial

Se preparó un análisis posterior a CEMiTool que no reconstruye la red.

Para cada módulo de beta10 se calcula un eigengene/PC1 por muestra y se ajusta:

```r
Eigengene ~ Cultivar * Stage + Year
```

Se incluyen además contrastes Cabernet vs Pinot dentro de cada etapa y FDR de Benjamini-Hochberg.

## Principio metodológico del proyecto

Cada nueva capa del estudio debe resolver una carencia concreta:

- beta/sensibilidad → robustez de red;
- Year → control de vintage;
- interacción → especificidad cultivar-etapa;
- enriquecimiento → significado biológico;
- hubs → priorización de genes;
- skin-only → especificidad tisular;
- FASTQ moderno → robustez a procesamiento/anotación histórica.
