# T-005 — Anotación funcional y enriquecimiento beta10

Ejecutado el 2026-09-21 desde la raíz canónica con
`source("scripts/post/10_prepare_vitis_annotations_beta10.R")` y después
`source("scripts/post/11_functional_enrichment_beta10.R")`. Se usaron los
3.050 genes filtrados y sus módulos beta10 **sin reconstruir la red ni
cambiar las 54 muestras**. Los resultados son enriquecimientos de módulos
completos, no pruebas de genes responsables de un contraste etapa-año.

## Fuentes, correspondencia de IDs y cobertura

Los IDs de entrada `VIT_...` son de anotación v1. [Grapedia PN40024
Downloads](https://grapedia.org/files-download/) ofrece equivalencias entre
versiones y conjuntos funcionales MapMan/GO para PN40024. Se fijaron URL,
tamaño y SHA-256 de cuatro archivos originales en
`data/reference/grapedia_t005/source_manifest.tsv`. Los archivos originales,
incluida la tabla de equivalencias de 128 MB, se descargaron a caché temporal
y **no** se añadieron al repositorio; los subconjuntos necesarios para los
3.050 genes sí quedaron versionados bajo `data/reference/grapedia_t005/`.

Se aceptó una equivalencia v1→v3 o v1→T2T v5.1 solo si era recíproca
uno-a-uno en la tabla completa, mantenía la hebra y tenía ≥50 % de
solapamiento génico. No se asignaron anotaciones a IDs ambiguos. El archivo
`gene_coverage_audit.tsv` registra cada gen, su módulo y sus banderas de
correspondencia/anotación, incluyendo los no mapeados. Esta pérdida de
cobertura es un riesgo de selección, no ausencia biológica.

| Fuente | Genes anotados del universo beta10 | M10 | M5 | M2 |
|---|---:|---:|---:|---:|
| MapMan v3, análisis principal | 2.608/3.050 (85,5 %) | 36/39 (92,3 %) | 93/108 (86,1 %) | 158/214 (73,8 %) |
| MapMan T2T v5.1, comprobación secundaria | 1.305/3.050 (42,8 %) | 10/39 (25,6 %) | 55/108 (50,9 %) | 40/214 (18,7 %) |
| GO T2T v5.1, exploratorio | 519/3.050 (17,0 %) | 5/39 (12,8 %) | 12/108 (11,1 %) | 12/214 (5,6 %) |

La versión v3 es la comparación inferencial principal por su mejor
correspondencia con el universo original. La T2T v5.1 satisface la
comprobación de anotación más reciente **donde hay correspondencia**, pero
sus resultados negativos no son concluyentes con cobertura tan desigual.
Los términos GO etiquetados como obsoletos se excluyeron antes de probar.

## Método estadístico

- Se evaluaron los diez módulos biológicos completos; `Not.Correlated`
  permanece en el universo de fondo, pero no se interpreta como módulo.
- Para cada fuente, el fondo son los genes beta10 filtrados que tienen al
  menos una anotación válida de esa fuente. Módulos y fondo se restringen de
  forma idéntica. La prueba de sobrerrepresentación es hipergeométrica
  unilateral. Se conservan también los términos con cero genes solapados.
- Se probaron términos con 5–500 genes en ese fondo y módulos con ≥5 genes
  anotados. Los demás aparecen con estado y motivo, no como p=1 ficticio.
- Se aplicó BH por módulo y, de forma principal, conjuntamente sobre todas
  las combinaciones módulo×término probadas de cada fuente: 2.260 pruebas
  MapMan v3, 2.500 MapMan v5.1 y 6.864 GO v5.1 (dos módulos tenían
  menos de cinco genes GO anotados). Las tablas completas
  conservan p, ambos FDR, tamaños, efecto y genes solapados.
- Nueve temas predefinidos se evaluaron como uniones de categorías MapMan:
  cutina/cutícula/cera, epidermis, pared celular, pectina,
  celulosa/hemicelulosa, lignina, fenilpropanoides, flavonoides y
  antocianinas. Se conservan los nueve para todos los módulos, incluidos
  resultados no significativos o no evaluables. El FDR de temas es global
  por fuente; los temas se superponen y no representan evidencias
  independientes.

## Resultados calibrados por T-004

| Módulo | Evidencia funcional principal | Interpretación permitida |
|---|---|---|
| M5 | MapMan v3 «stilbenoid biosynthesis»: 18/19 genes del fondo, 18/93 de M5; p=2,93×10⁻²⁶, FDR global=6,63×10⁻²³. La categoría PAL: 7/8, FDR global=1,72×10⁻⁷. El tema predefinido fenilpropanoide: 7/12, FDR global de temas=3,21×10⁻⁶. | M5 contiene un grupo anotado de metabolismo fenólico. Su contraste de Harvest se repite en los tres años (T-004), pero el enriquecimiento del módulo **no demuestra** que esos genes impulsen ese contraste. |
| M10 | 36/39 genes cubiertos por MapMan v3; ningún término supera FDR global 0,05. | M10 es el módulo con patrón temporal más reproducible de T-004, pero su función concreta sigue sin resolverse por este ORA. No inferir ausencia de función. |
| M2 | Una categoría MapMan v3 de oxidoreductasas EC 1.3: 6/8, FDR global=1,98×10⁻⁴. | Es una etiqueta enzimática amplia, no evidencia de cutícula/piel. T-004 mostró que FruitSet no se reproduce en 2014 aunque Veraison/Harvest sí. |
| M4 | Hay términos de pared celular/expansinas con FDR global <0,05. | No debe elevarse por este hallazgo: M4 no fue un módulo prioritario de interacción Cultivar × Stage en T-003/T-004. |

En los temas predefinidos no hubo enriquecimiento FDR <0,05 para
cutina/cera, pectina, celulosa/hemicelulosa, lignina o antocianinas en los
módulos prioritarios. «Epidermis» no aparece como categoría MapMan en
estos archivos y se marcó **no evaluable**, no negativo. Las categorías
fenólicas, de pared y otras son jerárquicas: varios términos significativos
comparten exactamente los mismos genes y no equivalen a hallazgos
independientes.

### Discordancia de anotación v3 ↔ v5.1 en M5

Dieciséis genes de M5 anotados como «stilbenoid biosynthesis» por MapMan v3
están incluidos en «chalcone synthase / flavonoid biosynthesis» por MapMan
v5.1. El tema flavonoide v5.1 es significativo (17/34 genes del fondo;
FDR de temas 2,94×10⁻¹⁴), pero esta superposición de **los mismos genes**
no es validación independiente del nombre funcional. Hasta revisar la
identidad y evidencia de cada gen, el lenguaje seguro es «familia anotada
de metabolismo fenólico»; no atribuir producción de estilbenos o
flavonoides a genes individuales solo por el ORA. Muchos genes M5 se
concentran en IDs `VIT_16s0100...`, por lo que la expansión de una familia
puede inflar la aparente multiplicidad de evidencia.

## Validación y límites

Las tablas de correspondencias se comprobaron por unicidad y cobertura
frente a los 3.050 IDs originales. Para el término M5 `9.2.3`, una prueba
de Fisher reconstruida directamente desde las parejas gen–término reprodujo
N=2.608, n=93, K=19, k=18 y p=2,93×10⁻²⁶. El BH global se recalculó
independientemente sobre las 2.260 pruebas v3. Los archivos contienen
las parejas de anotación, el control de cobertura, todas las pruebas y
los temas predefinidos; el resumen de hits no reemplaza las tablas completas.

Esto sigue siendo transcriptómica de pericarpio, no piel aislada; GSE98923
no midió grosor de piel. La sobrerrepresentación no implica causalidad,
especificidad tisular ni regulación de un contraste individual. T-006 puede
priorizar genes con estas cautelas y deberá distinguir centralidad,
anotación discordante y validación experimental pendiente.
