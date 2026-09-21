# T-004 — Robustez por año de los eigengenes beta10

Análisis ejecutado el 2026-09-21 desde la raíz canónica con
`source("scripts/post/09_year_robustness_beta10.R")`. Se utilizaron los
eigengenes ya auditados de 54 muestras, sin volver a correr CEMiTool, alterar
la red, eliminar muestras ni cambiar el preprocesamiento. Las 18 celdas
Cultivar × Stage × Year tienen tres réplicas.

## Método y alcance

- Modelo por cada uno de los diez módulos: `Eigengene ~ Cultivar * Stage * Year`.
  Tiene 18 medias de celda estimables y 36 grados de libertad residuales.
- ANOVA tipo III con contrastes suma a cero. FDR Benjamini–Hochberg (BH)
  separado para cada efecto a través de los diez módulos. Con interacciones,
  los efectos de orden inferior deben interpretarse condicionalmente; para
  robustez estacional se priorizan `Cultivar:Stage:Year`, `Cultivar:Year` y
  los contrastes simples.
- Contrastes Cabernet Sauvignon menos Pinot noir en las nueve combinaciones
  Stage × Year por módulo. El FDR principal corrige conjuntamente las 90
  pruebas. También se guardan FDR dentro de cada Stage × Year (diez pruebas)
  y dentro de cada módulo (nueve pruebas). Los intervalos de 95 % son
  **no ajustados** y descriptivos; no deben leerse como equivalentes al FDR.
- Los perfiles grafican medias observadas ± error estándar de tres réplicas
  biológicas por celda. Las barras no son intervalos para los contrastes.
- La regla de clasificación figura en el script y `analysis_summary.txt`.
  «Dependiente del año» tiene precedencia si una interacción Cultivar × Year
  o de tres vías pasa FDR 0,05, o si un contraste detectado cambia de signo
  o se concentra en un año (único año detectado y magnitud >2 veces ambas
  restantes). Sin ello, «reproducible» exige al menos una etapa con el mismo
  signo en los tres años y FDR global <0,05 en al menos dos. El resto es
  «parcialmente reproducible», una categoría **no confirmatoria**.
  La regla es una herramienta descriptiva de priorización, no una prueba
  formal de equivalencia entre años.

## Clasificación de los cinco módulos prioritarios

| Módulo | Clasificación | FDR tres vías | FDR Cultivar × Year | Evidencia y límite |
|---|---|---:|---:|---|
| M5 | Dependiente del año a escala del módulo | 0,826 | 0,0446 | Harvest: −25,03 / −20,92 / −20,89 (2012/2013/2014), FDR global <0,05 los tres años. Es un contraste repetido. Veraison solo se detecta en 2012 (−4,83; FDR 0,00717), con influencia de GSM2627837. La clasificación no invalida el resultado de Harvest. |
| M10 | Reproducible según la regla | 0,271 | 0,0902 | Veraison: −2,42 / −1,93 / −2,03 y Harvest: −4,84 / −3,15 / −2,07; los seis contrastes pasan FDR global 0,05. No hallar interacción estacional significativa no prueba invariancia exacta. |
| M2 | Dependiente del año | 1,06×10⁻²⁷ | 2,67×10⁻²³ | Veraison y Harvest son negativos y detectados los tres años. FruitSet es −22,75 / −24,07 / +0,15: la gran diferencia de 2012–2013 desaparece en 2014. La señal global de FruitSet no es reproducible. |
| M3 | Dependiente del año | 1,06×10⁻²⁷ | 7,22×10⁻²⁰ | Harvest es −0,61 / −18,71 / −1,64. Aunque 2014 también pasa FDR global, la magnitud de 2013 supera dos veces ambas restantes y coincide con la celda marcada en T-003. Veraison se detecta en 2012 y 2014, pero no en 2013. |
| M1 | Dependiente del año por criterio descriptivo; no robusto | 0,0593 | 0,563 | No hay interacción estacional que pase FDR 0,05. FruitSet es +2,47 / +9,35 / −0,95 y solo 2013 se detecta (FDR global 0,00161). La inversión de signo y la concentración impiden promover el resultado agregado a un patrón estable. Esta etiqueta no equivale a una prueba formal positiva de interacción con Year. |

Los valores son diferencias de eigengene PC1 (Cabernet menos Pinot), no
cambios en grosor de piel. Las FDR y los valores completos constan en las
tablas, no solo los hallazgos seleccionados aquí.

## Diagnósticos e influencia

El modelo completo redujo algunas señales de residuo del modelo aditivo,
pero no convirtió sus supuestos en certezas. M2 y M3 muestran fuertes
variaciones de **celdas completas** (Cabernet FruitSet 2014 y Cabernet
Harvest 2013, respectivamente): no son motivos para eliminar réplicas.
En M5, la exclusión *solo como sensibilidad* de GSM2627837 cambia el
contraste Veraison 2012 de −4,83 (p sin ajustar 0,00231) a −2,05
(p sin ajustar 0,123). El contraste Harvest mantiene las mismas estimaciones
en las tres temporadas; los p cambian porque cambia la varianza residual
agrupada. Ninguna muestra fue excluida del análisis principal.

En el modelo completo M5 aún tiene residuos estandarizados >3 y FDR de
Shapiro 0,000157; M9 mantiene ajuste bajo (R² 0,536) y tres residuos >3.
Las pruebas paramétricas y FDR se reportan transparentemente, pero con solo
tres réplicas por celda sus p-valores pueden ser sensibles a distribución y
varianza desigual. Estas cautelas deben acompañar cualquier priorización.

## Archivos y verificación

`results/year_robustness_beta10/` contiene:

- `full_factorial_typeIII_ANOVA.tsv` (70 filas);
- `cabernet_vs_pinot_by_stage_year.tsv` (90 filas);
- `cell_profiles.tsv` (180 filas, tres muestras por celda);
- `full_model_diagnostics.tsv` (10 filas);
- `stage_year_consistency.tsv` (30 filas);
- `priority_module_classification.tsv` (cinco filas);
- `m5_flagged_sample_sensitivity.tsv` (nueve filas);
- `profiles/M1...M10_stage_by_year.png` (diez gráficos);
- `analysis_summary.txt` con parámetros, reglas y versiones de R/paquetes.

Se comprobó que los 90 contrastes coinciden con las diferencias directas de
medias de las celdas en el modelo factorial completo (error máximo
4,62×10⁻¹⁴), que el FDR global se reproduce desde los p-valores y que las
180 medias de perfil proceden de celdas con N=3. Una comparación de modelos
anidados reprodujo el p de la interacción de tres vías en los diez módulos
(diferencia máxima 2,00×10⁻¹⁵); los errores estándar de contrastes también
coincidieron con la varianza residual agrupada (máximo 4,44×10⁻¹⁵). Se
inspeccionaron visualmente los diez gráficos. El análisis de sensibilidad
de M5 está separado del resultado primario.

## Límite de interpretación y siguiente paso

Este resultado permite pasar a T-005 con prioridades calibradas: M10 tiene
la evidencia de reproducción estacional más clara bajo la regla fijada;
M5 Harvest y M2 Veraison/Harvest son contrastes repetidos dentro de módulos
con otras componentes dependientes del año. M3 Harvest y M1 no deben
promoverse como patrones estables. El análisis mide pericarpio, no piel
aislada; no hay fenotipo directo de grosor ni una comparación causal pura
de cultivares. Ningún enriquecimiento o gen central se ha validado todavía.
