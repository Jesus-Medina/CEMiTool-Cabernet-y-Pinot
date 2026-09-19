# 04 — Beta 7 vs beta 10

## Parámetros comparados

Las dos corridas usan la misma matriz de 54 muestras y el mismo preprocessing. El cambio principal es el soft-thresholding power.

| Métrica | beta 7 | beta 10 |
|---|---:|---:|
| R² scale-free | 0.549579 | 0.706374 |
| Genes retenidos por filtro | 3050 | 3050 |
| Módulos biológicos | 8 | 10 |
| Not.Correlated | 17 | 57 |

## Tamaño de módulos

| Grupo | beta 7 | beta 10 |
|---|---:|---:|
| M1 | 2340 | 2167 |
| M2 | 224 | 214 |
| M3 | 112 | 131 |
| M4 | 106 | 122 |
| M5 | 98 | 108 |
| M6 | 71 | 68 |
| M7 | 42 | 54 |
| M8 | 40 | 48 |
| M9 | — | 42 |
| M10 | — | 39 |
| Not.Correlated | 17 | 57 |

## Mejor correspondencia por genes

| beta 7 | beta 10 | Shared | Jaccard | % beta7 retenido |
|---|---|---:|---:|---:|
| M1 | M1 | 2150 | 0.9122 | 91.88 |
| M2 | M2 | 203 | 0.8638 | 90.63 |
| M3 | M3 | 105 | 0.7609 | 93.75 |
| M4 | M5 | 101 | 0.8938 | 95.28 |
| M5 | M4 | 91 | 0.7054 | 92.86 |
| M6 | M8 | 46 | 0.6301 | 64.79 |
| M7 | M10 | 34 | 0.7234 | 80.95 |
| M8 | M9 | 40 | 0.9524 | 100.00 |
| Not.Correlated | Not.Correlated | 17 | 0.2982 | 100.00 |

## Interpretación

La red beta10 no reemplaza la estructura por otra completamente distinta. La mayor parte de los módulos beta7 conserva una fracción alta de sus genes en un módulo beta10 equivalente.

Hay dos detalles importantes:

1. los nombres de módulos cambian entre corridas (por ejemplo M4 beta7 corresponde mejor a M5 beta10);
2. M6 es el módulo menos estable y debe tratarse con especial cautela.

## Decisión de trabajo

**beta10 se usa como red principal. beta7 se conserva como sensibilidad.**

La razón no es solo que beta10 tenga un R² mayor, sino que esa mejora ocurre manteniendo una estructura de módulos mayoritariamente concordante.

## Warnings observados

Los warnings de ejecución incluyeron:

- ejecución secuencial de `%dopar%` sin backend paralelo;
- deprecaciones internas de ggplot2 usadas por CEMiTool;
- pequeña proporción de ties en estadísticas preranked de GSEA (~0.10–0.13%);
- advertencia explícita en beta7 por R² < 0.60.

No se observó en esos warnings un error que invalidara la corrida.
