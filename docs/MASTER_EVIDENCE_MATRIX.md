# Matriz maestra de evidencia

Estados usados:

- **ESTABLECIDO:** directamente reproducido por los archivos/modelos del proyecto.
- **APOYADO:** varias capas coherentes, pero no equivalen a prueba causal.
- **SUGERIDO:** señal plausible que requiere verificación.
- **HIPÓTESIS:** propuesta para probar.
- **NO DEMOSTRADO:** los datos actuales no permiten concluirlo.
- **NO APOYADO:** se buscó una señal concreta y no quedó establecida; puede haber límites de cobertura.

| Afirmación | Evidencia principal | Archivos | Fuerza/limitaciones | Estado |
|---|---|---|---|---|
| El diseño principal tiene 54 muestras balanceadas | 2×3×3×3 y metadata completa | `data/metadata/samples.tsv` | Diseño explícito | ESTABLECIDO |
| Beta10 es la red principal del baseline | R² mayor y preservación de módulos beta7 | `results/beta10/`, `results/comparisons/` | Es una decisión metodológica, no “verdad” universal | ESTABLECIDO |
| M5 tiene interacción Cultivar×Stage | FDR 5,29×10^-22 | `module_factorial_ANOVA_typeIII.tsv` | Modelo aditivo de Year | ESTABLECIDO |
| M10, M2, M3 y M1 también tienen interacción | FDR<0,05 | misma tabla | Robustez anual desigual | ESTABLECIDO |
| Year importa en la red | 8/10 módulos con efecto Year FDR<0,05 en modelo aditivo | misma tabla | Efecto aditivo no es heterogeneidad | ESTABLECIDO |
| M5 Harvest tiene Cabernet<Pinot en 2012, 2013, 2014 | -25,03/-20,92/-20,89, FDR global en tres años | `cabernet_vs_pinot_by_stage_year.tsv` | PC1 no comparable entre módulos | ESTABLECIDO |
| M5 completo es invariante entre años | Cultivar×Year FDR≈0,0446; Veraison sensible | T-004 | Patrón global heterogéneo | NO APOYADO |
| M10 es reproducible según regla prefijada | Veraison/Harvest consistentes, sin interacción estacional FDR<0,05 | T-004 | “no detectar interacción” no prueba equivalencia exacta | APOYADO |
| M2 Veraison/Harvest se repiten en tres años | mismos signos y detección | T-004 | FruitSet falla en 2014 | ESTABLECIDO |
| M3 Harvest es estable | magnitud 2013 domina | T-004 | heterogeneidad extrema | NO APOYADO |
| M1 es patrón estable | inversión/signo y concentración 2013 | T-004 | no robusto | NO APOYADO |
| M5 está enriquecido en metabolismo fenólico | v3 stilbenoid 18/19; PAL; fenilpropanoide | `results/functional_enrichment_beta10/` | etiqueta exacta v3/v5 conflictiva | ESTABLECIDO a nivel de anotación de familia |
| M5 es específicamente “módulo de estilbenos” | v3 lo etiqueta así, v5.1 llama muchos genes CHS/flavonoide | T-005 | mismos genes, no validación independiente | NO DEMOSTRADO |
| Los genes chr16 son inequívocamente STS | dominios CHS/STS compartidos | T-006 | requiere secuencia/filogenia/mapping moderno | NO DEMOSTRADO |
| M5 tiene una familia CHS/STS central | 8/11 top hubs y cluster chr16 | rankings T-006 | función exacta de copias no resuelta | APOYADO |
| La señal M5 depende solo de esas 18 copias | PC1 sin familia correlaciona r≈0,9991 y Harvest mantiene signo | T-006 | sensibilidad descriptiva | NO APOYADO |
| NAC es hub de M5 | rango 7/108 kWithin | `m5_full_hub_ranking.tsv` | centralidad ≠ regulación | ESTABLECIDO |
| CuAO es hub de M5 | rango 5/108 | mismo | función causal no probada | ESTABLECIDO |
| NAC regula directamente CHS/STS | no hay ensayo regulatorio | — | coexpresión solamente | NO DEMOSTRADO |
| M10 tiene un programa funcional específico resuelto | ORA global sin hits con alta cobertura v3 | T-005 | ausencia de enrichment ≠ ausencia de función | NO DEMOSTRADO |
| M2 contiene candidatos MYB/FAR1 | rankings y anotaciones | T-006 | varios hubs tienen ceros/mapping sospechoso | ESTABLECIDO como candidatos |
| Los ceros M2 significan ausencia biológica en Cabernet | baseline RPKM tiene ceros | T-006 | CNV, paralogía, reference bias posibles | NO DEMOSTRADO |
| M5 candidatos muestran señal en piel aislada | GSE72421 + PRJNA260535 | T-007 | datasets no miden grosor; plataformas distintas | APOYADO |
| NAC y CuAO concuerdan en ambos ensayos externos principales | Cabernet<Pinot y FDR de hubs <0,05 | `primary_external_condition_hubs.tsv` | selección previa y n pequeño | APOYADO |
| MYB y FAR1 M2 concuerdan externamente | ambos ensayos principales | T-007 | cobertura RNA-seq M2 baja | APOYADO |
| M10 hubs están externamente validados como conjunto | 1/4 microarray; 0/3 RNA-seq | T-007 | evidencia limitada | NO APOYADO |
| El proyecto demuestra diferencias de grosor de piel | no hay fenotipo de grosor | — | pericarpio y datasets externos de expresión | NO DEMOSTRADO |
| M5 está relacionado con biología de piel | varios hubs muestran expresión diferencial concordante en piel aislada | T-007 | no es especificidad ni función de grosor | APOYADO parcialmente |
| Cutícula/cera es el mecanismo principal | ORA prioritario no estableció ese tema | T-005 | epidermis no evaluable, cobertura varía | NO APOYADO actualmente |
| GO prueba función de M5 | GO cobertura M5 12/108; no hit global | T-005A | baja potencia/cobertura | NO DEMOSTRADO |
| M9 refleja procesos de maduración/desarrollo | seis GO hits tras auditoría | `results/go_ora_beta10/` | M9 no es prioridad Cultivar×Stage y ajuste bajo | APOYADO como biología general |
| El baseline histórico puede resolver paralogía CHS/STS | RPKM/PN40024 legado | — | multimapping/reference bias | NO DEMOSTRADO |
| T-008 es necesario para fortalecer identidad molecular | problemas M5/M2 dependen de reads/referencia | T-006/T-007 | puede no resolver copias ultra-similares por sí solo | APOYADO |
