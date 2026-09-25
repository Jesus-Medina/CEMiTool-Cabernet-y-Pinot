# Stable public scientific explorer

**Release:** `web-v1.0`

**Date:** 2026-09-25

**Public URL:** https://jesus-medina.github.io/CEMiTool-Cabernet-y-Pinot/

## Scope

The stable release publishes the integrated scientific narrative under the reader-facing name **Síntesis científica integrada**. Internal task identifiers remain available only in the reproducibility history; they are not used as the public title.

The route `#/results/synthesis` connects:

- M5 as the leading integrated candidate program;
- M10 as the clearest module-level year-reproducible signal;
- M2 as a moderately preserved **mapped core**, not as a fully preserved module;
- the evidence ladder from network/statistics through annual robustness, function, hubs, external skin-only evidence and modern reprocessing;
- the integrated manuscript and complete technical report.

No sample, expression matrix, network, module assignment or inferential result was changed.

## Canonical publication mechanism

`site/scripts/sync_public_reports.py` copies the canonical manuscript and technical report into the deployable site only during build and verifies that source and published copies have identical SHA-256 hashes. Generated publication copies remain ignored by Git, preventing stale binary snapshots from becoming competing sources.

The synthesis provenance is exported from canonical repository results and exposed in the reproducibility browser. Critical scientific values are not maintained as a separate hand-edited web dataset.

## Validation record

All three GitHub Actions runs for commit `e2a69bb092deb638ace154af3c41f6ce0bc3308a` completed successfully:

- `Site scaffold checks`: run `36102680555`;
- `WEB-011 scientific and browser QA`: run `36102680500`;
- `Deploy scientific explorer to GitHub Pages`: run `36102680522`.

The remote QA rebuilt canonical data and reports, then passed:

- schema and row-count validation;
- scientific-value checks;
- lint and UI consistency checks;
- TypeScript validation;
- production build and bundle budget;
- Chrome, Firefox and mobile Playwright coverage.

The public landing page, manuscript HTML, manuscript PDF and technical-report PDF returned HTTP 200. A live browser check confirmed that the synthesis loaded the expected dynamic values for M5, M10 and M2 and retained the established responsive navigation and visual system.

## Scientific boundaries retained

- The primary tissue is whole berry pericarp, not isolated skin.
- GSE98923 contains no direct skin-thickness phenotype.
- Coexpression, hub status, enrichment and external concordance do not establish causality.
- The CHS/STS identity of the M5 family block remains unresolved.
- External skin-only datasets are supporting evidence and are not added to the 54-sample baseline.
- Modern preservation statements apply only to reciprocal mapped cores; M2 has 81/214 genes in that comparison.

## Warnings

The local host lacked the Playwright Google Chrome distribution, so the complete local Playwright suite could not run there. This did not weaken the release gate: GitHub Actions installed its controlled browsers and the full Chrome, Firefox and mobile suite passed. GitHub also emitted advance deprecation notices about Node 20-based action runtimes and the future migration of `ubuntu-latest`; neither warning affected this release.
