# GSE98923 CEMiTool analysis

Reproducible co-expression analysis of a balanced 54-sample subset from GEO accession **GSE98923**.

The project is organized for a scientific manuscript workflow: raw data, metadata, processed data, analysis outputs, figures, reports, manuscript files, and reproducibility records are kept separate.

## Project structure

```text
gse98923_cemitool/
├── gse98923_cemitool.Rproj
├── README.md
├── run_all.R
├── scripts/
│   ├── 00_setup.R
│   ├── 01_download_geo.R
│   ├── 02_prepare_data.R
│   ├── 03_run_cemitool.R
│   ├── 04_export_results.R
│   └── 05_render_reports.R
├── templates/
│   ├── analysis_report.Rmd
│   └── article_draft.Rmd
├── data/
│   ├── raw/
│   │   ├── geo/
│   │   └── images/
│   ├── metadata/
│   └── processed/
├── results/
│   ├── objects/
│   ├── tables/
│   └── figures/
├── reports/
│   ├── cemitool/
│   ├── diagnostics/
│   ├── analysis_report.html
│   ├── analysis_report.docx
│   ├── analysis_report.pdf
│   ├── assets/
│   └── supplementary/
├── manuscript/
│   ├── article_draft.docx
│   ├── article_draft.pdf
│   └── references.bib
├── docs/
│   └── reference_images/
└── logs/
    ├── session_info.txt
    ├── parameters.txt
    └── run_summary.txt
```

## Reproducible workflow

For normal scientific work, run the modular scripts in order:

```r
source("scripts/00_setup.R")
source("scripts/01_download_geo.R")
source("scripts/02_prepare_data.R")
source("scripts/03_run_cemitool.R")
source("scripts/04_export_results.R")
source("scripts/05_render_reports.R")
```

For a clean machine or an empty directory, the complete workflow can be launched with:

```r
source("run_all.R")
```

`run_all.R` contains the exact 54-sample selection used for this baseline. It creates the project structure, installs missing R packages, downloads the public GEO data, prepares the expression matrices, runs CEMiTool, exports results, and renders the reports.

## Reports

The workflow produces three versions of the technical report:

- `reports/analysis_report.html`
- `reports/analysis_report.docx` - editable in Microsoft Word / LibreOffice
- `reports/analysis_report.pdf`

The PDF build uses LaTeX. If no LaTeX installation is found, the workflow attempts to install TinyTeX once.

The report embeds all analysis figures and compact views of exported result tables. Very large expression matrices and large result tables are intentionally not printed in full inside Word/PDF because that is poor scientific reporting practice. Their complete versions remain as machine-readable supplementary files and are indexed with checksums under `reports/supplementary/`.

## Manuscript draft

The workflow also renders:

- `manuscript/article_draft.docx`
- `manuscript/article_draft.pdf`

This is an editable scientific-article scaffold. Computational methods and basic dataset/result summaries are filled automatically. Literature-dependent sections such as Introduction and Discussion remain clearly marked for author writing rather than being fabricated by the pipeline.

## Images

Original experimental sample photographs, if they genuinely exist, belong in:

```text
data/raw/images/
```

and should be indexed in:

```text
data/metadata/sample_images.tsv
```

Images copied from papers, websites, presentations, or other secondary sources belong in:

```text
docs/reference_images/
```

They should not be presented as original sample photographs.

## Reproducibility

Raw GEO files are not edited manually. Processed files are regenerated from scripts. Software versions, analysis parameters, and file checksums are recorded under `logs/` and `reports/supplementary/`.


## Native CEMiTool reports

The workflow also creates the package-native HTML reports:

- `reports/cemitool/` - CEMiTool analysis report
- `reports/diagnostics/` - CEMiTool diagnostic report

These are retained alongside the consolidated HTML/Word/PDF report because
they provide package-specific diagnostic and module views that are useful
for review and reproducibility.
