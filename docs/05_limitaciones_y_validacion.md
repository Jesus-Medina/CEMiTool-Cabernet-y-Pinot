# 05 — Limitaciones y plan de validación

## 1. Tejido

GSE98923 no es un experimento skin-only. La baya fue procesada como pericarpio, por lo que la expresión observada mezcla señales de piel y pulpa.

Consecuencia: un módulo enriquecido en cutícula/pared celular es un candidato relevante, pero no demuestra por sí solo expresión específica de piel.

## 2. Fenotipo de grosor

No hay una medición directa de grosor de piel asociada a estas 54 muestras.

Consecuencia: no se debe modelar el contraste como “thick vs thin skin” ni usar esas etiquetas como fenotipo medido.

## 3. Solo dos cultivares

Cabernet Sauvignon y Pinot noir difieren en muchas características además de piel.

Consecuencia: cualquier diferencia puede ser cultivar-específica por múltiples motivos.

## 4. Confusores experimentales

El material vegetal de ambos cultivares no es idéntico en clone/rootstock/edad de plantación. Por ello, “Cultivar” no es una manipulación aislada de una sola variable genética.

## 5. Año/vintage

CEMiTool usa las clases para su análisis de enriquecimiento, pero no sustituye un modelo factorial que controle Year.

Solución: modelar eigengenes con:

```
Cultivar * Stage + Year
```

## 6. RPKM procesado

El baseline usa el archivo RPKM histórico publicado en GEO.

Plan de fortalecimiento:

- recuperar FASTQ de SRA;
- procesar con pipeline moderno;
- usar counts y normalización apropiada;
- actualizar anotación de Vitis;
- evaluar preservación de módulos/candidatos.

## 7. Validación skin-only

Datasets independientes identificados para una etapa posterior incluyen:

- GSE72421, con muestras de berry skin y Cabernet/Pinot en contextos diferentes;
- PRJNA260535, estudio skin-only multi-cultivar y distintos niveles de madurez.

No deben mezclarse con el baseline para “aumentar N”. Deben utilizarse como validación externa de candidatos.

## 8. Criterio de evidencia propuesto

Un candidato fuerte debería acumular varias capas:

1. módulo estadísticamente asociado a Cultivar × Stage;
2. patrón consistente por año;
3. enriquecimiento funcional relevante;
4. centralidad/hub;
5. señal en piel aislada;
6. estabilidad frente a procesamiento moderno.
