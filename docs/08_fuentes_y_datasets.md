# 08 — Fuentes y datasets

## Dataset principal

### GSE98923
GEO series usada para el baseline de Cabernet Sauvignon vs Pinot noir.

- GEO: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE98923
- BioProject: PRJNA386889
- SRA study: SRP107227
- Matriz procesada utilizada en el baseline:
  `GSE98923_RPKM_2012-2013-2014_controls.txt.gz`

El workflow descarga los archivos públicos mediante GEOquery en vez de mantener una copia manual del archivo bruto dentro del repositorio.

## Trabajo de referencia

Fasoli et al. (2018), estudio de los eventos moleculares asociados al inicio de la maduración de la baya de vid.

El proyecto conserva como principio que el trabajo original ya realizó análisis de redes/coexpresión; por lo tanto, nuestra contribución no puede limitarse a “aplicar CEMiTool y descubrir módulos”.

## Datasets relacionados que NO se mezclan con el baseline

### GSE101532
Pinot noir con tratamientos de cluster thinning. No se agrega al baseline para aumentar N porque el tratamiento modifica la trayectoria de maduración.

### GSE104316
Cabernet Sauvignon con cluster thinning. Misma razón para mantenerlo fuera del baseline principal.

## Candidatos de validación externa skin-only

### GSE72421
Contiene muestras de berry skin y puede servir para comprobar candidatos en tejido más específico, aunque su diseño no replica exactamente FruitSet → Veraison → Harvest del baseline.

### PRJNA260535
Transcriptómica de piel de varios cultivares y distintos niveles de madurez. Se considera una fuente independiente útil para validar si genes/módulos candidatos aparecen realmente en piel.

## Uso previsto de fuentes externas

Los datasets externos se utilizarán para **validación**, no para mezclarlos con las 54 muestras como si fueran réplicas equivalentes.
