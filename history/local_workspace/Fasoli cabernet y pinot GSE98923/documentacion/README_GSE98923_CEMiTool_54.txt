GSE98923 — baseline CEMiTool (54 samples)

Archivos:
1) GSE98923_CEMiTool_design_54.xlsx
   - Samples_54: las 54 muestras seleccionadas.
   - CEMiTool_Phenotypes: SampleName + Class.
   - Summary: 6 clases, 9 muestras por clase.
   - README: notas de diseño.

2) GSE98923_selection_54.tsv
   Metadata completa de las 54 muestras.

3) GSE98923_CEMiTool_phenotypes_54.tsv
   Archivo mínimo para CEMiTool (SampleName y Class).

4) run_GSE98923_CEMiTool_54_baseline.R
   Script reproducible que:
   - descarga el archivo suplementario RPKM oficial de GSE98923;
   - descarga metadata GEO para mapear GSM <-> Description;
   - extrae exactamente las 54 muestras;
   - genera:
       GSE98923_CEMiTool_expression_54_RPKM.tsv
       GSE98923_CEMiTool_expression_54_log2RPKM.tsv
       GSE98923_CEMiTool_phenotypes_54.tsv
   - corre CEMiTool baseline con las 6 clases;
   - guarda tablas, gráficos, HTML, RDS y sessionInfo.

Cómo usar:
- Copia run_GSE98923_CEMiTool_54_baseline.R y GSE98923_selection_54.tsv
  a la misma carpeta.
- En RStudio: Session > Set Working Directory > Choose Directory...
  y elige esa carpeta.
- Abre el script y ejecútalo completo (Source).

Diseño:
- 2 cultivares: Cabernet Sauvignon (CS), Pinot noir (PN)
- 3 estados: FruitSet, Veraison, Harvest
- 3 años: 2012, 2013, 2014
- 3 réplicas biológicas por combinación
- total = 54 muestras
- clases CEMiTool:
  CS_FruitSet, CS_Veraison, CS_Harvest,
  PN_FruitSet, PN_Veraison, PN_Harvest

Nota metodológica:
- Veraison se selecciona en puntos explícitamente anotados como day after veraison = 0.
- FruitSet usa TP0 porque el protocolo indica que el muestreo comenzó en fruit set.
- Harvest usa el último TP porque el protocolo indica muestreo hasta harvest (24.5 °Brix).
- Para este baseline usamos log2(RPKM+1) y apply_vst=FALSE.
