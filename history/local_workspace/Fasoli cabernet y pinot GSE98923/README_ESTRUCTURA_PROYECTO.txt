ESTRUCTURA DEL PROYECTO GSE98923 / CEMiTool
===========================================

scripts/
  Scripts de R del proyecto.

data/raw/geo/
  Datos originales descargados desde GEO. No editar manualmente.

data/processed/matrices/
  Matrices derivadas/procesadas listas para analisis.

muestras/metadata/
  Seleccion de muestras, fenotipos y mapeos de IDs.

muestras/fotos/
  Fotos reales de muestras, si existen.
  Idealmente nombrarlas con SampleName o GSM y registrar la fuente.
  NO guardar aqui figuras tomadas de articulos como si fueran fotos de muestra.

muestras/notas/
  Notas de procedencia, observaciones y documentacion especifica de muestras.

analisis/cemitool/
  Objetos y tablas producidos por CEMiTool.

figuras/cemitool/
  Graficos exportados por CEMiTool.

informes/cemitool/
  Reporte HTML principal y reporte diagnostico.

documentacion/
  Diseno experimental, README original y otros documentos.

documentacion/imagenes_referencia/
  Figuras o imagenes de articulos/fuentes externas que NO son fotos originales de muestra.

logs/
  sessionInfo, parametros y resumen de ejecucion.
