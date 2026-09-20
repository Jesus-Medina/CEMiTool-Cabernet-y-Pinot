# ============================================================
# GSE98923 -> subset balanceado de 54 muestras -> CEMiTool
# Cabernet Sauvignon vs Pinot noir
# FruitSet / Veraison / Harvest, 2012-2014, 3 replicas por grupo
#
# Version organizada para proyecto R reproducible.
# - Crea estructura de carpetas.
# - Copia archivos de entrada desde la raiz a su ubicacion canonica.
# - Descarga datos crudos de GEO.
# - Genera matrices procesadas.
# - Ejecuta CEMiTool.
# - Usa force_beta = TRUE para este baseline de 54 muestras,
#   porque la seleccion automatica de beta fallo en la ejecucion previa.
# - Guarda objetos, tablas, figuras, informes, diagnosticos y logs.
# ============================================================


# ------------------------------------------------------------
# 0) CONFIGURACION GENERAL DEL PROYECTO
# ------------------------------------------------------------

GSE_ID <- "GSE98923"

# IMPORTANTE:
# Ejecuta este script con el proyecto .Rproj abierto.
# getwd() debe ser la carpeta raiz del proyecto.
PROJECT_DIR <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)

# Si no hay .Rproj, avisamos, pero no detenemos la ejecucion.
rproj_files <- list.files(PROJECT_DIR, pattern = "\\.Rproj$", full.names = TRUE)
if (length(rproj_files) == 0) {
  warning(
    "No encontre un archivo .Rproj en la carpeta de trabajo.\n",
    "Abre el proyecto de RStudio antes de ejecutar este script.\n",
    "Carpeta actual: ", PROJECT_DIR
  )
}

# Parametros principales del baseline
FORCE_BETA <- TRUE
RANDOM_SEED <- 1234

# Archivo principal de seleccion de muestras
META_FILENAME <- "GSE98923_selection_54.tsv"


# ------------------------------------------------------------
# 0.1) ESTRUCTURA DE CARPETAS
# ------------------------------------------------------------

DIRS <- list(
  scripts = file.path(PROJECT_DIR, "scripts"),
  
  data_raw_geo = file.path(PROJECT_DIR, "data", "raw", "geo"),
  data_processed_matrices = file.path(PROJECT_DIR, "data", "processed", "matrices"),
  
  muestras_metadata = file.path(PROJECT_DIR, "muestras", "metadata"),
  muestras_fotos = file.path(PROJECT_DIR, "muestras", "fotos"),
  muestras_notas = file.path(PROJECT_DIR, "muestras", "notas"),
  
  analisis_cemitool = file.path(PROJECT_DIR, "analisis", "cemitool"),
  analisis_objetos = file.path(PROJECT_DIR, "analisis", "cemitool", "objetos"),
  analisis_tablas = file.path(PROJECT_DIR, "analisis", "cemitool", "tablas"),
  
  figuras_cemitool = file.path(PROJECT_DIR, "figuras", "cemitool"),
  
  informes_cemitool = file.path(PROJECT_DIR, "informes", "cemitool"),
  informes_reporte = file.path(PROJECT_DIR, "informes", "cemitool", "reporte"),
  informes_diagnosticos = file.path(PROJECT_DIR, "informes", "cemitool", "diagnosticos"),
  
  documentacion = file.path(PROJECT_DIR, "documentacion"),
  documentacion_imagenes = file.path(PROJECT_DIR, "documentacion", "imagenes_referencia"),
  
  logs = file.path(PROJECT_DIR, "logs")
)

invisible(lapply(
  DIRS,
  dir.create,
  showWarnings = FALSE,
  recursive = TRUE
))


# ------------------------------------------------------------
# 0.2) README DE LA ESTRUCTURA DEL PROYECTO
# ------------------------------------------------------------

structure_readme <- file.path(PROJECT_DIR, "README_ESTRUCTURA_PROYECTO.txt")

if (!file.exists(structure_readme)) {
  writeLines(
    c(
      "ESTRUCTURA DEL PROYECTO GSE98923 / CEMiTool",
      "===========================================",
      "",
      "scripts/",
      "  Scripts de R del proyecto.",
      "",
      "data/raw/geo/",
      "  Datos originales descargados desde GEO. No editar manualmente.",
      "",
      "data/processed/matrices/",
      "  Matrices derivadas/procesadas listas para analisis.",
      "",
      "muestras/metadata/",
      "  Seleccion de muestras, fenotipos y mapeos de IDs.",
      "",
      "muestras/fotos/",
      "  Fotos reales de muestras, si existen.",
      "  Idealmente nombrarlas con SampleName o GSM y registrar la fuente.",
      "  NO guardar aqui figuras tomadas de articulos como si fueran fotos de muestra.",
      "",
      "muestras/notas/",
      "  Notas de procedencia, observaciones y documentacion especifica de muestras.",
      "",
      "analisis/cemitool/",
      "  Objetos y tablas producidos por CEMiTool.",
      "",
      "figuras/cemitool/",
      "  Graficos exportados por CEMiTool.",
      "",
      "informes/cemitool/",
      "  Reporte HTML principal y reporte diagnostico.",
      "",
      "documentacion/",
      "  Diseno experimental, README original y otros documentos.",
      "",
      "documentacion/imagenes_referencia/",
      "  Figuras o imagenes de articulos/fuentes externas que NO son fotos originales de muestra.",
      "",
      "logs/",
      "  sessionInfo, parametros y resumen de ejecucion."
    ),
    structure_readme
  )
}


# ------------------------------------------------------------
# 0.3) FUNCIONES AUXILIARES PARA ORGANIZAR ARCHIVOS DE ENTRADA
# ------------------------------------------------------------

copy_input_if_present <- function(filename, destination_dir) {
  destination <- file.path(destination_dir, filename)
  
  # Si ya esta en la ubicacion canonica, no hacemos nada.
  if (file.exists(destination)) {
    return(destination)
  }
  
  # Si esta en la raiz del proyecto, copiamos una copia segura.
  root_source <- file.path(PROJECT_DIR, filename)
  
  if (file.exists(root_source)) {
    ok <- file.copy(root_source, destination, overwrite = FALSE)
    
    if (!ok) {
      stop(
        "No pude copiar ", filename,
        " a ", destination_dir
      )
    }
    
    message("Organizado: ", filename, " -> ", destination)
  }
  
  destination
}


# Metadata y documentos que venian en el bundle original.
META_FILE <- copy_input_if_present(
  META_FILENAME,
  DIRS$muestras_metadata
)

copy_input_if_present(
  "GSE98923_CEMiTool_phenotypes_54.tsv",
  DIRS$muestras_metadata
)

copy_input_if_present(
  "GSE98923_CEMiTool_design_54.xlsx",
  DIRS$documentacion
)

copy_input_if_present(
  "README_GSE98923_CEMiTool_54.txt",
  DIRS$documentacion
)


# ------------------------------------------------------------
# 1) INSTALAR/CARGAR PAQUETES
# ------------------------------------------------------------

if (!requireNamespace("BiocManager", quietly = TRUE)) {
  install.packages("BiocManager")
}

needed <- c("GEOquery", "CEMiTool")

to_install <- needed[
  !vapply(needed, requireNamespace, logical(1), quietly = TRUE)
]

if (length(to_install) > 0) {
  BiocManager::install(
    to_install,
    ask = FALSE,
    update = FALSE
  )
}

suppressPackageStartupMessages({
  library(GEOquery)
  library(CEMiTool)
})


# ------------------------------------------------------------
# 2) LEER Y VALIDAR EL DISENO DE 54 MUESTRAS
# ------------------------------------------------------------

if (!file.exists(META_FILE)) {
  stop(
    "No encuentro ", META_FILENAME, ".\n",
    "Pon el archivo en la raiz del proyecto o en:\n",
    file.path("muestras", "metadata", META_FILENAME)
  )
}

meta <- read.delim(
  META_FILE,
  sep = "\t",
  header = TRUE,
  stringsAsFactors = FALSE,
  check.names = FALSE
)

required_meta <- c(
  "SampleName",
  "Class",
  "GSM",
  "Cultivar",
  "Year",
  "Stage",
  "TimePoint",
  "Replicate"
)

missing_meta <- setdiff(required_meta, colnames(meta))

if (length(missing_meta) > 0) {
  stop(
    "Faltan columnas en metadata: ",
    paste(missing_meta, collapse = ", ")
  )
}

if (nrow(meta) != 54) {
  stop(
    "Se esperaban 54 muestras y hay ",
    nrow(meta),
    "."
  )
}

if (anyDuplicated(meta$SampleName)) {
  stop("SampleName contiene duplicados.")
}

if (anyDuplicated(meta$GSM)) {
  stop("GSM contiene duplicados.")
}

cat("\nDiseno seleccionado:\n")
print(with(meta, table(Cultivar, Stage, Year)))

cat("\nClases para CEMiTool:\n")
print(table(meta$Class))


# ------------------------------------------------------------
# 2.1) CREAR INDICE PARA FOTOS DE MUESTRAS
# ------------------------------------------------------------

# Las fotos son opcionales.
# Si existen fotos reales de las muestras, se pueden guardar en muestras/fotos/.
# Este indice permite documentar que foto corresponde a que muestra y su fuente.

photo_index_file <- file.path(
  DIRS$muestras_fotos,
  "indice_fotos.tsv"
)

if (!file.exists(photo_index_file)) {
  photo_index <- data.frame(
    SampleName = meta$SampleName,
    GSM = meta$GSM,
    Archivo = "",
    Fuente = "",
    Fecha = "",
    Notas = "",
    stringsAsFactors = FALSE
  )
  
  write.table(
    photo_index,
    photo_index_file,
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )
}

photos_readme <- file.path(
  DIRS$muestras_fotos,
  "README_fotos.txt"
)

if (!file.exists(photos_readme)) {
  writeLines(
    c(
      "FOTOS DE MUESTRAS",
      "==================",
      "",
      "Esta carpeta es opcional.",
      "",
      "Usala solo para fotos reales de las muestras si existen.",
      "Idealmente nombra los archivos con SampleName o GSM.",
      "",
      "Completa indice_fotos.tsv con:",
      "- SampleName",
      "- GSM",
      "- nombre del archivo",
      "- fuente/procedencia",
      "- fecha si esta disponible",
      "- notas",
      "",
      "Si una imagen proviene de un articulo y es una figura publicada,",
      "guardala en documentacion/ y registra correctamente la fuente;",
      "no la presentes como si fuera una fotografia original de la muestra."
    ),
    photos_readme
  )
}


# ------------------------------------------------------------
# 3) DESCARGAR EL RPKM PROCESADO OFICIAL DE GEO
# ------------------------------------------------------------

# El registro GSE98923 contiene:
# GSE98923_RPKM_2012-2013-2014_controls.txt.gz

supp_dir <- DIRS$data_raw_geo

# Primero revisamos si ya existe en la estructura nueva.
rpkm_candidates <- list.files(
  supp_dir,
  pattern = "GSE98923_RPKM_2012-2013-2014_controls\\.txt\\.gz$",
  full.names = TRUE,
  recursive = TRUE
)

# Si vienes de la ejecucion anterior, intentamos reutilizar el archivo
# que haya quedado en GSE98923_CEMiTool_baseline/geo/.
if (length(rpkm_candidates) == 0) {
  old_geo_dir <- file.path(
    PROJECT_DIR,
    "GSE98923_CEMiTool_baseline",
    "geo"
  )
  
  if (dir.exists(old_geo_dir)) {
    old_rpkm <- list.files(
      old_geo_dir,
      pattern = "GSE98923_RPKM_2012-2013-2014_controls\\.txt\\.gz$",
      full.names = TRUE,
      recursive = TRUE
    )
    
    if (length(old_rpkm) == 1) {
      reuse_dir <- file.path(supp_dir, GSE_ID)
      dir.create(
        reuse_dir,
        showWarnings = FALSE,
        recursive = TRUE
      )
      
      reused_file <- file.path(
        reuse_dir,
        basename(old_rpkm)
      )
      
      file.copy(
        old_rpkm,
        reused_file,
        overwrite = FALSE
      )
      
      message(
        "\nReutilizando archivo GEO de la ejecucion anterior: ",
        reused_file
      )
    }
  }
  
  rpkm_candidates <- list.files(
    supp_dir,
    pattern = "GSE98923_RPKM_2012-2013-2014_controls\\.txt\\.gz$",
    full.names = TRUE,
    recursive = TRUE
  )
}

# Solo descargamos si todavia no existe.
if (length(rpkm_candidates) == 0) {
  message(
    "\nDescargando archivos suplementarios de ",
    GSE_ID,
    " ..."
  )
  
  GEOquery::getGEOSuppFiles(
    GSE_ID,
    makeDirectory = TRUE,
    baseDir = supp_dir
  )
  
  rpkm_candidates <- list.files(
    supp_dir,
    pattern = "GSE98923_RPKM_2012-2013-2014_controls\\.txt\\.gz$",
    full.names = TRUE,
    recursive = TRUE
  )
} else {
  message(
    "\nEl RPKM oficial ya existe; no se volvera a descargar."
  )
}

if (length(rpkm_candidates) != 1) {
  stop(
    "No pude identificar de forma unica el archivo RPKM oficial.\n",
    "Encontrados: ",
    paste(rpkm_candidates, collapse = "; ")
  )
}

rpkm_file <- rpkm_candidates[1]

message("Archivo RPKM: ", rpkm_file)


# ------------------------------------------------------------
# 4) OBTENER METADATA GEO PARA MAPEAR GSM <-> DESCRIPTION
# ------------------------------------------------------------

message(
  "\nDescargando metadata GEO de ",
  GSE_ID,
  " ..."
)

gse_list <- GEOquery::getGEO(
  GSE_ID,
  GSEMatrix = TRUE,
  getGPL = FALSE
)

if (length(gse_list) < 1) {
  stop("getGEO no devolvio ningun ExpressionSet.")
}

gse <- gse_list[[1]]

geo_pheno <- Biobase::pData(gse)

if ("geo_accession" %in% colnames(geo_pheno)) {
  geo_gsm <- as.character(geo_pheno$geo_accession)
} else {
  geo_gsm <- rownames(geo_pheno)
}

description_cols <- grep(
  "description",
  colnames(geo_pheno),
  ignore.case = TRUE,
  value = TRUE
)

if (length(description_cols) == 0) {
  stop(
    "No encontre una columna 'description' en pData(GSE98923).\n",
    "Columnas disponibles: ",
    paste(colnames(geo_pheno), collapse = ", ")
  )
}

get_description <- function(i) {
  vals <- as.character(
    geo_pheno[i, description_cols, drop = TRUE]
  )
  
  vals <- vals[
    !is.na(vals) & nzchar(vals)
  ]
  
  if (length(vals) == 0) {
    return(NA_character_)
  }
  
  vals[1]
}

geo_description <- vapply(
  seq_len(nrow(geo_pheno)),
  get_description,
  character(1)
)

geo_map <- data.frame(
  GSM = geo_gsm,
  Description = geo_description,
  stringsAsFactors = FALSE
)

sel_map <- geo_map[
  match(meta$GSM, geo_map$GSM),
  ,
  drop = FALSE
]

if (anyNA(sel_map$GSM)) {
  stop(
    "No pude encontrar en GEO estos GSM: ",
    paste(
      meta$GSM[is.na(sel_map$GSM)],
      collapse = ", "
    )
  )
}

# Guardar mapping para auditoria/reproducibilidad.
mapping_out <- cbind(
  meta,
  GEO_Description = sel_map$Description
)

mapping_file <- file.path(
  DIRS$muestras_metadata,
  "GSE98923_selection_54_with_GEO_description.tsv"
)

write.table(
  mapping_out,
  file = mapping_file,
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)


# ------------------------------------------------------------
# 5) LEER MATRIZ OFICIAL Y SELECCIONAR EXACTAMENTE 54 MUESTRAS
# ------------------------------------------------------------

message("\nLeyendo matriz RPKM oficial ...")

rpkm_raw <- read.delim(
  gzfile(rpkm_file),
  sep = "\t",
  header = TRUE,
  check.names = FALSE,
  stringsAsFactors = FALSE
)

if (ncol(rpkm_raw) < 2) {
  stop("El archivo RPKM no tiene suficientes columnas.")
}

gene_ids <- as.character(rpkm_raw[[1]])

if (anyNA(gene_ids) || any(!nzchar(gene_ids))) {
  stop(
    "Hay Gene IDs vacios/NA en la primera columna del archivo RPKM."
  )
}

if (anyDuplicated(gene_ids)) {
  stop(
    "La primera columna contiene Gene IDs duplicados.\n",
    "No los agregare automaticamente porque eso cambia el dato biologico."
  )
}

expr_colnames <- colnames(rpkm_raw)[-1]


# Caso A: las columnas del archivo son GSM.
if (all(meta$GSM %in% expr_colnames)) {
  
  source_cols <- meta$GSM
  names(source_cols) <- meta$GSM
  
  
  # Caso B: las columnas son el campo Description de GEO.
} else if (all(sel_map$Description %in% expr_colnames)) {
  
  source_cols <- sel_map$Description
  names(source_cols) <- meta$GSM
  
  
  # Caso C: R pudo haber convertido nombres.
} else if (
  all(
    make.names(sel_map$Description) %in%
    make.names(expr_colnames)
  )
) {
  
  idx <- match(
    make.names(sel_map$Description),
    make.names(expr_colnames)
  )
  
  source_cols <- expr_colnames[idx]
  names(source_cols) <- meta$GSM
  
  
} else {
  
  missing_desc <- sel_map$Description[
    !sel_map$Description %in% expr_colnames
  ]
  
  stop(
    "No pude mapear de forma segura las 54 muestras contra las columnas del RPKM.\n",
    "Ejemplos de columnas del RPKM: ",
    paste(head(expr_colnames, 10), collapse = ", "),
    "\n",
    "Ejemplos de Description faltantes: ",
    paste(head(missing_desc, 10), collapse = ", ")
  )
}


expr_rpkm <- rpkm_raw[
  ,
  unname(source_cols),
  drop = FALSE
]

colnames(expr_rpkm) <- names(source_cols)

rownames(expr_rpkm) <- gene_ids

# Convertir a numerico sin alterar nombres.
expr_rpkm[] <- lapply(
  expr_rpkm,
  as.numeric
)

if (anyNA(as.matrix(expr_rpkm))) {
  stop(
    "La matriz seleccionada contiene NA despues de convertir a numerico."
  )
}

if (any(!is.finite(as.matrix(expr_rpkm)))) {
  stop(
    "La matriz seleccionada contiene Inf/-Inf."
  )
}

if (any(as.matrix(expr_rpkm) < 0)) {
  stop(
    "La matriz RPKM contiene valores negativos, lo que no se esperaba."
  )
}


# ------------------------------------------------------------
# 5.1) ASEGURAR NOMBRES Y ORDEN EXACTOS DE MUESTRAS
# ------------------------------------------------------------

# En este dataset usamos SampleName como identificador de columna
# para que coincida exactamente con annot$SampleName.
#
# source_cols fue indexado por GSM, asi que asignamos los SampleName
# siguiendo el mismo orden de meta.

if (ncol(expr_rpkm) != nrow(meta)) {
  stop(
    "La matriz seleccionada no tiene 54 columnas."
  )
}

colnames(expr_rpkm) <- meta$SampleName

expr_rpkm <- expr_rpkm[
  ,
  meta$SampleName,
  drop = FALSE
]


# ------------------------------------------------------------
# 6) GUARDAR MATRICES PROCESADAS
# ------------------------------------------------------------

write_expression_tsv <- function(mat, path) {
  out <- data.frame(
    GeneID = rownames(mat),
    mat,
    check.names = FALSE
  )
  
  write.table(
    out,
    path,
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )
}


rpkm_out <- file.path(
  DIRS$data_processed_matrices,
  "GSE98923_CEMiTool_expression_54_RPKM.tsv"
)

write_expression_tsv(
  expr_rpkm,
  rpkm_out
)


expr_log2 <- log2(
  expr_rpkm + 1
)

log2_out <- file.path(
  DIRS$data_processed_matrices,
  "GSE98923_CEMiTool_expression_54_log2RPKM.tsv"
)

write_expression_tsv(
  expr_log2,
  log2_out
)


# Archivo minimo de fenotipos usado por CEMiTool.
annot <- meta[
  ,
  c("SampleName", "Class")
]

phen_out <- file.path(
  DIRS$muestras_metadata,
  "GSE98923_CEMiTool_phenotypes_54.tsv"
)

write.table(
  annot,
  phen_out,
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)


cat("\nMatriz final:\n")

cat(
  "Genes x muestras (RPKM): ",
  nrow(expr_rpkm),
  " x ",
  ncol(expr_rpkm),
  "\n",
  sep = ""
)

cat(
  "Genes x muestras (log2): ",
  nrow(expr_log2),
  " x ",
  ncol(expr_log2),
  "\n",
  sep = ""
)

stopifnot(
  identical(
    colnames(expr_log2),
    annot$SampleName
  )
)


# ------------------------------------------------------------
# 7) CEMiTool BASELINE
# ------------------------------------------------------------

# IMPORTANTE:
# - usamos log2(RPKM + 1), ya normalizado;
# - apply_vst = FALSE;
# - CEMiTool usa las seis clases definidas en Class;
# - en la ejecucion previa, la seleccion automatica de beta no encontro
#   un valor valido;
# - por eso este baseline deja FORCE_BETA = TRUE y lo registra en logs.
#
# Este baseline NO incorpora todavia:
#   * validacion skin-only,
#   * modelo Cultivar*Stage + Year,
#   * reprocesamiento moderno de FASTQ,
#   * las 219 muestras completas.

set.seed(RANDOM_SEED)

message(
  "\nEjecutando CEMiTool...",
  "\nforce_beta = ",
  FORCE_BETA
)

cem <- CEMiTool::cemitool(
  expr = as.data.frame(
    expr_log2,
    check.names = FALSE
  ),
  
  annot = annot,
  
  filter = TRUE,
  filter_pval = 0.1,
  
  apply_vst = FALSE,
  
  cor_method = "pearson",
  
  network_type = "unsigned",
  tom_type = "signed",
  
  # CAMBIO CLAVE:
  # la seleccion automatica de beta fallo previamente.
  force_beta = FORCE_BETA,
  
  merge_similar = TRUE,
  min_ngen = 30,
  
  plot = TRUE,
  plot_diagnostics = TRUE,
  
  order_by_class = TRUE,
  
  verbose = TRUE
)


# ------------------------------------------------------------
# 7.1) VALIDAR QUE EXISTAN MODULOS
# ------------------------------------------------------------

n_mods <- CEMiTool::nmodules(cem)

if (is.na(n_mods) || n_mods < 1) {
  # Guardamos el objeto aunque haya fallado, para diagnostico.
  failed_rds <- file.path(
    DIRS$analisis_objetos,
    "GSE98923_CEMiTool_54_baseline_FAILED.rds"
  )
  
  saveRDS(
    cem,
    failed_rds
  )
  
  stop(
    "CEMiTool termino sin modulos incluso con force_beta = TRUE.\n",
    "Objeto guardado para diagnostico en:\n",
    failed_rds
  )
}


# ------------------------------------------------------------
# 8) GUARDAR OBJETO Y RESULTADOS
# ------------------------------------------------------------

cem_rds <- file.path(
  DIRS$analisis_objetos,
  "GSE98923_CEMiTool_54_baseline.rds"
)

saveRDS(
  cem,
  cem_rds
)


# Tablas
CEMiTool::write_files(
  cem,
  directory = DIRS$analisis_tablas,
  force = TRUE
)


# Graficos
CEMiTool::save_plots(
  cem,
  "all",
  force = TRUE,
  directory = DIRS$figuras_cemitool
)


# ------------------------------------------------------------
# 9) INFORMES HTML
# ------------------------------------------------------------

# Reporte principal.
tryCatch(
  {
    CEMiTool::generate_report(
      cem,
      title = "GSE98923 - CEMiTool baseline 54 muestras",
      directory = DIRS$informes_reporte,
      force = TRUE,
      output_format = "html_document"
    )
  },
  error = function(e) {
    warning(
      "El analisis termino, pero no pude generar el reporte HTML principal: ",
      conditionMessage(e)
    )
  }
)


# Reporte diagnostico.
tryCatch(
  {
    CEMiTool::diagnostic_report(
      cem,
      title = "GSE98923 - Diagnosticos CEMiTool",
      directory = DIRS$informes_diagnosticos,
      force = TRUE
    )
  },
  error = function(e) {
    warning(
      "El analisis termino, pero no pude generar el reporte diagnostico HTML: ",
      conditionMessage(e)
    )
  }
)


# ------------------------------------------------------------
# 10) REPRODUCIBILIDAD Y LOGS
# ------------------------------------------------------------

session_file <- file.path(
  DIRS$logs,
  "sessionInfo.txt"
)

writeLines(
  capture.output(sessionInfo()),
  con = session_file
)


# Registrar parametros principales.
beta_selected <- tryCatch(
  cem@parameters$beta,
  error = function(e) NA
)

r2_selected <- tryCatch(
  cem@parameters$r2,
  error = function(e) NA
)

parameters_file <- file.path(
  DIRS$logs,
  "parametros_CEMiTool_baseline.txt"
)

writeLines(
  c(
    paste0("GSE_ID=", GSE_ID),
    paste0("n_muestras=", ncol(expr_log2)),
    paste0("n_genes_entrada=", nrow(expr_log2)),
    paste0("transformacion=log2(RPKM+1)"),
    paste0("filter=TRUE"),
    paste0("filter_pval=0.1"),
    paste0("apply_vst=FALSE"),
    paste0("cor_method=pearson"),
    paste0("network_type=unsigned"),
    paste0("tom_type=signed"),
    paste0("force_beta=", FORCE_BETA),
    paste0("beta_seleccionado=", beta_selected),
    paste0("R2_beta=", r2_selected),
    paste0("merge_similar=TRUE"),
    paste0("min_ngen=30"),
    paste0("seed=", RANDOM_SEED),
    paste0("numero_modulos=", n_mods)
  ),
  con = parameters_file
)


# Resumen de ejecucion.
run_summary_file <- file.path(
  DIRS$logs,
  "resumen_ejecucion.txt"
)

writeLines(
  c(
    "GSE98923 CEMiTool baseline - resumen",
    "===================================",
    "",
    paste0("Fecha/hora: ", Sys.time()),
    paste0("Proyecto: ", PROJECT_DIR),
    paste0("Muestras: ", ncol(expr_log2)),
    paste0("Genes de entrada: ", nrow(expr_log2)),
    paste0("Modulos: ", n_mods),
    paste0("force_beta: ", FORCE_BETA),
    paste0("Beta usado: ", beta_selected),
    paste0("R2 asociado: ", r2_selected),
    "",
    paste0("Matriz RPKM: ", rpkm_out),
    paste0("Matriz log2(RPKM+1): ", log2_out),
    paste0("Fenotipos: ", phen_out),
    paste0("Mapping GEO: ", mapping_file),
    paste0("Objeto CEMiTool: ", cem_rds),
    paste0("Tablas: ", DIRS$analisis_tablas),
    paste0("Figuras: ", DIRS$figuras_cemitool),
    paste0("Reporte: ", DIRS$informes_reporte),
    paste0("Diagnosticos: ", DIRS$informes_diagnosticos),
    paste0("sessionInfo: ", session_file)
  ),
  con = run_summary_file
)


# ------------------------------------------------------------
# 11) FIN
# ------------------------------------------------------------

cat("\n========================================\n")
cat("ANALISIS TERMINADO\n")
cat("========================================\n")

cat(
  "Matriz RPKM: ",
  rpkm_out,
  "\n",
  sep = ""
)

cat(
  "Matriz log2(RPKM+1): ",
  log2_out,
  "\n",
  sep = ""
)

cat(
  "Fenotipos: ",
  phen_out,
  "\n",
  sep = ""
)

cat(
  "Numero de modulos: ",
  n_mods,
  "\n",
  sep = ""
)

cat(
  "Beta usado: ",
  beta_selected,
  "\n",
  sep = ""
)

cat(
  "Objeto CEMiTool: ",
  cem_rds,
  "\n",
  sep = ""
)

cat(
  "Tablas: ",
  DIRS$analisis_tablas,
  "\n",
  sep = ""
)

cat(
  "Figuras: ",
  DIRS$figuras_cemitool,
  "\n",
  sep = ""
)

cat(
  "Informes: ",
  DIRS$informes_cemitool,
  "\n",
  sep = ""
)

cat(
  "Logs: ",
  DIRS$logs,
  "\n",
  sep = ""
)

cat("\nRevisa README_ESTRUCTURA_PROYECTO.txt para entender cada carpeta.\n")
