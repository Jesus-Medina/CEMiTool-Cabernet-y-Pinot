# Scientific files intentionally kept outside Git

## T-008 local scratch (2026-09-22)

Scratch root: `D:/CEMiTool_T008_scratch/`. These files are preserved locally, not committed. URL, SHA-256, size and scientific role of the three active Grapedia inputs are versioned in `data/reference/t008/grapedia_t2t_v5_1_source_manifest.tsv`; the selected ENA FASTQ URL, MD5 and size are in `results/fastq_reprocessing_t008/selected_54_gsm_to_srr.tsv`.

| Local file | Size | Reason not uploaded |
|---|---:|---|
| `reference/T2T_ref.zip` | 133.155.642 bytes | Public genome archive exceeds the normal Git blob limit; source/hash pinned. |
| `reference/5.1_on_T2T_all_variants.zip` | 168.153.990 bytes | Public all-transcript archive exceeds the normal Git blob limit; source/hash pinned. |
| `reference/PN40024_5.1_on_T2T_ref_with_names.zip` | 5.148.437 bytes | Public GFF3 kept with the same scratch reference bundle; source/hash pinned. |
| `reference/5.1_on_T2T_ref_main_variants.zip` | 102.243.554 bytes | Downloaded for inspection but **not used** by the all-variant index; not part of the pinned active source set. |
| `raw/SRR5560506/SRR5560506.fastq.gz` | 1.140.195.006 bytes | Verified public pilot FASTQ, >100 MB; re-downloadable by URL/MD5 from ENA. |
| `raw/SRR5560667/SRR5560667.fastq.gz` | 1.655.472.514 bytes | Verified second selected FASTQ, >100 MB; resumed after a partial transfer and accepted only after ENA MD5. |
| `tools/salmon-linux-x86_64.tar.gz` | 5.319.100 bytes | Official Salmon 1.12.1 executable package; SHA-256 and URL in `docs/T008_RAW_REPROCESSING.md`. |

The 52 remaining selected FASTQ will also be retained under `raw/<SRR>/<SRR>.fastq.gz` as verified; exact expected sizes/MD5/URLs for every run are already pinned in `results/fastq_reprocessing_t008/selected_54_gsm_to_srr.tsv`. Salmon working directories under `quant/<SRR>/` remain on D:, while exact compressed outputs and QC are archived per sample in Git. Extracted FASTA/GFF3, the gentrome, index attempts and software binary under this scratch root are generated or unpacked intermediates; they are not scientific baseline files. Two incomplete index directories were retained for diagnosis, not treated as valid outputs. No historical or user-created source file was deleted.
