# CEMiTool — Cabernet Sauvignon vs Pinot noir

Proyecto reproducible de análisis de coexpresión génica en vid usando **CEMiTool** y el dataset público **GEO GSE98923**.

## Objetivo

Comparar **Cabernet Sauvignon** y **Pinot noir** a través de tres etapas del desarrollo de la baya —**Fruit set, Véraison y Harvest**— preservando la información de **2012, 2013 y 2014**, para identificar módulos de coexpresión y genes candidatos asociados con diferencias de desarrollo y con procesos potencialmente relevantes para la piel de la baya.

> Importante: GSE98923 corresponde a pericarpio de baya (piel + pulpa), no a piel aislada, y no mide grosor de piel. Por eso este proyecto evita interpretar directamente un módulo como “causa de piel gruesa/fina”. La estrategia es identificar programas transcriptómicos candidatos y después validarlos con datos skin-only.

## Diseño principal

Se congeló un baseline balanceado de:

- 2 cultivares: Cabernet Sauvignon y Pinot noir
- 3 etapas: FruitSet, Veraison, Harvest
- 3 años: 2012, 2013, 2014
- 3 réplicas biológicas por combinación

**Total: 54 muestras, 9 muestras por clase cultivar-etapa.**

Las 219 muestras completas de GSE98923 quedan reservadas para análisis temporal exploratorio/sensibilidad y no se usan como falsas réplicas de las tres etapas principales.

## Fuente y procesamiento

- GEO: GSE98923
- Matriz procesada oficial: RPKM
- Transformación baseline: `log2(RPKM + 1)`
- CEMiTool
- Pearson
- network_type = unsigned
- tom_type = signed
- filter = TRUE
- filter_pval = 0.1
- apply_vst = FALSE
- min_ngen = 30
- seed = 1234

## Historia resumida del análisis

### 1. Selección y trazabilidad de muestras

Se construyó una selección exacta de 54 GSM, con metadata de cultivar, año, etapa, time point, réplica y evidencia usada para asignar FruitSet/Veraison/Harvest.

La asignación de **Véraison** se apoya en las muestras GEO con `day after veraison = 0`. Fruit set y Harvest se definieron a partir del protocolo temporal de muestreo del estudio.

### 2. Primer baseline CEMiTool

La selección automática de soft-thresholding beta no alcanzó el criterio deseado. Una primera corrida reproducida con **beta = 7** produjo:

- 29,971 genes de entrada
- 3,050 genes retenidos por el filtrado de CEMiTool
- R² scale-free ≈ 0.5496
- 8 módulos biológicos + Not.Correlated

Tamaños de módulos beta 7:

| Grupo | Genes |
|---|---:|
| M1 | 2340 |
| M2 | 224 |
| M3 | 112 |
| M4 | 106 |
| M5 | 98 |
| M6 | 71 |
| M7 | 42 |
| M8 | 40 |
| Not.Correlated | 17 |

### 3. Evaluación de beta

Los diagnósticos mostraron que el ajuste scale-free aumentaba al incrementar beta, mientras la conectividad media disminuía. Se eligió **beta = 10** como candidato de compromiso para análisis de sensibilidad y se fijó explícitamente con:

```r
set_beta = 10
force_beta = FALSE
```

La corrida beta 10 produjo:

- R² scale-free ≈ 0.7064
- 10 módulos biológicos + Not.Correlated

| Grupo | Genes |
|---|---:|
| M1 | 2167 |
| M2 | 214 |
| M3 | 131 |
| M4 | 122 |
| M5 | 108 |
| M6 | 68 |
| M7 | 54 |
| M8 | 48 |
| M9 | 42 |
| M10 | 39 |
| Not.Correlated | 57 |

### 4. Robustez beta 7 vs beta 10

Se comparó pertenencia gen-a-módulo entre ambas redes. La estructura fue altamente estable en la mayoría de módulos:

| Beta 7 | Mejor match beta 10 | Genes compartidos | Jaccard | % beta7 retenido |
|---|---|---:|---:|---:|
| M1 | M1 | 2150 | 0.912 | 91.9% |
| M2 | M2 | 203 | 0.864 | 90.6% |
| M3 | M3 | 105 | 0.761 | 93.8% |
| M4 | M5 | 101 | 0.894 | 95.3% |
| M5 | M4 | 91 | 0.705 | 92.9% |
| M6 | M8 | 46 | 0.630 | 64.8% |
| M7 | M10 | 34 | 0.723 | 81.0% |
| M8 | M9 | 40 | 0.952 | 100.0% |

Conclusión metodológica actual:

- **beta 10 = red principal**
- **beta 7 = análisis de sensibilidad/robustez**

El ajuste de beta queda cerrado salvo que cambien la matriz de expresión, el filtrado, las muestras o la normalización.

## Próximo análisis

El paso siguiente es cuantificar un eigengene/PC1 por módulo para las 54 muestras y ajustar:

```r
Eigengene ~ Cultivar * Stage + Year
```

Objetivos:

1. probar efecto de Cultivar;
2. probar efecto de Stage;
3. controlar Year;
4. identificar interacción **Cultivar × Stage**;
5. comparar Cabernet vs Pinot dentro de FruitSet, Veraison y Harvest;
6. corregir múltiples pruebas con Benjamini-Hochberg FDR.

Luego se priorizarán módulos candidatos por:

- robustez entre años;
- interacción cultivar-etapa;
- procesos de pared celular, pectina, cutícula/cera, epidermis, fenilpropanoides/flavonoides/antocianinas;
- genes hub;
- validación externa en datasets de piel aislada.

## Limitaciones que se mantienen explícitas

- El tejido original no es skin-only.
- No existe una medición directa de grosor de piel en GSE98923.
- Solo hay dos cultivares, por lo que no se puede etiquetar de forma causal todo contraste como “piel gruesa vs fina”.
- Cultivar está confundido con otras diferencias biológicas/genéticas y con clone/rootstock/edad de plantación del experimento.
- El baseline usa RPKM y una anotación histórica; una versión más fuerte del estudio debería considerar reprocesamiento desde FASTQ y anotación moderna.
- El análisis de CEMiTool por clase no sustituye el modelo factorial externo que incluye Year.

## Repository organization

```text
.
├── README.md
├── CHANGELOG.md
├── docs/
│   ├── LOCAL_PROJECT_INVENTORY.md
│   └── SYNC_POLICY.md
├── data/
│   ├── metadata/
│   ├── processed/
│   └── raw/
├── scripts/
│   ├── baseline/
│   ├── master/
│   └── post/
├── results/
│   ├── beta7/
│   ├── beta10/
│   ├── comparisons/
│   ├── diagnostics/
│   └── module_statistics_beta10/
├── reports/
│   ├── current/
│   ├── archive/
│   └── supplementary/
├── manuscript/
└── history/
    └── local_workspace/
```

La estructura canónica (`scripts/`, `data/`, `results/`, `reports/`, `manuscript/` y `docs/`) se usa para el trabajo actual y futuro. `reports/current/` mantiene el informe técnico vigente; `reports/archive/` conserva versiones anteriores. `history/local_workspace/` es el archivo íntegro por carpetas del workspace local anterior y no debe limpiarse ni reorganizarse.

## Sync workflow

Antes de trabajar en RStudio:

```bash
git pull origin main
```

Después de revisar los resultados generados:

```bash
git add <reviewed-paths>
git commit -m "describe the analysis update"
git push origin main
```

Los objetos científicos grandes se gestionan con Git LFS. La política completa está en `docs/SYNC_POLICY.md` y el inventario inicial en `docs/LOCAL_PROJECT_INVENTORY.md`.

## Reproducibilidad

Los scripts contienen la selección exacta de muestras y generan estructura de carpetas, matrices procesadas, objeto CEMiTool, tablas, diagnósticos, reportes y registros de sesión.

Los archivos públicos de GEO pueden conservarse en `data/raw/` cuando aportan reproducibilidad exacta; el pipeline mantiene además la capacidad de descargarlos de forma reproducible.

## Estado

**En curso.** El repositorio se irá actualizando con cada nueva etapa del análisis, conservando además las decisiones y resultados anteriores para que el informe final pueda reconstruir todo el proceso, no solo la versión final.
