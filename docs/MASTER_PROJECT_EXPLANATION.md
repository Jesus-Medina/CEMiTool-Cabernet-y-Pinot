# Explicación maestra del proyecto CEMiTool Cabernet Sauvignon vs Pinot noir

## 0. Cómo leer este documento

Este documento reconstruye el proyecto de principio a fin para una persona que parte desde cero. No reemplaza los archivos científicos: enlaza la pregunta, los datos, los scripts, las tablas y las conclusiones con sus límites.

Documentos complementarios:

- [Historia completa](MASTER_PROJECT_HISTORY.md)
- [Catálogo de archivos](MASTER_FILE_CATALOG.md)
- [Catálogo de scripts](MASTER_SCRIPT_CATALOG.md)
- [Catálogo de tablas](MASTER_TABLE_CATALOG.md)
- [Linaje de datos](MASTER_DATA_LINEAGE.md)
- [Glosario técnico](MASTER_GLOSSARY.md)
- [Matriz de evidencia](MASTER_EVIDENCE_MATRIX.md)

Estado auditado: 2026-09-21. Se verificó el árbol remoto de GitHub y se contrastaron documentos, scripts canónicos y resultados vigentes. El repositorio contiene 539 archivos tras esta auditoría: 285 canónicos y 254 históricos. Hay 27 scripts canónicos en `scripts/` y 69 tablas TSV/CSV bajo `results/`.

---

# 1. Pregunta científica

La pregunta actual no es “qué gen causa una piel gruesa o fina”. El conjunto primario no mide grosor de piel y el tejido no es piel aislada.

La pregunta operacional es:

> ¿Qué programas de coexpresión cambian de forma diferente durante el desarrollo de la baya entre Cabernet Sauvignon y Pinot noir, cuáles de esas diferencias se repiten entre años, qué funciones biológicas representan, qué genes son centrales dentro de esos programas y cuáles conservan una señal concordante en datos independientes de piel aislada?

La cadena de evidencia buscada es:

```
diseño reproducible
→ red de coexpresión
→ sensibilidad beta7/beta10
→ estadística factorial
→ robustez entre años
→ anotación/ORA
→ hubs
→ validación en piel aislada
→ reprocesamiento FASTQ moderno
```

La última capa aún no se ha ejecutado.

---

# 2. Qué es el dataset GSE98923

## 2.1 GEO, GSE, GSM, BioProject y SRA

**GEO** es el repositorio Gene Expression Omnibus de NCBI. Un **GSE** es una serie de expresión que agrupa un experimento; aquí es **GSE98923**. Un **GSM** identifica una muestra concreta. **BioProject** agrupa un proyecto de secuenciación; aquí PRJNA386889. **SRA** almacena lecturas crudas de secuenciación; la serie asociada es SRP107227.

## 2.2 RNA-seq

RNA-seq mide fragmentos de RNA convertidos a secuencias. En términos sencillos, permite estimar cuánto RNA asociado a cada gen aparece en una muestra. No mide directamente proteína, actividad enzimática ni causalidad.

## 2.3 Diseño de 54 muestras

Se congeló un diseño balanceado:

- 2 cultivares: Cabernet Sauvignon y Pinot noir;
- 3 etapas: FruitSet, Veraison y Harvest;
- 3 años: 2012, 2013 y 2014;
- 3 réplicas biológicas por celda.

`2 × 3 × 3 × 3 = 54`.

Una **réplica biológica** es una muestra biológica independiente dentro de una condición. Los 219 puntos del estudio completo no son 219 réplicas equivalentes: muchos son otros tiempos de desarrollo. Usarlos como réplicas inflaría artificialmente N y mezclaría etapas.

## 2.4 Muestras exactas

| Cultivar | Año | Etapa | GSM |
|---|---:|---|---|
| Cabernet Sauvignon | 2012 | FruitSet | GSM2627691, GSM2627692, GSM2627693 |
| Cabernet Sauvignon | 2012 | Veraison | GSM2627709, GSM2627711, GSM2627713 |
| Cabernet Sauvignon | 2012 | Harvest | GSM2627739, GSM2627740, GSM2627741 |
| Cabernet Sauvignon | 2013 | FruitSet | GSM2627742, GSM2627743, GSM2627744 |
| Cabernet Sauvignon | 2013 | Veraison | GSM2627754, GSM2627755, GSM2627756 |
| Cabernet Sauvignon | 2013 | Harvest | GSM2627781, GSM2627782, GSM2627783 |
| Cabernet Sauvignon | 2014 | FruitSet | GSM2627784, GSM2627785, GSM2627786 |
| Cabernet Sauvignon | 2014 | Veraison | GSM2627793, GSM2627794, GSM2627795 |
| Cabernet Sauvignon | 2014 | Harvest | GSM2627820, GSM2627821, GSM2627822 |
| Pinot noir | 2012 | FruitSet | GSM2627823, GSM2627824, GSM2627825 |
| Pinot noir | 2012 | Veraison | GSM2627835, GSM2627836, GSM2627837 |
| Pinot noir | 2012 | Harvest | GSM2627850, GSM2627851, GSM2627852 |
| Pinot noir | 2013 | FruitSet | GSM2627853, GSM2627854, GSM2627855 |
| Pinot noir | 2013 | Veraison | GSM2627862, GSM2627863, GSM2627864 |
| Pinot noir | 2013 | Harvest | GSM2627883, GSM2627884, GSM2627885 |
| Pinot noir | 2014 | FruitSet | GSM2627886, GSM2627887, GSM2627888 |
| Pinot noir | 2014 | Veraison | GSM2627895, GSM2627896, GSM2627897 |
| Pinot noir | 2014 | Harvest | GSM2627919, GSM2627920, GSM2627921 |

La tabla canónica está en `data/metadata/samples.tsv`.

## 2.5 Tejido: pericarpio no es piel aislada

Las bayas fueron procesadas sin semillas y el material analizado corresponde a pericarpio. La piel forma parte del pericarpio, pero también hay otros tejidos. Por eso una señal de expresión puede venir de piel, pulpa u otra composición del pericarpio. La validación T-007 se diseñó precisamente para preguntar si candidatos seleccionados también aparecen en piel aislada.

---

# 3. De RPKM a la matriz usada

El archivo de entrada histórico es:

`data/raw/geo/GSE98923/GSE98923_RPKM_2012-2013-2014_controls.txt.gz`.

**RPKM** normaliza lecturas por longitud del gen y tamaño de biblioteca. Conceptualmente:

`RPKM ∝ lecturas_del_gen / (longitud_del_gen × total_de_lecturas)`.

Sirve como baseline reproducible porque es el dato procesado publicado, pero hoy no es la opción más fuerte para inferencia RNA-seq moderna.

El script `scripts/master/02_prepare_data.R` selecciona las 54 columnas correctas, valida IDs y valores y calcula:

`log2(RPKM + 1)`.

Se suma 1 para que RPKM=0 sea transformable: `log2(0+1)=0`. El log comprime valores extremos y vuelve más manejables las diferencias de escala.

Archivos:

- `data/processed/expression_rpkm.tsv`: matriz humana de RPKM.
- `data/processed/expression_log2rpkm.tsv`: misma matriz transformada.
- `data/processed/expression_log2rpkm.rds`: objeto R equivalente usado por scripts.

Un cero en esta matriz significa RPKM publicado igual a cero; no prueba por sí solo ausencia biológica del gen. Puede reflejar cobertura, mapeo, filtro o biología.

---

# 4. Qué hace CEMiTool

## 4.1 Coexpresión

Una red de coexpresión conecta genes que cambian juntos entre muestras. Si dos genes suben y bajan de forma parecida, su correlación es alta.

**Correlación de Pearson** va de -1 a +1:

- +1: movimiento lineal conjunto;
- 0: sin relación lineal;
- -1: movimiento lineal opuesto.

La red primaria es **unsigned**, de modo que la fuerza de relación usa el valor absoluto de la correlación. Una correlación -0,9 puede ser tan fuerte como +0,9 para construir adyacencia.

## 4.2 Adyacencia y beta

La adyacencia de este proyecto se comporta como:

`a_ij = |cor(i,j)|^β`.

Con β=10:

- |r|=0,9 → 0,9^10 ≈ 0,349;
- |r|=0,5 → 0,5^10 ≈ 0,001;
- |r|=0,2 → 0,2^10 ≈ 0,0000001.

El soft threshold conserva pesos continuos pero castiga correlaciones moderadas.

## 4.3 Scale-free R² y conectividad

CEMiTool evalúa qué tan compatible es la distribución de conectividad con una aproximación scale-free. El R² de ese ajuste es un diagnóstico, no una ley biológica. Subir beta suele aumentar ajuste pero bajar conectividad. Por eso no existe un “beta verdadero” universal.

## 4.4 TOM y módulos

TOM (Topological Overlap Measure) evalúa no solo si dos genes están conectados directamente, sino si comparten vecinos. Luego se agrupan genes en módulos. `min_ngen=30` fija un tamaño mínimo; `merge_similar=TRUE` permite fusionar módulos suficientemente similares.

`Not.Correlated` reúne genes filtrados que no quedaron en un módulo biológico interpretable.

---

# 5. Beta7 y beta10

## 5.1 Beta7

La primera corrida llegó a beta7 mediante el comportamiento de selección/forzado de CEMiTool. Luego se reprodujo explícitamente para auditarla.

Resultados:

- 3.050 genes filtrados;
- R² = 0,5495792734;
- 8 módulos biológicos + Not.Correlated;
- tamaños: M1 2340, M2 224, M3 112, M4 106, M5 98, M6 71, M7 42, M8 40, NC 17.

## 5.2 Beta10

Beta10 se fijó explícitamente con `set_beta=10`, `force_beta=FALSE`.

Resultados:

- R² = 0,7063742471;
- 10 módulos biológicos + Not.Correlated;
- tamaños: M1 2167, M2 214, M3 131, M4 122, M5 108, M6 68, M7 54, M8 48, M9 42, M10 39, NC 57.

## 5.3 Por qué beta10 quedó principal

No se compararon nombres de módulos, porque M5 de una corrida no tiene por qué ser M5 de otra. Se comparó pertenencia génica usando intersección, retención y Jaccard.

Jaccard:

`J(A,B)=|A∩B|/|A∪B|`.

Ejemplo: si A tiene 100 genes, B 110 y comparten 90, la unión tiene 120 y J=90/120=0,75.

Nuestros mejores emparejamientos beta7→beta10 muestran alta preservación en la mayoría de los módulos; por ejemplo M1→M1 J≈0,912 y M8→M9 J≈0,952. M6 es menos estable. Por eso beta10 se usa como red primaria y beta7 como sensibilidad. Beta10 no se denomina “verdadera” y beta7 “falsa”.

Archivos clave: `results/comparisons/`.

---

# 6. Eigengenes: resumir un módulo

Un módulo puede contener decenas o miles de genes. Para analizar su comportamiento se calculó un resumen por muestra mediante PCA.

**PCA** busca combinaciones lineales que capturen variación. **PC1** es la primera componente y explica la mayor fracción posible de variación entre muestras.

El eigengene usado aquí es PC1 de los genes estandarizados de cada módulo. No es un gen real.

El signo de PCA es matemáticamente arbitrario. El script 07 lo invierte si hace falta para correlacionarlo positivamente con la media del módulo. Esto facilita interpretación sin cambiar p-valores.

No se deben comparar directamente magnitudes absolutas de PC1 entre módulos, porque cada PCA tiene su propia escala y composición.

Archivos:

- `module_eigengene_qc.tsv`
- `module_eigengenes_54.tsv`
- `module_eigengenes_with_metadata_54.tsv`

---

# 7. Modelo factorial

El modelo inicial por módulo fue:

`Eigengene ~ Cultivar * Stage + Year`.

La variable dependiente es el eigengene. Cultivar, Stage y Year son factores.

En R:

`Cultivar * Stage = Cultivar + Stage + Cultivar:Stage`.

La interacción Cultivar:Stage pregunta si la diferencia Cabernet–Pinot cambia según etapa.

Se usó ANOVA tipo III con contrastes suma-a-cero. El p-valor se corrigió con Benjamini-Hochberg (BH). El FDR controla la proporción esperada de falsos descubrimientos entre resultados declarados.

Cinco módulos tuvieron interacción Cultivar×Stage con FDR<0,05:

| Módulo | FDR interacción |
|---|---:|
| M5 | 5,29×10^-22 |
| M10 | 0,001052 |
| M2 | 0,01951 |
| M3 | 0,01951 |
| M1 | 0,03965 |

M6 no pasó la interacción (FDR≈0,100), aunque tuvo un contraste FruitSet significativo; por eso es señal secundaria, no interacción establecida.

---

# 8. Contrastes Cabernet − Pinot

Un contraste compara medias estimadas.

`Cabernet Sauvignon - Pinot noir`:

- positivo: eigengene mayor en Cabernet;
- negativo: eigengene menor en Cabernet;
- cero: sin diferencia estimada.

Esto no significa que todos los genes del módulo cambien en el mismo sentido.

En el modelo agregado destacaron:

- M5 Harvest -22,279;
- M2 Veraison -25,367;
- M2 Harvest -21,832;
- M2 FruitSet -15,558;
- M10 Harvest -3,356;
- M3 Harvest -6,989;
- M10 Veraison -2,128;
- M6 FruitSet +6,146;
- M5 Veraison -2,458.

Los 30 contrastes completos están en `cabernet_vs_pinot_within_each_stage.tsv`.

---

# 9. QC: por qué no se aceptó el modelo a ciegas

T-003 recomputó eigengenes y modelos desde los objetos congelados.

Se revisaron:

- residuos;
- residuos estandarizados;
- R²;
- observaciones influyentes;
- consistencia de contrastes y FDR.

Se detectaron observaciones con |residuo estandarizado|>3 en M2, M3, M5 y M9. M9 tuvo R² aditivo bajo. M5 incluyó una muestra Pinot Veraison 2012 influyente: GSM2627837.

Una observación rara no se borra automáticamente. Primero se pregunta si es error técnico, variabilidad biológica o patrón de celda. Ninguna muestra se eliminó del análisis principal.

---

# 10. Robustez por año

Se ajustó:

`Eigengene ~ Cultivar * Stage * Year`.

La interacción de tres vías pregunta si la interacción Cultivar×Stage cambia según año.

Se calcularon 90 contrastes: 10 módulos × 3 etapas × 3 años.

Resultado esencial:

- **M10**: reproducible según la regla prefijada.
- **M5**: dependiente del año a nivel global, pero Harvest se repite en los tres años.
- **M2**: dependiente del año, pero Veraison y Harvest se repiten en los tres años.
- **M3**: Harvest dominado por 2013; no promover como estable.
- **M1**: no estable.

La diferencia crítica es esta:

> “el módulo depende del año” describe el patrón global completo; “un contraste concreto se reproduce en tres años” describe una subcomparación específica.

Para M5 Harvest, Cabernet−Pinot fue aproximadamente -25,03, -20,92 y -20,89 en 2012, 2013 y 2014, todos detectados tras FDR global. Veraison 2012 sí es sensible a GSM2627837.

---

# 11. ORA y anotación funcional

## 11.1 Qué es ORA

ORA pregunta si una categoría funcional aparece más veces dentro de un módulo de lo esperado por azar.

Ejemplo: universo de 100 genes, 10 pertenecen a una vía, módulo de 20 genes. Si el módulo contiene 8 genes de esa vía, frente a ~2 esperados bajo muestreo aleatorio, hay sobrerrepresentación.

Se usó prueba hipergeométrica unilateral y BH FDR.

## 11.2 Cobertura

Los IDs `VIT_` son legado v1. Se mapearon con equivalencias recíprocas uno-a-uno, misma hebra y ≥50% de solapamiento.

Cobertura:

- MapMan v3: 2.608/3.050 genes;
- MapMan T2T v5.1: 1.305/3.050;
- GO v5.1: 519/3.050.

Por eso MapMan v3 es inferencialmente principal. Una ausencia de enriquecimiento con baja cobertura no prueba ausencia biológica.

## 11.3 M5

M5 contiene 108 genes; 93 tienen anotación MapMan v3.

Resultados:

- “stilbenoid biosynthesis”: 18/19 genes del fondo están en M5; p=2,93×10^-26; FDR global=6,63×10^-23.
- PAL: 7/8; FDR global=1,72×10^-7.
- tema fenilpropanoide: 7/12; FDR global=3,21×10^-6.

La anotación v5.1 llama a 16 de esos mismos genes CHS/flavonoide. No son dos validaciones independientes: son los mismos genes con etiquetas distintas. La expresión segura es **bloque/familia anotada de metabolismo fenólico**.

## 11.4 Otros módulos

- M10: 36/39 anotados en v3, pero ningún término pasa FDR global. No significa “sin función”; significa función no resuelta por este ORA.
- M2: categoría amplia de oxidoreductasas EC 1.3, FDR global≈1,98×10^-4.
- M4: términos de pared celular/expansinas, pero M4 no era módulo prioritario por Cultivar×Stage.
- M9: los hits GO corregidos son desarrollo/maduración de semilla/fruto; no es señal prioritaria de Cabernet vs Pinot.

No se estableció enriquecimiento en módulos prioritarios para cutina/cera, pectina, celulosa/hemicelulosa, lignina o antocianinas. Epidermis no fue evaluable con esas taxonomías MapMan.

---

# 12. Auditoría GO

El primer filtro eliminaba términos cuyo nombre incluía “obsolete”. La auditoría T-005A contrastó todos los IDs con `go.obo` oficial.

Se encontraron:

- 3.166 términos vigentes;
- 390 obsoletos;
- 209 obsoletos no advertidos por el nombre textual.

Después de excluirlos, el fondo siguió en 519 genes y las pruebas evaluables bajaron de 6.864 a 6.344. Los seis hits globales siguieron en M9. Por tanto, la corrección mejoró validez ontológica sin cambiar la conclusión principal.

La tabla antigua `results/functional_enrichment_beta10/v5_go_all_terms.tsv` queda histórica; para GO inferencial se usa `results/go_ora_beta10/go_all_terms.tsv`.

---

# 13. Hubs

Un **hub** es un gen muy conectado dentro de un módulo.

La métrica primaria es:

`kWithin_i = Σ_j a_ij`

sobre las otras genes del módulo.

Como la red es unsigned, un peso alto no dice si un gen activa o reprime otro; solo que hay relación fuerte de coexpresión.

`kME` es correlación con el eigengene. Se reporta como métrica secundaria.

“Top decile” es un corte descriptivo: top 10% de genes por kWithin. No es un p-valor.

---

# 14. M5: la historia más coherente

Los 11 hubs principales de M5 incluyen:

1. `VIT_16s0100g00780` — CHS/STS ambiguo;
2. `VIT_16s0100g00750` — CHS/STS ambiguo;
3. `VIT_16s0100g00770`;
4. `VIT_16s0100g01100`;
5. `VIT_05s0020g03280` — CuAO;
6. `VIT_16s0100g00910`;
7. `VIT_12s0028g00860` — NAC;
8. `VIT_16s0100g01140`;
9. `VIT_06s0004g02010` — sin función verificada;
10. `VIT_16s0100g01150`;
11. `VIT_16s0100g01070`.

Ocho de 11 pertenecen al bloque CHS/STS ambiguo.

**CHS** (chalcone synthase) y **STS** (stilbene synthase) son enzimas emparentadas. Los dominios PF00195/PF02797 identifican la familia compartida, pero no separan con certeza una actividad CHS de una STS.

Dieciséis genes CHS etiquetados en v5.1 se ubican en un intervalo de ~494 kb del cromosoma 16 de PN40024. La proximidad es compatible con duplicación/expansión de familia, pero no la demuestra sin secuencia, filogenia, sintenia y genomas de ambos cultivares.

Un análisis de sensibilidad retiró los 18 genes etiquetados v3-stilbenoid y recalculó PC1 de los 90 restantes. La correlación con M5 original fue r≈0,9991 y Harvest mantuvo Cabernet<Pinot en los tres años. Esto muestra que el comportamiento M5 no depende exclusivamente de esas 18 copias.

NAC es candidato regulador por centralidad y anotación, no porque se haya demostrado que controle CHS/STS. CuAO es otro hub fuerte fuera de la familia.

---

# 15. M10 y M2

## M10

Top hubs:

- `VIT_07s0005g01700`: anotado bHLH/UPBEAT-like;
- `VIT_17s0000g01930`: transportador HAK/KUP/KT;
- `VIT_17s0000g05580`: sin función verificable;
- `VIT_17s0000g00430`: bHLH/CIB en v3.

M10 es el módulo temporalmente más reproducible, pero no tiene enriquecimiento global claro. La reproducibilidad del módulo no convierte automáticamente cada hub en gen validado.

## M2

Entre los hubs destacan:

- `VIT_16s0039g01920`: MYB;
- `VIT_18s0117g00140`: FAR1;
- varios genes poco anotados/oxidoreductasas.

Nueve de 22 top hubs tienen cero exacto en ≥7/9 muestras Cabernet Harvest. Eso puede ser expresión real, pérdida/cambio de copia, paralogía, multimapping o sesgo de referencia. El baseline RPKM no permite distinguir esas hipótesis.

---

# 16. Validación externa en piel aislada

Validar externamente significa comprobar si una señal definida en el estudio primario aparece en otro experimento. No se mezclaron esas muestras con las 54 originales.

Fuentes:

- **GSE72421**: microarray de piel, comparación principal WW, 5 Cabernet y 5 Pinot.
- **PRJNA260535**: RNA-seq de piel, comparación principal 24 °Brix, 3 Cabernet y 3 Pinot.

Un microarray mide señal de sondas por hibridación; miembros muy parecidos de una familia pueden hibridar cruzadamente. RNA-seq ofrece secuencias, pero también puede sufrir multimapping/reference bias.

Resultados de hubs:

| Módulo | Microarray principal | RNA-seq 24 °Brix | Lectura |
|---|---|---|---|
| M5 | 11/11 evaluables, 11 FDR<0,05 | 7/11 evaluables, 4 FDR<0,05 | soporte externo fuerte entre evaluables |
| M10 | 4/4 evaluables, 1 significativo | 3/4, 0 significativos | soporte individual limitado |
| M2 | 22/22, 18 significativos | 8/22, 7 significativos | apoyo, pero cobertura y mapeo son preocupación |

En M5, CuAO `VIT_05s0020g03280` y NAC `VIT_12s0028g00860` presentan Cabernet<Pinot y FDR<0,05 en ambos ensayos principales. Dos miembros del bloque CHS/STS (`VIT_16s0100g00750`, `VIT_16s0100g01100`) también pasan en RNA-seq 24 °Brix.

En M2, MYB y FAR1 concuerdan en ambos ensayos principales.

Esto apoya **expresión concordante en piel**. No prueba actividad enzimática, regulación directa ni grosor de piel.

---

# 17. Qué historia emerge

La historia con más capas convergentes es:

```
M5
→ interacción Cultivar×Stage extremadamente fuerte
→ Harvest Cabernet < Pinot en 2012, 2013 y 2014
→ ORA de metabolismo fenólico
→ bloque central CHS/STS ambiguo
→ NAC y CuAO como hubs fuera de la familia
→ señal M5 persiste sin las 18 copias anotadas
→ NAC/CuAO y algunos miembros CHS/STS muestran apoyo en piel aislada
```

Esta narrativa está **apoyada**, no demostrada como mecanismo causal.

M10 ofrece la reproducibilidad temporal más limpia pero función/hubs externamente menos resueltos. M2 ofrece MYB/FAR1 y repetición en Veraison/Harvest, pero tiene una alerta fuerte de ceros y referencia. M3/M1 no alcanzan la misma robustez estacional. M4/M9 tienen funciones interesantes pero no están alineados con la señal principal de Cultivar×Stage.

---

# 18. Qué NO sabemos todavía

No está demostrado que:

- M5 cause diferencias de grosor de piel;
- NAC regule directamente los genes CHS/STS;
- los genes del bloque chr16 sean inequívocamente STS o CHS;
- los ceros M2 sean verdadera ausencia de expresión;
- la diferencia observada sea causada solo por cultivar, porque existen diferencias de clon/rootstock/plantación;
- los resultados RPKM históricos sean idénticos bajo una referencia moderna.

---

# 19. T-008: por qué FASTQ es el siguiente cuello de botella

Un reprocesamiento desde FASTQ con referencia/anotación moderna permitirá:

- reasignar lecturas con criterios modernos;
- examinar multimapping entre parálogos CHS/STS;
- cuantificar sesgo de referencia;
- revisar los ceros extremos de M2;
- modernizar IDs/anotaciones;
- comparar conservación de módulos/candidatos sin borrar el baseline histórico.

No garantiza resolver CHS vs STS por sí solo: si las secuencias son demasiado similares puede requerirse análisis de variantes, ensamblaje, genomas de cultivar o evidencia experimental.

---

# 20. T-009: producto final

El informe/manuscrito final debe integrar:

1. diseño y selección de 54 muestras;
2. baseline RPKM;
3. beta7/beta10;
4. red beta10;
5. eigengenes y modelo factorial;
6. QC;
7. robustez anual;
8. ORA y auditoría GO;
9. hubs;
10. validación de piel;
11. reprocesamiento moderno;
12. limitaciones y matriz de evidencia.

El informe acumulativo actual aún no integra formalmente T-004 a T-007.

---

# 21. Discrepancias y artefactos heredados detectados

1. `scripts/post/06_compare_beta7_beta10.R` conserva rutas absolutas del workspace original. Sus resultados canónicos existen en `results/comparisons/`, pero el script no es portable sin editar rutas.
2. `scripts/master/03_run_cemitool.R`, `04_export_results.R` y `05_render_reports.R` reflejan la estructura pre-migración (`results/objects`, `results/tables`, `reports/assets`, `templates`). Los resultados fueron promovidos a `results/beta10/`, `reports/current/` y `reports/templates/`. Estos scripts son reproducibilidad histórica, no un runner canónico posmigración listo para ejecutar sin adaptación.
3. `docs/09_reportes_generados.md` contiene una política antigua de excluir binarios; el estado actual del repo sí conserva PDF/DOCX/HTML bajo la política de sincronización nueva.
4. El GO antiguo de T-005 queda superseded para inferencia por T-005A.
5. El informe acumulativo actual es correcto para la capa que contiene, pero está desactualizado respecto de T-004–T-007.

Estas discrepancias no cambian los resultados ya auditados; deben leerse como diferencias de versión/estructura.

---

# 22. Regla de interpretación final

La conclusión defendible hoy es:

> Se identificó un programa de coexpresión M5 con fuerte interacción cultivar-desarrollo, un contraste Cabernet<Pinot en Harvest repetido durante tres años, enriquecimiento de metabolismo fenólico, hubs de una familia CHS/STS junto con NAC/CuAO y apoyo de expresión concordante para varios candidatos en datos independientes de piel aislada.

La conclusión **no** defendible es:

> “M5/NAC/CHS/STS explican el grosor de piel de Cabernet vs Pinot.”

Esa segunda frase requiere fenotipo, resolución molecular de copias, reprocesamiento moderno y evidencia funcional/causal que aún no existe.
