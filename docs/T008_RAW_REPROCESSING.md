# T-008 — Reprocesamiento moderno de lecturas y preservación

Estado: **DONE** (2026-09-24). Las 54 corridas, las matrices modernas y el análisis de preservación pasaron sus controles. El baseline histórico beta10 permanece intacto.

## Alcance científico

Se conserva el análisis principal de 54 pericarpios GSE98923, `log2(RPKM + 1)`, la red beta10 y la sensibilidad beta7. T-008 cuantifica las mismas lecturas con Grapedia PN40024 T2T v5.1 y compara la capa moderna con el baseline histórico; no lo sustituye. El material sigue siendo pericarpio, no piel aislada, y no contiene un fenotipo de grosor de piel.

## Linaje de lecturas y referencia

`scripts/post/17_t008_audit_raw_run_manifest.py` cruzó los 54 GSM congelados con 54 SRX y 54 SRR single-end mediante GEO y ENA. Los FASTQ seleccionados suman 140.160.608.633 bytes comprimidos y 1.625.172.664 lecturas declaradas. URL, tamaño y MD5 están en `results/fastq_reprocessing_t008/selected_54_gsm_to_srr.tsv`; no se usaron las otras corridas de la serie.

`scripts/post/18_t008_prepare_t2t_reference.py` verificó por SHA-256 el genoma, GFF3 v5.1 y FASTA de todas las variantes transcritas. La unión FASTA–GFF3 contiene 47.971 genes, 56.910 transcritos y 20 secuencias genómicas señuelo. El cruce recíproco v1→v5.1 cubre 1.922/3.050 genes beta10: M5 76/108, M10 21/39 y M2 81/214. Un gen sin equivalencia confiable se clasifica como **no comparable**, nunca como ausencia biológica.

## Piloto y decisión de cuantificación

El piloto `SRR5560506` pasó tamaño, MD5, gzip, estructura y las 12.724.462 lecturas exactas. Salmon 1.12.1 usó índice con genoma señuelo, `k=31`, `--keepDuplicates`, biblioteca no direccional, `--seqBias` y `--dumpEq`. Dos construcciones del índice fallaron por la locale WSL y quedaron preservadas para diagnóstico; una locale local permitió completar y validar el índice. Salmon advirtió 477 transcritos idénticos, 17.100 bases no ATCG y 71 colas poli-A recortadas. Retener duplicados no resuelve asignación ambigua entre parálogos.

Una sensibilidad 250/25 frente a 200/80 sobre el mismo FASTQ no cambió el mapeo, pero dejó solo 63/100 genes top por TPM coincidentes. Los recuentos estimados fueron mucho más estables: 99/100 genes top y correlación `log1p` 0,9991. Por ello, la comparación final usa recuentos estimados por gen, factores de tamaño por mediana de cocientes y `log2(recuento_normalizado + 1)`; TPM queda como salida técnica secundaria. El análisis no presenta la longitud de fragmento supuesta como una medición del estudio.

## Lote completo y matrices

Los scripts 19/20/25/26 descargaron o reutilizaron de forma segura y validaron **54/54** corridas. Cada FASTQ pasó tamaño/MD5 ENA, gzip, recuento completo de lecturas y una inspección no aleatoria de las primeras 10.000 lecturas. Cada cuantificación pasó versión, índice, parámetros, universo de 56.910 transcritos, cierre de TPM/recuentos y ausencia de errores. Los originales y directorios completos permanecen en `D:/CEMiTool_T008_scratch/`; no se borraron FASTQ. Los QC y archivos técnicos comprimidos están archivados por muestra bajo `results/fastq_reprocessing_t008/`.

`scripts/post/27_t008_assemble_modern_matrices.py` produjo matrices de 47.971 genes × 54 muestras para recuentos estimados, TPM y recuentos normalizados transformados. Los 56.910 transcritos esperados estuvieron presentes; 17.934 genes positivos en todas las muestras definieron factores de tamaño entre 0,4348 y 1,9512. El mapeo fue 79,18–88,76 % (mediana 83,90 %). `modern_matrix_qc.tsv` registra `Validation=PASS`.

## Comparación moderna con el baseline

`scripts/post/29_t008_modern_preservation.R` restringe la comparación a los 1.922 genes beta10 con equivalencia recíproca uno-a-uno. Recalcula PC1 en el subconjunto mapeado, repite `Eigengene ~ Cultivar * Stage * Year`, coteja nueve contrastes Stage×Year por módulo, compara correlación y adyacencia beta10 y ejecuta `WGCNA::modulePreservation` con membresías beta10 fijas, red unsigned, 200 permutaciones y semilla 1234. `preservation_qc.tsv` registra `Output_validation=PASS`.

Resultados prioritarios:

- **M5:** 76/108 genes comparables; Zsummary 7,495, preservación moderada; correlación de eigengene 0,986; Spearman de adyacencia 0,827; 8/9 direcciones Stage×Year concordantes. Harvest Cabernet−Pinot sigue negativo en 2012, 2013 y 2014. Los genes mapeados del bloque con conflicto CHS/STS conservan dirección negativa en Harvest, pero la cuantificación no resuelve identidad enzimática ni expansión estructural.
- **M10:** 21/39 comparables; Zsummary 3,735, preservación moderada; eigengene 0,996; adyacencia 0,878; 8/9 direcciones concordantes. La discordancia es FruitSet 2014, donde ambos efectos son prácticamente nulos.
- **M2:** 81/214 comparables; Zsummary 7,453, preservación moderada del **núcleo mapeable**; eigengene 0,998; adyacencia 0,775; 9/9 direcciones concordantes. La cobertura de 37,9 % impide llamar preservado al módulo completo. Los ceros extremos de varios hubs en Cabernet Harvest reaparecen; `VIT_19s0085g00460` presenta el patrón inverso en Pinot. No parecen un simple artefacto de la matriz RPKM, pero siguen abiertas paralogía, referencia, variación estructural, número de copias y biología real.
- **Contexto:** M1 muestra preservación fuerte (Zsummary 28,93). M3 y M8 no tienen apoyo de preservación con este mapeo; M3 conserva solo 35/131 genes y no debe promoverse por una señal aislada del modelo moderno.

La mediana de Spearman por muestra entre capas es 0,932. La PCA moderna está dominada por etapa en PC1 (51,1 %) y cultivar en PC2 (16,5 %), sin intercambio u outlier obvio por inspección visual. El mapeo varía por etapa y el factor de tamaño por año; se conservan como posibles factores técnicos/biológicos y no se interpretan automáticamente como sesgo.

## Criterios de cierre verificados

1. Referencia, índice, software, parámetros y sensibilidad del supuesto de fragmento están documentados y versionados.
2. Las mismas 54 corridas pasaron QC completo; no se añadieron corridas ni se borraron FASTQ.
3. Las tres matrices modernas tienen 54 columnas y QC explícito.
4. La preservación se evaluó en 1.922 equivalencias auditadas, con análisis separados de M5 CHS/STS y extremos M2.
5. Se preservaron tablas completas, diagnósticos, figuras y límites sin sobrescribir expresión o redes históricas.

T-008 se cierra como `DONE`. “Preservación moderada” se refiere al núcleo mapeable: no convierte asociación en causalidad, no mide grosor de piel, no convierte pericarpio en piel aislada y no resuelve CHS frente a STS.
