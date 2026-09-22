# Historia maestra del proyecto

## 1. Origen

El proyecto comenzó como un análisis de CEMiTool de GSE98923 con interés en Cabernet Sauvignon vs Pinot noir y procesos relacionados con la piel de la baya.

La primera formulación era demasiado cercana a “Cabernet tiene piel más gruesa / Pinot más fina, por tanto las diferencias de expresión explican grosor”. Se corrigió porque GSE98923 no mide grosor de piel y el tejido primario es pericarpio, no piel aislada.

## 2. Elección de GSE98923

Se eligió porque contiene ambos cultivares seguidos durante desarrollo y durante tres temporadas. El estudio completo tiene 219 muestras, pero la pregunta principal necesitaba un factorial limpio. Se congelaron 54 muestras: 2 cultivares × 3 etapas × 3 años × 3 réplicas.

**Problema evitado:** convertir puntos temporales diferentes en “réplicas”.
**Solución:** diseño balanceado.
**Resultado preservado:** la variación anual sigue explícita.

## 3. Baseline procesado

Se usó el RPKM publicado y `log2(RPKM+1)`.

**Ventaja:** reproducibilidad del estudio publicado.
**Riesgo:** RPKM/anotación históricos pueden producir sesgos de cuantificación.
**Decisión:** mantenerlo como baseline y reservar FASTQ moderno para T-008.

## 4. Beta7 inicial

La primera corrida produjo beta7 mediante la lógica de CEMiTool con `force_beta`. El R² scale-free fue ~0,55.

**Problema detectado:** una selección automática/forzada no es justificación suficiente.
**Solución:** reproducir beta7 explícitamente y guardar diagnósticos.

## 5. Beta10

Se examinó beta10, R²~0,706, con más resolución modular.

**Riesgo:** elegir beta solo por R² podría reconstruir una red distinta.
**Solución:** comparar pertenencia génica beta7 vs beta10.
**Hallazgo:** la mayoría de módulos grandes preserva fuertemente sus genes.
**Decisión:** beta10 primaria; beta7 sensibilidad.

## 6. Comparación de redes

`scripts/post/06_compare_beta7_beta10.R` generó matrices de solapamiento, retención y Jaccard.

La comparación estableció que los nombres M1/M2/etc. son etiquetas de corrida y no identidades biológicas permanentes.

## 7. Estadística de eigengenes

CEMiTool por sí solo no responde adecuadamente a “Cultivar×Stage controlando Year”. Se añadió una capa post-CEMiTool.

`scripts/post/07_module_statistics_beta10.R` calculó PC1 por módulo y ajustó:

`Eigengene ~ Cultivar * Stage + Year`.

**Hallazgo:** M5, M10, M2, M3 y M1 tienen interacción Cultivar×Stage FDR<0,05.
**Hallazgo adicional:** Year es significativo en 8/10 módulos.

## 8. T-002: informe acumulativo

El script 08 integró la nueva estadística al informe y archivó versiones previas. Durante la migración se corrigieron rutas canónicas y problemas de render.

## 9. T-003: QC

Se recomputaron eigengenes y modelos, se verificaron los 30 contrastes y FDR y se inspeccionaron residuos.

**Problema:** M2, M3, M5 y M9 muestran observaciones/celdas de interés diagnóstico.
**Decisión:** no eliminar muestras.
**Muestra especial:** GSM2627837 influye en M5 Veraison 2012.

## 10. T-004: robustez anual

Se ajustó `Eigengene ~ Cultivar * Stage * Year`.

**Razón:** un efecto promedio puede ser impulsado por una sola vendimia.

Resultados:
- M10: reproducible según regla.
- M5: dependiente del año globalmente; Harvest repetido en 2012/2013/2014.
- M2: dependiente del año; Veraison/Harvest repetidos; FruitSet falla en 2014.
- M3: fuerte dependencia de 2013.
- M1: no estable.

Esto cambió la priorización: ya no basta con FDR agregado.

## 11. T-005: ORA

Se prepararon mapeos VIT v1→v3/v5.1 y anotaciones Grapedia.

**Problema:** las anotaciones modernas tienen menor cobertura para genes legado.
**Solución:** MapMan v3 como principal por cobertura; v5.1/GO como comprobación secundaria.

**Hallazgo principal:** M5 fuertemente enriquecido en metabolismo fenólico.
**Conflicto:** v3 “stilbenoid”, v5.1 “CHS/flavonoid” para muchos de los mismos genes.

## 12. T-005A: GO

Se descubrió que filtrar términos obsoletos por nombre era insuficiente.

**Solución:** contrastar IDs con GO oficial.
**Hallazgo:** 390 obsoletos; 209 no decían “obsolete” en el nombre.
**Resultado que cambió:** familia de pruebas GO se limpió.
**Resultado que no cambió:** seis hits globales siguen en M9; no aparece un GO prioritario para M5/M10/M2/M3/M1.

## 13. T-006: hubs

Se usó la adyacencia beta10 congelada, sin rerun.

M5:
- 108 genes;
- 11 top-decil;
- 8/11 en bloque CHS/STS;
- CuAO rango 5;
- NAC rango 7.

La señal M5 persiste casi idéntica al retirar descriptivamente los 18 genes v3-stilbenoid (r PC1≈0,9991), por lo que el módulo no es solo una familia aislada.

M10:
- bHLH y HAK/KUP/KT entre hubs;
- función global no resuelta.

M2:
- MYB y FAR1;
- alerta fuerte de ceros/mapeo/referencia.

## 14. T-007: piel aislada

Se seleccionaron antes del análisis externo 361 genes de M5/M10/M2 y 37 hubs.

Se validaron en:
- GSE72421 microarray de piel;
- PRJNA260535 RNA-seq de piel.

M5:
- CuAO y NAC concuerdan en ambas comparaciones principales;
- algunos miembros CHS/STS también.

M2:
- MYB y FAR1 concuerdan.

M10:
- soporte individual limitado.

**Qué cambió:** ya existe apoyo de expresión en tejido piel.
**Qué no cambió:** no hay fenotipo de grosor ni causalidad.

## 15. Estado actual

T-001 a T-007 están cerrados dentro de sus alcances. El cuello de botella actual es T-008: FASTQ + referencia/anotación moderna.

## 16. Futuro

T-008 debe resolver en la medida posible:
- multimapping/paralogía;
- CHS vs STS;
- sesgo de referencia;
- ceros M2;
- anotación moderna.

T-009 debe integrar todas las capas en un informe/manuscrito final sin borrar el baseline histórico.
