# T-009 — Integrated scientific report and manuscript

**Status:** DONE (2026-09-25).

## Objective

Integrate the validated layers from T-004 through T-008 into two complementary deliverables without rerunning CEMiTool or promoting observational evidence to mechanism:

1. a cumulative technical report with diagnostics, tables, figures and provenance; and
2. a concise scientific manuscript with methods, main results, discussion, limitations and verified primary references.

## Reproducible workflow

`scripts/post/30_t009_integrated_report.R` validates the canonical inputs, archives the previous report and manuscript, renders HTML/DOCX/PDF outputs, and writes an evidence package under `results/integrated_report_t009/`.

The script fails if the principal project invariants change unexpectedly, including the number of significant interaction modules, the identity of M5 as the strongest interaction, the M10 year classification, corrected GO hit count, modern-matrix PASS state, mapped-core preservation classes, or the M2 mapping boundary.

## Final deliverables

Technical report:

- `reports/current/analysis_report.html`
- `reports/current/analysis_report.docx`
- `reports/current/analysis_report.pdf`
- `reports/current/analysis_report_status.tsv`

Manuscript:

- `manuscript/article_draft.Rmd`
- `manuscript/article_draft.html`
- `manuscript/article_draft.docx`
- `manuscript/article_draft.pdf`
- `manuscript/article_render_status.tsv`
- `manuscript/references.bib`

Evidence package:

- `results/integrated_report_t009/claim_evidence_matrix.tsv` traces nine calibrated claims to canonical result files and interpretation boundaries.
- `results/integrated_report_t009/supplementary_manifest.tsv` records paths, sizes and MD5 hashes for 80 T-004--T-008 supplementary files.
- `results/integrated_report_t009/integration_qc.tsv` records all integration checks.
- `results/integrated_report_t009/artifact_validation.tsv` records structural, text and visual checks for the six rendered artifacts.

The previous technical report is preserved under `reports/archive/20260925_001344_before_t009_integration/`. The previous manuscript render is preserved under `manuscript/archive/20260925_001344_before_t009_integration/`.

## Integrated interpretation

- M5 is the leading integrated candidate program: it has the strongest Cultivar × Stage interaction, a repeated Harvest direction across three vintages, strong phenolic/stilbenoid/PAL MapMan enrichment, externally supported hubs and moderate preservation of its mapped core after modern processing.
- M10 is the only priority module that meets the prespecified module-level year-reproducibility rule. Its functional and individual-gene external support remain limited.
- M2 retains same-direction Veraison and Harvest contrasts in all years and moderate preservation of its mapped core, but only 81/214 genes map reciprocally. Exact-zero patterns, paralogy, reference bias and structural variation remain open.
- M3 lacks modern preservation support. M1 is technically strongly preserved but its cultivar-stage interaction was not established as year-stable.

This hierarchy is a prioritization of transcriptional programs, not proof of enzyme activity, direct regulation or phenotype causality.

## Scientific boundaries retained

- The primary tissue is berry pericarp, not isolated skin.
- No analyzed dataset measures skin thickness.
- Cultivar is entangled with clone, rootstock and planting history in the original field system.
- External skin datasets differ in year, condition, developmental definition and platform.
- GO coverage is sparse in the priority modules.
- Current annotations do not resolve CHS versus STS activity for the M5 chromosome-16 family.
- Reciprocal one-to-one mapping intentionally excludes ambiguous genes; unmapped genes are not called absent.
- Coexpression, enrichment, hub status, external concordance and preservation do not establish causality.

## Acceptance verification

- Both report and manuscript rendered successfully as HTML, DOCX and PDF.
- Required concepts and boundaries were found in both outputs.
- The technical PDF contains 36 Letter-size pages and the manuscript PDF contains 8; every page was rasterized and visually inspected.
- The technical DOCX contains 31 Letter-size pages when exported read-only by Microsoft Word and the manuscript DOCX contains 8; every page was visually inspected.
- DOCX ZIP integrity, tables, media and text extraction passed.
- The final accessibility audit found no high-, medium- or low-severity findings in the technical DOCX after adding alternative text to its 17 embedded images. The manuscript DOCX had no high- or medium-severity findings; its three low-severity findings are canonical DOI links intentionally written as URLs.
- A first visual pass detected compressed table headers and an unrefreshed Word TOC; the tables were simplified and the Word-only TOC was removed while HTML/PDF retained navigation.
- No samples, matrices, module memberships, beta values or historical scientific outputs were changed.

## Warnings and recovered issues

- R emitted four non-fatal Windows locale warnings for `C.UTF-8`.
- Pandoc reported that `fig.align` is ignored for DOCX; figures remained complete and readable in Word.
- Poppler reported unavailable display fonts named `Symbol` and `ArialUnicode` while rasterizing the PDF, but no missing glyphs or black boxes were observed.
- The first render attempt did not find Pandoc on `PATH`; the script was corrected to use the existing RStudio Pandoc 3.10 installation.
- The bundled DOCX renderer could not find a bundled LibreOffice runtime, so final DOCX visual validation used Microsoft Word in hidden, read-only mode and temporary PDF exports. The source DOCX files were not modified by this validation.
