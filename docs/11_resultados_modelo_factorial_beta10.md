# 11 — Resultados del modelo factorial beta10

## Modelo

Se analizaron los 10 módulos biológicos de la red beta10 sobre 54 muestras.

Para cada módulo se calculó un eigengene como PC1 de la expresión estandarizada de sus genes. El signo del PC1 se orientó para correlacionar positivamente con la expresión media del módulo.

Modelo principal:

```
Eigengene ~ Cultivar * Stage + Year
```

Se usó ANOVA Type III con contrastes sum-to-zero y corrección Benjamini-Hochberg FDR.

## Resultado principal: interacción Cultivar × Stage

Cinco de diez módulos presentan interacción significativa después de FDR:

| Módulo | F | p | FDR |
|---|---:|---:|---:|
| M5 | 190.93 | 5.29e-23 | 5.29e-22 |
| M10 | 10.24 | 2.10e-4 | 1.05e-3 |
| M2 | 5.56 | 6.86e-3 | 1.95e-2 |
| M3 | 5.40 | 7.81e-3 | 1.95e-2 |
| M1 | 4.27 | 1.98e-2 | 3.97e-2 |

M5 es, con diferencia, la interacción más fuerte.

## Contrastes Cabernet Sauvignon vs Pinot noir dentro de etapa

El estimate está definido como Cabernet Sauvignon - Pinot noir.

Por tanto:
- estimate negativo = eigengene menor en Cabernet;
- estimate positivo = eigengene mayor en Cabernet.

Contrastes significativos con FDR global < 0.05:

| Módulo | Etapa | Estimate | Dirección |
|---|---|---:|---|
| M5 | Harvest | -22.28 | Cabernet < Pinot |
| M2 | Veraison | -25.37 | Cabernet < Pinot |
| M2 | Harvest | -21.83 | Cabernet < Pinot |
| M2 | FruitSet | -15.56 | Cabernet < Pinot |
| M10 | Harvest | -3.36 | Cabernet < Pinot |
| M3 | Harvest | -6.99 | Cabernet < Pinot |
| M10 | Veraison | -2.13 | Cabernet < Pinot |
| M6 | FruitSet | +6.15 | Cabernet > Pinot |
| M5 | Veraison | -2.46 | Cabernet < Pinot |

## Lectura preliminar

### M5
Es el candidato estadístico más fuerte en esta etapa:
- efecto de Cultivar significativo;
- Stage significativo;
- Year significativo;
- interacción Cultivar × Stage extremadamente significativa;
- diferencia Cabernet < Pinot en Veraison;
- diferencia muchísimo mayor en Harvest.

Esto indica que la separación entre cultivares para este módulo depende fuertemente de la etapa.

### M2
Presenta:
- efecto de Cultivar muy fuerte;
- Stage significativo;
- Year significativo;
- interacción significativa.

Cabernet tiene menor eigengene que Pinot en las tres etapas, con la diferencia más grande en Veraison.

### M10
Presenta interacción clara sin evidencia fuerte de Year en este modelo aditivo. Las diferencias significativas aparecen en Veraison y Harvest, no en FruitSet.

### M3
La interacción es significativa y el efecto de Year es extremadamente fuerte. El contraste significativo listado aparece en Harvest. Esto obliga a revisar el patrón por año antes de una interpretación biológica fuerte.

### M1
La interacción global Cultivar × Stage alcanza FDR < 0.05, pero no aparece entre los contrastes individuales significativos después del FDR global usado para los contrastes. Debe evaluarse mediante perfiles/medias y no interpretarse a partir de un solo contraste.

### M6
No pasa FDR para la interacción Cultivar × Stage (FDR ~0.10), aunque sí presenta un contraste Cabernet > Pinot en FruitSet y efectos principales de Cultivar, Stage y Year. Se conserva como señal secundaria, no como módulo principal de interacción.

## Hallazgo metodológico importante: Year

Year es significativo después de FDR en M1, M2, M3, M5, M6, M7, M8 y M9: 8 de 10 módulos.

Esto valida la decisión de no ignorar las temporadas y muestra que el siguiente control obligatorio es examinar si las interacciones cultivar-etapa son consistentes en 2012, 2013 y 2014.

## Qué todavía NO se concluye

Estos resultados no permiten aún afirmar que M5/M2/etc. estén relacionados con grosor de piel.

Todavía falta:
1. comprobar consistencia por año;
2. revisar QC y residuos del modelo;
3. anotar funcionalmente los módulos candidatos;
4. identificar hubs;
5. validar en transcriptomas skin-only.

## Próximo paso recomendado

Antes del enriquecimiento biológico, probar estabilidad entre temporadas mediante:

```
Eigengene ~ Cultivar * Stage * Year
```

y estimar Cabernet vs Pinot por Stage × Year.

El objetivo no es exigir que Year sea irrelevante, sino saber si el patrón cultivar-etapa principal es reproducible o si depende de una sola temporada.

En paralelo deben revisarse:
- module_eigengene_qc.tsv
- module_model_diagnostics.tsv
- module_eigengenes_with_metadata_54.tsv
- tabla completa de contrastes, no solo los significativos.
