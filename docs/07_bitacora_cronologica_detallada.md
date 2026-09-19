# 07 — Bitácora cronológica detallada

Fecha de consolidación: 2026-09-19.

Este documento conserva decisiones intermedias para que el informe final pueda explicar cómo se llegó al análisis principal.

## Inicio: instalación y uso de CEMiTool

El proyecto comenzó configurando CEMiTool en R/RStudio y definiendo dónde ejecutar los comandos. Posteriormente se decidió evitar un análisis improvisado y construir un workflow reproducible en un único script maestro capaz de crear estructura de carpetas, descargar GEO, preparar matrices, correr CEMiTool, exportar tablas, guardar diagnósticos y generar reportes.

## Investigación del dataset

Se investigó GSE98923 y el trabajo de Fasoli et al. Se confirmó que:

- contiene Cabernet Sauvignon y Pinot noir;
- incluye 2012–2014;
- sigue el desarrollo desde fruit set hasta madurez/cosecha;
- véraison puede anclarse explícitamente con day after veraison = 0;
- el tejido no es piel aislada.

Se estableció que el estudio original ya había aplicado WGCNA, por lo que la novedad no podía ser simplemente “descubrir módulos”. La propuesta debía apoyarse en una pregunta más dirigida y una estrategia de validación.

## Definición del baseline

Se construyó una matriz balanceada de 54 muestras para evitar sesgos por número desigual de tiempos y mantener una comparación clara entre cultivar, etapa y año.

Se descartó la idea de usar tratamientos de cluster thinning (datasets relacionados) como controles adicionales, porque alterarían la biología de maduración.

## Primera red

El workflow descargó la matriz RPKM oficial, seleccionó las 54 muestras y aplicó log2(RPKM+1).

La selección automática de beta no cumplió el criterio esperado. Inicialmente se utilizó force_beta y se obtuvo beta 7. Esto se consideró una señal para auditar el parámetro, no una justificación suficiente.

## Auditoría de beta

Se revisaron:

- Beta × R²;
- mean connectivity;
- sample tree;
- mean-variance;
- número de módulos;
- GSEA;
- warnings.

La corrida beta7 explícita confirmó que el R² ~0.55 era reproducible y no un artefacto de force_beta.

Luego se fijó beta10 de forma explícita. El R² aumentó a ~0.706 y aparecieron 10 módulos biológicos.

## Comparación estructural

Para evitar escoger beta únicamente por el R², se creó un script que compara los genes reales de cada módulo.

El resultado mostró gran conservación entre beta7 y beta10, fortaleciendo el uso de beta10 como red principal.

## Cambio de foco: de CEMiTool al modelo científico

Una vez estabilizada la red, se decidió dejar de ajustar beta y pasar al problema central:

- actividad de módulos por muestra;
- Cultivar;
- Stage;
- Year;
- interacción Cultivar × Stage.

Se preparó el script 07 para construir eigengenes y aplicar el modelo factorial.

## Filosofía de trabajo mantenida

El proyecto intenta evitar tres errores comunes:

1. confundir un gráfico atractivo con evidencia biológica;
2. interpretar cultivar como si fuera una medición directa de grosor de piel;
3. ignorar año, tejido y reproducibilidad.

Cada resultado importante debe quedar versionado en este repositorio junto con la decisión metodológica que lo produjo.
