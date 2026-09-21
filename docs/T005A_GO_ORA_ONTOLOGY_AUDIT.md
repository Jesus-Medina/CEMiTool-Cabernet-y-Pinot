# T-005A — ORA de Gene Ontology con auditoría de obsolescencia

Ejecutado el 2026-09-21 con `scripts/post/12_go_ora_beta10.R` desde la raíz
canónica. Es una corrección y ampliación **solo del componente GO** de T-005;
los análisis MapMan, la red beta10, los 3.050 genes filtrados y las 54
muestras no se modificaron. El resultado anterior
`results/functional_enrichment_beta10/v5_go_all_terms.tsv` se conserva como
registro histórico, pero para inferencia GO lo sustituye
`results/go_ora_beta10/go_all_terms.tsv`.

## Fuentes y términos obsoletos

Se usó la [anotación gen–GO PN40024 T2T v5.1 de Grapedia](https://grapedia.org/files-download/) ya preparada en
`data/reference/grapedia_t005/v5_go_pairs.tsv`, con las mismas equivalencias
v1→v5.1 recíprocas uno-a-uno y el mismo umbral de solapamiento de T-005.
El ZIP original de Grapedia, `data/reference/grapedia_t005/t2t_go.zip`,
está ahora conservado en Git. Tiene 1.584.493 bytes, contiene solamente
`5.1_on_T2T_ref_GO.gmt` y coincide con el SHA-256 fijado en el manifiesto.
El script reconstruye desde ese GMT y el mapeo versionado las 33.540
asociaciones gen–término preparadas y exige coincidencia exacta de los
cuatro campos: gen v1, gen de anotación, ID GO y nombre suministrado.
Se contrastaron **todos los IDs GO**, no solo sus nombres, con la
[ontología oficial GO](https://geneontology.org/docs/download-ontology/)
`go.obo`, versión `releases/2026-07-26`. La fuente, SHA-256 y versión
están en `data/reference/go_2026-07-26/go_ora_source_manifest.tsv`; una copia
comprimida de esa ontología se conserva en el mismo directorio. El archivo
`results/go_ora_beta10/go_ontology_term_audit.tsv` da el estado oficial,
nombre, aspecto y número de asociaciones de cada término de Grapedia.

| Estado entre términos GO con genes beta10 | Términos | Asociaciones gen–término |
|---|---:|---:|
| Vigentes | 3.166 | 26.757 |
| Obsoletos según `is_obsolete: true` | 390 | 6.783 |

De los 390 obsoletos, 181 ya tenían «obsolete» en el nombre de Grapedia;
**209 carecían de esa advertencia textual**. Por tanto, el filtro anterior
por nombre dejó pasar 209 términos obsoletos. Se excluyeron todos antes de
definir el fondo o calcular p-valores. No hubo IDs de la muestra ausentes en
la ontología ni IDs alternativos que normalizar en esta versión; el script
los audita y contempla esos casos para futuras entradas. Un ID obsoleto no
se reasigna automáticamente a su posible reemplazo: una sustitución
funcional requeriría revisar la evidencia de anotación de cada gen.

No se halló en las ubicaciones locales examinadas una carpeta separada
llamada «Gen ontology»; aquí se verificó el paquete GO original de Grapedia
usado por el proyecto frente a la ontología GO oficial fijada. Si existe
otra carpeta de origen, debe cotejarse por separado antes de equipararla
con estos datos.

## Método ORA

Para cada uno de los diez módulos biológicos beta10 completos se hizo una
prueba hipergeométrica unilateral. El fondo son los genes del universo
beta10 de 3.050 genes que conservan al menos un término GO vigente (N=519);
cada módulo se restringe al mismo fondo. Se ensayaron términos con 5–500
genes de fondo si el módulo tenía al menos cinco genes anotados. Se
conservaron términos sin solapamiento y no evaluables con su motivo. El
FDR principal es Benjamini–Hochberg sobre todas las combinaciones
módulo×término evaluables; también se informa BH dentro de cada módulo.
Las tres ramas GO se incluyen en una única familia de pruebas, con el
aspecto explícito en la tabla. No se propagaron anotaciones adicionales a
ancestros de GO; se utilizaron las asociaciones proporcionadas por
Grapedia después de filtrar obsolescencia.

| Métrica | T-005: filtro textual | T-005A: estado oficial |
|---|---:|---:|
| Genes GO anotados en el fondo | 519 | 519 |
| Términos retenidos | 3.375 | 3.166 |
| Filas módulo×término | 33.750 | 31.660 |
| Pruebas evaluables | 6.864 | 6.344 |
| Hallazgos FDR global <0,05 | 6 | 6 |

El cambio eliminó 2.090 filas de términos obsoletos (209 términos × 10
módulos) que el filtrado textual previo había retenido, y 520 pruebas
evaluables (65 términos × 8 módulos con cobertura suficiente). Los
p-valores de los términos vigentes y los tamaños del fondo no cambiaron;
los FDR afectados bajaron ligeramente o permanecieron iguales porque la
familia de pruebas ya no incluye esos términos obsoletos. La comparación
fila a fila está en
`results/go_ora_beta10/go_vs_T005_comparison.tsv`.

## Hallazgos y límites

Los seis términos con FDR global <0,05 siguen en **M9**: maduración de
semilla (`GO:0010431`, 5/7, FDR 3,26×10⁻⁴), proceso reproductivo
multicelular (`GO:0048609`), maduración del desarrollo (`GO:0021700`),
maduración anatómica (`GO:0071695`), desarrollo de semilla (`GO:0048316`)
y desarrollo de fruto (`GO:0010154`, FDR 0,0457). Varios comparten genes
y no son seis evidencias biológicas independientes. M9 no es un módulo
prioritario de interacción Cultivar × Stage y el ajuste aditivo de T-003
tenía R² bajo; estos términos no establecen un mecanismo de diferencia
entre Cabernet y Pinot ni contradicen que las muestras sean pericarpio.

Ningún término GO de M5, M10, M2, M3 o M1 supera el FDR global. Esto **no**
demuestra ausencia de función: la cobertura GO es 12/108 genes de M5,
5/39 de M10, 12/214 de M2 y menor del 50 % en todos los módulos.
El ORA describe módulos completos, no genes responsables de un contraste
de etapa/año, ni piel aislada o grosor de piel. La discordancia funcional
MapMan v3↔v5.1 de M5 documentada en T-005 sigue abierta.

## Validación

El ZIP original de Grapedia y el archivo GO comprimido se verificaron
contra sus respectivos SHA-256 antes de procesarlos. Se comprobaron 3.556
IDs de Grapedia, 390 obsoletos,
209 adicionales a los identificables por nombre, exclusión total de IDs
obsoletos en la nueva tabla, 6.344 pruebas y los seis hits M9. Se
recalculó independientemente el BH global sobre los p-valores finales.
Para M9/`GO:0010431`, una prueba de Fisher unilateral reconstruida desde
las parejas gen–término reprodujo N=519, n=13, K=7, k=5 y
p=8,55436321067×10⁻⁸. El script terminó sin errores; R emitió cuatro
advertencias no fatales de configuración regional `C.UTF-8`.

La salida está **lista para interpretación con cautelas**: cobertura baja,
jerarquía GO redundante y ausencia de validación independiente de piel.
