# Auditoría de completitud por año y módulo

**Fecha:** 2026-09-23  
**Objetivo:** verificar que la interpretación del proyecto no mezcle módulos construidos con subconjuntos distintos de años y documentar, sin modificar resultados existentes, qué análisis cubren M1–M10 y cómo incorporan 2012, 2013 y 2014.

## Regla de no intervención

Esta auditoría es **aditiva y no destructiva**.

No:
- rerunea CEMiTool;
- cambia beta10;
- cambia membresía de módulos;
- recalcula ORA;
- elimina muestras;
- imputa resultados GSEA faltantes;
- reemplaza tablas científicas existentes.

La auditoría únicamente lee artefactos canónicos y falla si aparecen pérdidas estructurales nuevas.

## Diseño canónico verificado

El baseline contiene 54 muestras:

- 2 cultivares;
- 3 etapas;
- 3 años: 2012, 2013 y 2014;
- 3 réplicas por combinación Cultivar × Stage × Year.

Las seis clases que recibe CEMiTool son:

- CS_FruitSet
- CS_Veraison
- CS_Harvest
- PN_FruitSet
- PN_Veraison
- PN_Harvest

Cada clase contiene exactamente 9 muestras:

- 3 de 2012;
- 3 de 2013;
- 3 de 2014.

Por tanto, ninguna clase del GSEA nativo está construida solo con uno o dos años.

## GSEA nativo de CEMiTool

Fuentes:

- `results/beta10/tables/enrichment_es.tsv`
- `results/beta10/tables/enrichment_nes.tsv`
- `results/beta10/tables/enrichment_padj.tsv`

Las tres matrices usan las mismas seis clases, y esas clases contienen 2012+2013+2014 de forma balanceada.

**Importante:** Year no es una clase separada en este GSEA. Los años están agrupados dentro de cada clase Cultivar × Stage. Por tanto, este GSEA no prueba por sí solo reproducibilidad entre años.

### Excepción actual

Las tres matrices nativas contienen:

- M2
- M3
- M4
- M5
- M6
- M7
- M8
- M9
- M10
- Not.Correlated

**M1 no aparece en la salida GSEA nativa.**

La causa de esa ausencia no está demostrada por los artefactos canónicos actuales. Por esa razón:

- no se genera un NES/ES/FDR artificial para M1;
- no se copia un valor desde otro análisis;
- no se rerunea CEMiTool silenciosamente;
- M1 queda marcado como `ATTENTION_GSEA_M1_NATIVE_ROW_MISSING`.

Si en una futura ejecución canónica M1 aparece, la auditoría aceptará automáticamente la cobertura completa.

## ORA

Fuentes principales:

- `results/functional_enrichment_beta10/annotation_and_test_qc.tsv`
- `results/go_ora_beta10/go_annotation_and_test_qc.tsv`

MapMan v3, MapMan v5.1 y el QC GO vigente contienen filas para **M1–M10**.

El ORA utiliza la membresía congelada de módulos beta10. Esos módulos fueron inferidos sobre las 54 muestras de 2012–2014.

Sin embargo, ORA no tiene una dimensión `Year`: prueba sobrerrepresentación de anotaciones dentro de cada conjunto de genes. Por tanto:

> “El módulo usado por ORA proviene de una red construida con los tres años” es correcto.

pero:

> “El ORA fue reproducible en los tres años” no está definido por este análisis.

En GO, M3 y M8 tienen cero términos testables bajo los criterios actuales debido a cobertura anotacional insuficiente. El módulo sigue presente; no es una omisión de año.

## Perfiles por año

Fuente:

`results/year_robustness_beta10/cell_profiles.tsv`

Se verifican exactamente **180 filas**:

`10 módulos × 2 cultivares × 3 etapas × 3 años`

Cada celda tiene `N=3`.

Por tanto M1–M10 contienen explícitamente:

- 2012;
- 2013;
- 2014.

Esta capa sí permite inspeccionar visualmente congruencia entre años.

## Contrastes Stage × Year

Fuente:

`results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv`

Se verifican exactamente **90 contrastes**:

`10 módulos × 3 etapas × 3 años`

Cada módulo tiene 9 contrastes Cabernet Sauvignon − Pinot noir:

- FruitSet 2012/2013/2014;
- Veraison 2012/2013/2014;
- Harvest 2012/2013/2014.

Esta es una de las capas primarias para evaluar reproducibilidad anual, junto con el modelo factorial y la clasificación preespecificada de T-004.

## Qué significa “completo” en esta auditoría

La auditoría distingue entre:

- **completitud de alcance:** los años/módulos requeridos entraron al análisis;
- **robustez biológica:** la señal conserva dirección/magnitud/detección entre años.

No son equivalentes.

Un módulo puede tener 2012+2013+2014 completos y aun así ser year-dependent.

## Guard automático

Código:

`site/scripts/audit_year_completeness.py`

Salida del sitio:

`site/public/data/year_completeness_audit.json`

El build falla si, por ejemplo:

- desaparece una muestra;
- una celda deja de tener 3 réplicas;
- una clase GSEA deja de contener los tres años;
- GSEA pierde otro módulo adicional a la excepción M1 conocida;
- ORA deja de contener uno de M1–M10;
- faltan perfiles entre las 180 celdas esperadas;
- faltan contrastes entre los 90 esperados.

La ausencia actual de M1 en el GSEA se mantiene como **ATTENTION**, no como un dato inventado ni como un fallo oculto.

## Estado actual

| Capa | M1–M10 | 2012+2013+2014 | Year explícito | Estado |
|---|---|---|---|---|
| Diseño CEMiTool | Sí | Sí | No en Class | PASS |
| GSEA nativo | M2–M10; M1 ausente | Sí, balanceados dentro de cada clase | No | ATTENTION |
| ORA MapMan v3 | Sí | módulos derivados de red 3-year | No | PASS |
| ORA MapMan v5.1 | Sí | módulos derivados de red 3-year | No | PASS |
| ORA GO vigente | Sí | módulos derivados de red 3-year | No | PASS de alcance; cobertura limitada |
| Perfiles | Sí | Sí | Sí | PASS |
| Contrastes Stage×Year | Sí | Sí | Sí | PASS |

La auditoría de completitud no reemplaza la clasificación de robustez anual de T-004.
