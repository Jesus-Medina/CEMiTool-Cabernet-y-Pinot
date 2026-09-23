# Changelog

## 2026-09-23 — UX05B-05 mobile module list

- Replaced the horizontally dominant module table with stacked comparison cards below 650 px.
- Preserved genes, interaction significance, annual robustness, ORA, hubs, external evidence and module priority in each card.
- Reused the same canonical rows, shareable filters and detail routes as the desktop table, closing the UX-05B phase.

## 2026-09-23 — UX05B-04 module comparison glossary

- Added a progressive-disclosure guide defining interaction FDR, annual robustness, ORA, hub centrality and external evidence.
- States the interpretation boundary for each dimension and explicitly rejects an aggregate “best module” score.
- Adapts the glossary from five columns to two and then one across responsive breakpoints.

## 2026-09-23 — UX05B-03 shareable module filters

- Synchronized module filter and search state with the `filter` and `q` URL parameters.
- Made filtered comparisons shareable and persistent across reload and browser navigation.
- Safely falls back to the complete module set for unknown filter values without changing canonical data.

## 2026-09-23 — UX05B-02 accessible module comparison

- Consolidated M1–M10 into one compact comparison across genes, interaction FDR, annual robustness, ORA, hubs and external evidence.
- Added a descriptive caption, scoped column and row headers, and a live filtered-result count.
- Preserved the original CEMiTool profile panels as linked canonical evidence without introducing an aggregate module score.

## 2026-09-23 — UX05B-01 Results landing activation

- Replaced the `/results` redirect with the existing scientific Results landing.
- Exposed Modules, Validation and Genes as explicit result families, with Function as a secondary cross-cutting layer.
- Kept canonical module/significance/reproducibility counts and guidance toward M5 and provenance.

## 2026-09-23 — UX05A-06 Home action hierarchy

- Kept “Explorar resultados” as the only primary action on Home.
- Demoted the M5 deep link to the shared contextual-link treatment while retaining Methods as the sole secondary hero button.
- Closed the UX-05A Home narrative phase and advanced the roadmap to the Results landing redesign.

## 2026-09-23 — UX05A-05 evidence boundary

- Replaced the unfinished Home limitations treatment with paired “Qué sabemos” and “Qué todavía no sabemos” panels.
- Separated supported evidence about design, cultivar-stage programs, annual robustness and external concordance from unresolved causality, tissue specificity, CHS/STS identity and modern reprocessing.
- Preserved canonical dynamic counts and the same scientific reading order on desktop and mobile.

## 2026-09-23 — Decorative Methods vine

- Added the user-provided transparent vine branch as a vertical environmental motif in the Methods left gutter.
- Alternated and overlapped repeated branches, with edge masks and restrained opacity, so joins and image boundaries disappear naturally.
- Kept the decoration behind the interface, outside scientific cards and navigation, and disabled it at widths of 900 px or less.
- Visually inspected the running Methods page; UI QA, scientific QA, lint, typecheck and build pass.

## 2026-09-23 — New grape–DNA brand mark and favicon

- Replaced the legacy geometric grape symbol in the global header with the user-provided grape–DNA mark.
- Preserved transparency, removed only empty canvas space and optimized the header asset to 350×512 px.
- Added a centered 256×256 PNG favicon and matching Apple touch icon, with a Vite-base-safe path for local and deployed builds.
- Verified the header image loads at its expected dimensions; UI QA, scientific QA, lint, typecheck and build pass.

## 2026-09-23 — UX05A-04 canonical M5 highlight

- Replaced the static Home M5 image with three responsive SVG small multiples generated from all 18 canonical cultivar-stage-year means.
- Added visible M5 gene count, Cultivar×Stage FDR and Harvest year coverage, plus accessible point-level values.
- Paired the Harvest directional takeaway with a prominent caveat that M5 remains year-dependent globally and does not establish causality, skin thickness or CHS/STS identity.
- Verified three panels, six lines, 18 points, no alerts and no body overflow from 320–1440 px; UI QA, scientific QA, lint, typecheck and build pass.

## 2026-09-23 — UX05A-03 explicit experimental design

- Replaced the abstract Home study flow with the canonical equation: 2 cultivars × 3 stages × 3 years × 3 biological replicates = 54 samples.
- Added an accessible cultivar-by-stage matrix showing six balanced cells of nine samples and retained Year and whole-pericarp interpretation boundaries.
- Adapted the matrix into readable cultivar cards on mobile without duplicating data or introducing hard-coded scientific values.
- Verified two cultivar rows, six cells, the 54-sample total, no alerts and no body overflow from 320–1440 px; UI QA, scientific QA, lint, typecheck and build pass.

## 2026-09-23 — UX05A-02 integrated evidence story

- Replaced the separate historical Story implementation with a compact four-step evidence path inside Home.
- Preserved the scientific distinctions between beta10/beta7, annual robustness, module-level function, CHS/STS ambiguity, independent skin evidence and incomplete T-008 reprocessing.
- Kept `/story` as a backwards-compatible redirect to Home and removed the dead component and its local CSS.
- Verified one H1, four evidence steps, no alerts and no body overflow from 320–1440 px; UI QA, scientific QA, lint, typecheck and build pass.

## 2026-09-23 — UX05A-01 Home scientific narrative hierarchy

- Reframed the Home hero as an explicit scientific question about cultivar-specific coexpression programs during ripening.
- Reordered the semantic DOM to question → study design → findings → M5 case study → interpretation limits.
- Preserved the approved grape-image composition and all scientific boundaries while reducing one additional legacy button implementation.
- Verified heading order, one primary hero action and no overflow at 320–1440 px; UI QA, scientific QA, lint, typecheck and build pass.

## 2026-09-23 — UX04-08 design-system contract and CI guardrail

- Added `docs/WEB_DESIGN_SYSTEM.md` with canonical token, primitive, navigation, context, responsive, accessibility and migration rules.
- Added a portable UI-consistency checker that freezes legacy-pattern budgets and prohibits reintroducing local equivalents for migrated filters and empty states.
- Added `npm run qa:ui` to the site workflow so pull requests fail when UI debt increases or required shared primitives disappear.
- Verified the new guardrail on Windows paths containing spaces; UI QA, scientific QA, lint, typecheck and production build pass.

## 2026-09-23 — UX04-07 consolidated scientific context

- Replaced separate dataset, module-workspace and breadcrumb strips with one responsive scientific context rail.
- Preserved explicit baseline/external-evidence identity, interpretation limits, module workspace layers and accessible route hierarchy.
- Reduced stacked chrome above module and gene content while retaining a second route row inside the same surface when width requires it.
- Verified module, gene and external-validation routes at 320–1440 px with no document overflow; scientific QA, lint, typecheck and build pass.

## 2026-09-23 — UX04-06 global responsive header

- Consolidated the header around four primary destinations and a separate utility group for search, grounded questions and GitHub.
- Added explicit mobile navigation/tool labels, active-route treatment and a compact right-aligned tablet menu that becomes full-width on phones.
- Added focus transfer on open, Escape and outside-click dismissal, focus restoration and automatic close after route changes.
- Verified desktop/mobile parity and responsive behavior at 320, 390, 768, 980, 981, 1024 and 1440 px; scientific QA, lint, typecheck and build pass.

## 2026-09-23 — UX04-05 scientific display primitives

- Added shared `ChartCard`, `TableFrame`, `FilterBar`, `AsyncState` and `EmptyState` components.
- Migrated M5 trajectory charts, module/validation filters and tables, and the first loading/error/empty states to the common layer.
- Made horizontally scrollable scientific tables labelled, keyboard-focusable regions with visible focus and contained overscroll.
- Verified Home, Modules, M2, M5, Validation and T-008 at 320–1440 px; SVGs, filters and tables remain functional, and scientific QA, lint, typecheck and build pass.

## 2026-09-23 — UX04-04 shared interface primitives

- Added typed shared primitives for buttons, semantic badges, scientific callouts, action links and interactive cards.
- Migrated Home/M5 actions, M2/M10 interpretation callouts, module-priority badges and the T-008 gate to the shared system.
- Fixed mobile document overflow caused by wide scientific tables inside disclosures while retaining contained horizontal table scrolling.
- Verified six routes at 320, 390, 768 and 1440 px with no document overflow or UI alerts; keyboard focus, scientific QA, lint, typecheck and production build pass.

## 2026-09-23 — UX04-03 responsive spacing and layout foundations

- Added a shared 4–64 px spacing scale, fluid page gutter, 1240 px layout maximum, 720 px reading measure, panel padding and 44 px control-height tokens.
- Migrated the shell, Home, dataset/module context strips and the first module-workspace layer to the shared spacing model, including an explicit compact mobile density.
- Verified Home, Modules, M5, Validation and T-008 at 320, 390, 768, 1024 and 1440 px with no horizontal overflow or UI alerts; scientific QA, lint, typecheck and production build pass.

## 2026-09-23 — UX04-02 semantic color and focus foundations

- Added semantic tokens for brand, text, surfaces, borders, success, warning, danger, information, selection and keyboard focus while retaining temporary legacy aliases.
- Migrated the shell, Home, context strips, module/M5 workspace, T-008 states and external-validation badge to semantic colors.
- Replaced translucent global focus styling with a solid 3 px focus ring and aligned form-control focus with the same token.
- Verified core foreground/background pairs at 5.43:1–16.92:1 contrast.
- Scientific QA, lint, typecheck and production build pass; Home, M5, Validation and T-008 show no document overflow or runtime alerts at 390 and 1440 px in Microsoft Edge.
- No scientific value, classification or interpretation changed.

## 2026-09-23 — UX04-01 typography foundations

- Added locally bundled variable fonts: Source Serif 4 for scientific/editorial headings and Inter for body copy, navigation, controls and data-dense UI.
- Introduced semantic typography tokens for families, display/heading/body sizes, line height and tracking.
- Migrated the global shell, Home, dataset/module context strips and module/M5 headings to the shared type system, replacing the previous Georgia-versus-Inter split.
- Raised critical Home and context metadata to the 13 px minimum token and retained monospace only for technical identifiers and paths.
- Scientific QA, lint, typecheck and production build pass; local font loading and 390 px Home/M5 overflow checks pass in Microsoft Edge.
- The full Playwright matrix remains unavailable locally because its Chrome/Firefox browser binaries are not installed; no scientific result changed.

## 2026-09-23 — Future scientific portal opportunity portfolio

- Extended the UX/UI master roadmap with a separate `FUT-01`–`FUT-24` opportunity portfolio based on the repository's tables, scripts, reports, documentation and analysis objects.
- Prioritized semantic catalog/search, provenance graph, shareable snapshots, figure export, sample atlas, gene-list exploration, report generation, RO-Crate packaging, browser notebooks, grounded assistance and machine-readable life-science metadata.
- Added dependencies, scientific boundaries, implementation horizons and an explicit gate preventing exploratory features from being presented as canonical inference.
- Kept `UX04-01` as the immediate next task; no scientific result or site behavior changed.

## 2026-09-23 — UX/UI implementation master roadmap

- Added `docs/WEB_UX_UI_IMPLEMENTATION_ROADMAP.md` as the operational source of truth for the full interface redesign.
- Consolidated the current audit, historical functionality recovery, target information architecture, visual-system proposal, phased task IDs, dependencies and acceptance criteria.
- Defined `UX04-01 — Fundamentos tipográficos y tokens` as the next executable task and preserved all scientific invariants; no analysis result or frontend behavior changed.

## 2026-09-23 — Responsive navbar visibility fix

- Restored the full primary and utility navigation at desktop widths.
- Kept the compact `Menú` control for tablet and mobile breakpoints, with the same links inside the opened panel.
- Verified the desktop DOM exposes both navigation groups and the production build remains clean.

## 2026-09-23 — UX-04 module workspace context

- Added a compact module-workspace context strip for M5 and the other module detail routes.
- The strip keeps the active module and its available evidence layers visible while the existing section navigation handles in-page exploration.
- Route checks for M5, lint, typecheck, production build and diff validation pass.

## 2026-09-23 — UX-04 dataset context surface

- Added a persistent context strip to result routes so visitors can distinguish the GSE98923 pericarp baseline from external isolated-skin validation while navigating.
- The strip is responsive, absent from the overview, and preserves the scientific boundary that external evidence does not add to the baseline N=54.
- Lint, typecheck, production build and route-level browser checks pass; no canonical result or interpretation changed.

## 2026-09-23 — WEB-012 compact header consistency

- Applied the approved compact header treatment across desktop, tablet and mobile breakpoints.
- Kept the brand mark and `Menú` control visible at all widths; primary, utility and GitHub links remain available inside the opened menu.
- Preserved the two-column hero composition and moved the study summary below the grape image so it never overlays the visual.
- Changed the grape hero asset to a centered, contained rendering with internal spacing so the transparent-cutout composition is never cropped at the edges.
- Preserved the sticky header, skip link, route structure and scientific content. Lint, typecheck and production build pass.

## 2026-09-22 — WEB-010 global Evidence Browser completed

- Replaced the Evidence placeholder with a global provenance browser powered by the generated `provenance.json` manifest.
- Added build commit, export timestamp, artifact/source/script counts and searchable indexing across finding labels, artifact IDs, TSV paths, scripts and parameters.
- Added eight evidence maps for the main web narratives: baseline/beta10, module effects and annual robustness, M5 trajectory, functional enrichment, hub prioritization, M5 network, external skin validation and live T-008 progress.
- Each artifact exposes commit-pinned GitHub links, SHA-256 hashes, file sizes, generating scripts and parameters while retaining an explicit interpretation boundary for the associated finding.
- Added direct provenance navigation from the all-module contrast matrix and functional-enrichment view; M5, T-007 validation and T-008 already exposed dedicated provenance.
- Commit `e6845b8`; CI run `35757479808` passed export/validation/lint/typecheck/build and Pages run `35757479727` deployed successfully.
- WEB-011 final QA is now the next phase. No scientific analysis, result, annotation, network or T-008 conclusion was changed.

## 2026-09-22 — WEB-007 all-module explorer completed

- Replaced the modules placeholder with a full M1–M10 explorer backed by canonical `modules.json`, `module_contrasts.json`, enrichment, hubs and external-validation data.
- Added filters for Cultivar×Stage FDR significance, T-004 reproducibility class, year dependence, significant MapMan v3 ORA and external skin evidence, without introducing an artificial aggregate module score.
- Added per-module Stage × Year Cabernet-minus-Pinot contrast matrices, functional summaries, top-hub tables and external-coverage summaries where the underlying evidence exists.
- Preserved interpretation state explicitly: M10 is shown as reproducible under the prespecified T-004 rule without assigning a resolved function, while M2 carries a visible provisional warning pending T-008 because of the documented historical zero-expression/reference-mapping concern.
- Kept the richer dedicated M5 Explorer as the M5 detail route while extending comparable evidence navigation to the remaining biological modules.
- Commit `37e868ad`; CI run `35756864399` passed export/validation/lint/typecheck/build; Pages run `35756864291` deployed successfully.
- WEB-010 Evidence Browser is now the next functional web phase. No scientific result, network, model, annotation or T-008 conclusion changed.

## 2026-09-22 — WEB-005 M5 network and chromosome-16 explorer completed

- Added Cytoscape.js to the M5 Explorer using the frozen beta10 intramodular edge table; no network or centrality values are recalculated in the browser.
- Added top-N controls (15/25/40/60/108), unsigned-adjacency thresholding, kWithin-scaled node size, functional node shapes, gene search, selection inspector, gene navigation and a table fallback for visible edges.
- Added a chr16 locus strip derived from canonical PN40024 T2T v5.1 coordinates for M5 genes carrying the v3 stilbenoid / v5.1 CHS conflict; the view explicitly avoids cultivar-specific expansion/loss claims.
- Preserved interpretation boundaries: unsigned coexpression is not regulatory direction or causality; genomic proximity in a reference genome is not structural evidence for Cabernet versus Pinot.
- Fixed Cytoscape TypeScript style-property units after the first check caught the issue, then split Cytoscape into a lazy-loaded chunk to protect initial page weight.
- Final build: initial JS 292.22 kB (89.96 kB gzip); M5 network chunk 455.37 kB (146.31 kB gzip). CI run `35753270303` and Pages run `35753270081` both passed.
- Implementation commits: `bf0faed`, `4b053b9`, `879a913`. No scientific result, network, annotation or T-008 conclusion changed.

## 2026-09-22 — WEB-009 live T-008 dashboard completed

- Replaced the T-008 placeholder with a live dashboard driven entirely by the frozen 54-run manifest, the versioned batch-progress ledger and per-run QC files.
- Upgraded `t008_progress.json` to schema v2 with PASS/FAIL/IN_PROGRESS/PENDING states, progress percentage, manifest FASTQ bytes/read totals, validated-run mapping summaries and per-run metadata/QC.
- Added the current 2/54 progress view, a 2 cultivar × 3 stage coverage matrix, validated-run cards, a searchable/filterable 54-run ledger, recent event log and per-artifact provenance.
- Added a hard interpretation gate: incomplete run QC cannot be presented as a modern expression matrix, cultivar contrast or module-preservation conclusion. Even 54/54 will only unlock the next processing stage, not an automatic biological conclusion.
- Fixed the design-cell status label so cells with no PASS runs are shown as pending rather than incorrectly labelled QC PASS.
- CI run `35752102720` passed export/validation/lint/typecheck/build and reported `t008=2/54`; Pages run `35752102759` deployed the update successfully.
- Implementation commits: `4ef68dc` + `20983af`. No FASTQ processing, CEMiTool rerun, modern contrast or preservation inference was performed by the web layer.

## 2026-09-22 — WEB-008 external skin validation explorer completed

- Added a dedicated T-007 export layer that enriches the existing primary-hub JSON with canonical module-coverage summaries, source QC and sample-audit summaries while preserving the original two external datasets as separate evidence layers.
- Replaced the validation placeholder with an interactive skin-only evidence page for GSE72421 WW microarray and PRJNA260535 24 °Brix RNA-seq.
- Added module/status/gene filters, top-hub coverage cards, BH corrections for the preselected 37 hubs and 361 priority genes, evaluable/non-evaluable states and a gene-level sign-concordance scatter.
- The scatter uses a clearly labelled descriptive mean of the three canonical baseline Harvest gene effects only as an X-axis display summary. It deliberately omits a y=x line because effect magnitudes are not comparable across the historical baseline, microarray and RNA-seq processed scales.
- Added explicit microarray cross-hybridization and RNA-seq filtering/reference caveats, plus “external source — does not add to N=54” labelling and provenance links.
- CI run `35751143173` passed and reported `external_hubs=74`; Pages run `35751143153` built and deployed the update successfully.
- Commit: `839c7db`. No CEMiTool rerun, external statistical reanalysis, imputation, cross-platform pooling or skin-thickness causal claim was introduced by the web layer.

## 2026-09-22 — WEB-006 functional enrichment explorer completed

- Added a dedicated canonical export for functional enrichment, retaining only tested current terms from MapMan v3, MapMan v5.1 and the corrected T-005A GO analysis.
- Added `/enrichment` with source/module filters, significant-vs-all-tested scope, search, ORA bar view, full term table, annotation coverage/QC, MapMan prespecified themes and M5 cross-version annotation comparison.
- The GO view explicitly uses `results/go_ora_beta10/go_all_terms.tsv` and reports the older T-005 `v5_go_all_terms.tsv` as superseded historical evidence rather than current inference.
- Added GO audit summary fields and coverage warnings to the frontend without recomputing the enrichment analysis.
- CI run `35749918846` passed and validated `11104` exported tested terms; Pages run `35749918954` built and deployed the updated public explorer successfully.
- Commit: `126fead`. No CEMiTool rerun, module reassignment, ORA recalculation or T-008 biological conclusion was introduced by the web layer.

## 2026-09-22 — First GitHub Pages preview successfully deployed

- GitHub Pages was enabled for the repository and deployment run `35748440288` was re-run as attempt 2.
- The full build path passed: canonical export, data validation, dependency install, lint, typecheck, Vite build, Pages configuration and Pages artifact upload.
- The deploy job completed successfully and GitHub reported the public environment URL: `https://jesus-medina.github.io/CEMiTool-Cabernet-y-Pinot/`.
- Added the live explorer link to the root README and moved the roadmap forward to WEB-006 functional enrichment.
- The public preview remains a work in progress rather than the final QA-reviewed release; no scientific result, model, annotation or T-008 conclusion changed.

## 2026-09-22 — GitHub Pages preview deployment prepared; one-time Pages enablement pending

- Added `.github/workflows/deploy-site.yml` using the current GitHub Pages flow: canonical data export/validation, frontend checks/build, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4` and `actions/deploy-pages@v4`.
- Switched the frontend router to `HashRouter` so direct/reloaded internal routes remain compatible with static GitHub Pages hosting.
- Added `.nojekyll` to the published public assets and documented deployment/re-run instructions in `site/README.md`.
- Commit `698192e` passed the scientific data export, validation, lint, typecheck and Vite build. Deployment run `35748440288` then stopped at GitHub Pages configuration because Pages has not yet been enabled for the repository.
- Required one-time owner action: `Settings → Pages → Build and deployment → Source → GitHub Actions`. After that, the existing workflow can be re-run without code changes.
- No scientific result, model, annotation or T-008 conclusion changed.

## 2026-09-22 — WEB-004 interactive M5 Explorer completed

- Added the first full scientific explorer at `/modules/M5`, consuming only generated canonical JSON.
- Added year filtering (All/2012/2013/2014), mean ± SE trajectories, optional biological replicate points, zero reference line, accessible SVG descriptions, a visible-data table and client-side CSV export.
- Added year-specific Harvest Cabernet − Pinot contrasts with confidence intervals and global FDR values from the canonical contrast table.
- Added a searchable 108-gene M5 hub ranking, candidate cards for NAC `VIT_12s0028g00860` and CuAO `VIT_05s0020g03280`, and external-support counts computed from T-007 rows.
- Added a CHS/STS annotation-conflict panel derived from canonical v3/v5.1 conflict flags, preserving ambiguity instead of assigning an unsupported exact enzyme identity.
- Added per-artifact provenance panels for M5 trajectory, hubs and external validation with source/script links, SHA-256 hashes and repository commit.
- Used native responsive SVG for the initial trajectory chart to keep the first preview lightweight; Plotly remains available for later views needing richer zoom/selection.
- GitHub Actions run `35747710946` passed canonical export/validation, lint, typecheck and production build for commit `b940af4`.
- The roadmap now moves to the first GitHub Pages preview before WEB-006 enrichment. No scientific model, table or T-008 conclusion was changed.

## 2026-09-22 — WEB-003 canonical Home and Story completed

- Replaced the scaffold-only landing page with a data-backed Home that loads the 54-sample design, beta10 diagnostics, M5 Cultivar×Stage FDR and T-008 progress from generated canonical JSON rather than hardcoded result values.
- Added a responsive developmental-stage flow generated from metadata, plus explicit “what the evidence shows / does not show” interpretation blocks.
- Added a seven-step Story view covering the operational question, balanced design, primary network, M5 focus, functional interpretation boundaries, external skin validation separation and current T-008 status.
- Added reusable canonical-data loading, error/loading states and numeric formatting helpers; M5 Harvest direction is derived from exported stage-year contrasts.
- GitHub Actions run `35746120112` passed canonical export/validation, lint, typecheck and production build for commit `abeb5e4`.
- WEB-004 (interactive M5 Explorer) is now the next web task. No scientific model, result table or T-008 conclusion was changed.

## 2026-09-22 — WEB-002 canonical site-data layer completed

- Added a standard-library Python export layer that reads canonical metadata/results and generates ten frontend JSON datasets at build time rather than committing stale derived snapshots.
- Added source-schema checks, explicit NA handling, finite-number validation, row-count reconstruction checks and T-008 consistency checks against the 54-run manifest and per-run QC files.
- Added provenance generation with source/script paths, SHA-256 hashes, repository commit and parameters for project summary, modules, M5 trajectory, contrasts, enrichment, hubs, M5 network, external validation and T-008 progress.
- Expanded the site CI workflow so scientific source changes also trigger export, validation, lint, typecheck and production build.
- GitHub Actions run `35745653944` passed all checks and reported: `samples=54; modules=3050; hubs=361; t008=2/54`.
- WEB-003 (Home + Story consuming generated data) is now the next web task. No scientific result or statistical analysis was changed.

## 2026-09-22 — WEB-001 interactive explorer scaffold completed

- Added the initial `site/` frontend using React 19, TypeScript and Vite with the GitHub Pages base path `/CEMiTool-Cabernet-y-Pinot/`.
- Added routed placeholders for Home, Story, modules, module detail, gene detail, external validation, T-008, methods and evidence/provenance, plus a responsive global shell and provisional design tokens.
- Kept WEB-001 intentionally free of scientific result values; canonical data integration remains reserved for WEB-002.
- Added `.github/workflows/site-check.yml`; GitHub Actions run `35745067306` completed dependency installation, lint, typecheck and production build successfully.
- Updated the web implementation plan and T-010 handoff so WEB-002 is now the next task. No scientific analysis, result table, model or T-008 conclusion changed.

## 2026-09-22 — Interactive web explorer implementation plan created

- Added `docs/WEB_EXPLORER_IMPLEMENTATION_PLAN.md` as the step-by-step roadmap for a React/TypeScript/Vite scientific explorer deployed with GitHub Pages.
- Defined the site as three coordinated layers: STORY, EXPLORE and EVIDENCE, with a validated Python export layer between canonical scientific TSVs and frontend JSON.
- Planned the MVP around Home, M5 trajectories/hubs/enrichment, external skin validation, live T-008 status and per-visual provenance; later phases add networks, all-module exploration, QA and final Pages deployment.
- Added T-010 to `docs/TASK_LEDGER.md` and set WEB-001 (web scaffold) as the next implementation step.
- No scientific input, statistical model, CEMiTool result, T-008 result or interpretation was changed.

## 2026-09-22 — T-008 run/reference audit and technical pilot in progress

- Extended T-008 to a conservative full-batch workflow after user authorization: verified a second FASTQ/Salmon run (`SRR5560667`, 19,514,717 reads, 84.94% mapped), resumed a partial ENA download only with HTTP-range and final MD5 checks, added first-10,000-read quality probes, per-run exact compressed archives and a fail-stop progress ledger. The 54-sample assembler is gated on all 54 QC passes. No FASTQ is deleted, no historical input/network changed, and no modern biological conclusion is claimed at 2/54.
- Matched all 54 frozen GSE98923 GSMs through GEO SRX to 54 ENA single-end SRRs, confirming sample characteristics and pinning FASTQ URLs, sizes, MD5 and source metadata hashes. The selected runs total 140.16 GB compressed and 1.625 billion reads; no mass download began.
- Verified official Grapedia PN40024 T2T v5.1 genome, GFF3 and all-variant transcript sources by SHA-256; generated an exact 56,910-transcript-to-47,971-gene map and documented the 1,922/3,050 reciprocal legacy-gene coverage.
- Downloaded one technical pilot FASTQ and verified ENA MD5, gzip integrity, structure and all 12,724,462 records. Salmon 1.12.1 was checksum-verified; two genome-decoy index attempts failed at an unavailable `en_US.UTF-8` locale in WSL, then a user-local locale enabled a complete index with 20 genome decoys. The single-library pilot completed with 56,910 validated transcripts, 88.67% mapping and zero quantification errors; source quantification and QC are preserved. T-008 remains IN PROGRESS; no 54-sample expression matrix or preservation claims yet.
- Tested a second fragment-length prior on the same pilot library. Gene TPM top-100 overlap was 63/100 between 250/25 and 200/80; estimated-count top-100 overlap was 99/100. Documented this material TPM sensitivity and the still-unmeasured fragment-length assumption in D-016; no biological contrast or module preservation claim was made.
- Corrected a T-007 documentation error: GSE98923 berries were grown near Modesto, California, not in Italy, as the GEO sample protocol states.

## 2026-09-21 — Master audit and beginner-to-technical reconstruction

- Added a complete master documentation layer requested as a project-wide audit: project explanation, history, exhaustive canonical file catalog, script catalog, scientific table catalog, data lineage, glossary and evidence matrix.
- Audited the current remote tree (27 canonical scripts; 69 result TSV/CSV tables) and explicitly separated canonical material from preserved `history/local_workspace/` copies.
- Documented pre/post-migration path discrepancies, the superseded T-005 GO output, the current report lag behind T-004–T-007, and the unresolved M5 CHS/STS annotation conflict without changing scientific results.
- No CEMiTool rerun, network change, sample change, T-008 analysis or deletion was performed.

## 2026-09-21 — T-007 external skin-only validation completed

- Archived SHA-pinned GSE72421 matrix/annotation and PRJNA260535 published log2CPM workbook; audited 50 microarray and 84 RNA-seq skin samples without merging either source into the primary 54-sample design.
- Tested the frozen 361 M5/M10/M2 candidates and 37 top-decile hubs across six external conditions, retaining all 2,166 comparison rows, assay coverage, complete-replicate flags, Welch estimates/intervals, BH corrections and source QC. GEO's 6,936 missing cells were not imputed; absent filtered RNA-seq genes remain non-evaluable.
- Found cross-platform expression support for M5 CuAO/NAC and M2 MYB/FAR1 candidates, but limited M10 hub support and sparse RNA-seq coverage of M2. Independently recalculated two RNA-seq 24 °Brix contrasts. Documented family hybridization, reference-mapping, stage and no-skin-thickness-phenotype limits in `docs/T007_SKIN_ONLY_VALIDATION.md`.
- Four non-fatal R locale warnings and one non-fatal openpyxl workbook-extension warning occurred. No CEMiTool rerun, new network or causal claim was made.

## 2026-09-21 — T-006 internal hub prioritization completed

- Ranked all M10 (39) and M2 (214) genes by intramodular beta10 adjacency, retaining 23,532 full edges, MapMan/Pfam/PANTHER evidence, beta7 membership, year-omission sensitivities, descriptive stage-by-year gene differences and zero-rate QC.
- Independently reconstructed `kWithin` from the edges and checked source hashes, gene/annotation grain, network weights and rankings. M10 highlights a bHLH-labelled gene and potassium transporter; M2 highlights MYB/FAR1 candidates but also a material zero-expression/reference-mapping concern and sparse v5.1 coverage.
- Documented why M3/M1 were not elevated to robust candidate modules. Marked T-006 done within its internal scope and T-007 ready; no CEMiTool rerun, external validation or skin-thickness causal claim. Four non-fatal R locale warnings and non-fatal S3-method overwrite messages occurred.

## 2026-09-21 — T-006 M5 hub phase verified

- Calculated a complete 108-gene M5 hub ranking from the frozen beta10 adjacency, preserving all 5,778 within-module edges, source-backed v3/v5.1 functional evidence, QC and leave-year/sample sensitivities.
- Found eight CHS/STS-family-labelled genes among the top 11, alongside CuAO and a NAC transcription-factor candidate; no PAL-labelled gene is in the top 11. Documented the exact v3 stilbenoid versus v5.1 CHS annotation conflict and the chr16 reference interval without assigning unproven enzyme functions or a confirmed family expansion.
- Independently recomputed centrality from the edge table; the M5 profile and three-year Harvest direction persist descriptively after removing the 18 v3 stilbenoid-labelled genes. T-006 remains IN PROGRESS pending other modules; no network rerun, sample exclusion or causal skin claim was made. Four non-fatal R locale warnings occurred.

## 2026-09-21 — Preserve and verify original Grapedia GO source

- Added only the authentic PN40024 T2T v5.1 GO ZIP to the canonical reference
  directory after matching its pinned SHA-256 and inspecting its GMT member.
- Rebuilt and matched all 33.540 prepared gene–term associations against the
  raw GMT and frozen v1→v5.1 mapping; GO ORA results and conclusions did not
  change. No unverified local «Gen ontology» folder was invented or imported.

## 2026-09-21 — T-005A GO ORA and official obsolete-term correction

- Cross-checked every beta10-linked Grapedia GO ID against a SHA-pinned
  official GO ontology, archiving its compressed source and an ID-level audit.
- Found 390 obsolete terms, including 209 missed by the former name-only
  filter; repeated all ten beta10 module ORAs with complete results, QC and
  a row-level comparison to T-005 while preserving the historical files.
- Verified that the six global-FDR GO hits remain in M9 and none emerge in
  the priority modules. Independently recalculated a Fisher test and BH FDR;
  documented sparse GO coverage and the unchanged MapMan conclusions.

## 2026-09-21 — T-005 functional annotation and enrichment completed

- Added a reproducible Grapedia annotation-preparation script with pinned URLs/SHA-256 and explicit reciprocal one-to-one v1→v3/v5.1 gene mapping; kept the 128 MB original crosswalk out of Git while versioning the filtered gene–term inputs and coverage audit.
- Added module-wide hypergeometric ORA for all ten beta10 modules against MapMan v3 (primary), T2T v5.1 MapMan and T2T v5.1 GO (secondary), preserving complete terms, non-tests, BH-FDR results, QC and nine prespecified themes.
- Independently reproduced the M5 stilbenoid enrichment from gene–term pairs with Fisher's exact test and recalculated global BH FDR; documented that MapMan v3 and v5.1 assign overlapping M5 genes different functional labels.
- M10 is seasonally reproducible but has no significant MapMan v3 term at global FDR; no priority module was established as cuticle/skin-specific. T-006 is ready with these cautions; no network or original scientific output was overwritten.

## 2026-09-21 — T-004 year robustness completed

- Added a reproducible full-factorial beta10 analysis using the unchanged 54-sample eigengene table, Type III ANOVA and 90 Stage × Year Cabernet-minus-Pinot contrasts with BH FDR.
- Preserved complete result and diagnostic TSVs, ten module profile plots, explicit priority-module classification and an M5 flagged-sample sensitivity analysis under `results/year_robustness_beta10/`.
- Independently checked all 90 contrast estimates against observed cell-mean differences, recalculated the global BH correction, verified the three-way test with nested models and reviewed all ten plots.
- Documented M10 as reproducible under the prespecified rule, M5/M2/M3/M1 as year-dependent with important stable subpatterns and limitations, in `docs/T004_YEAR_ROBUSTNESS.md`.
- T-005 is now ready to start; no enrichment analysis, network rerun or sample deletion was performed. Four non-fatal R `C.UTF-8` startup warnings occurred.

## 2026-09-21 — T-003 eigengene and model QC reviewed

- Recomputed all ten beta10 module eigengenes and PC1 variance values directly from the archived network object and expression matrix; no CEMiTool network was rerun.
- Refitted the ten additive models and independently reproduced all 30 stage-specific Cabernet-minus-Pinot contrasts and both BH-FDR corrections. Preserved machine-readable module, sample-residual and contrast audit tables.
- Documented residual/influence flags in M2, M3, M5 and M9, the weak additive-model fit of M9, and interpretation distinctions for M1 and M6 in `docs/T003_QC_REVIEW.md`.
- Corrected script 07's obsolete beta10 object path to the canonical layout without changing its statistical method or rerunning it. T-004 remains unstarted.

## 2026-09-21 — T-002 completed: cumulative report regenerated

- Executed `scripts/post/08_update_report_with_module_statistics.R` from the canonical repository root and generated the current HTML, DOCX and PDF reports in `reports/current/`.
- Confirmed `analysis_report_status.tsv` reports `TRUE` for all three formats, validated required post-CEMiTool content in each, and visually reviewed the Word/PDF renderings.
- Archived the pre-update report under `reports/archive/20260921_005059_before_module_statistics/`; intermediate render versions were archived during quality fixes.
- Fixed an R `if`/`else` parse error in script 08 and repaired the report template so its 17 figures are embedded, wide matrices remain linked as machine-readable tables instead of being printed illegibly, and session information stays within page margins.
- The final report records five significant Cultivar × Stage modules (M5, M10, M2, M3, M1), nine significant stage-specific contrasts and Year effects in eight modules, with the required scientific limitations and next planned year-robustness model.
- Non-fatal R startup warnings occurred for the `C.UTF-8` locale; the final render completed without errors. T-003 remains unstarted.

## 2026-09-20 — Report updater adapted after workspace migration

- Audited `scripts/post/08_update_report_with_module_statistics.R` against the new canonical repository structure.
- Fixed stale pre-migration paths for beta comparison inputs, report outputs, archives, templates, and logs.
- Updated `reports/templates/analysis_report.Rmd` to read the canonical beta10 object, tables, parameters and session information.
- T-002 remains pending until Codex executes the updater locally and verifies HTML/DOCX/PDF rendering.

## 2026-09-20 — Complete local workspace migration

- Migrated the complete local CEMiTool workspace into a separate synchronization clone without modifying the original folder.
- Added the two-layer repository model: canonical working folders plus `history/local_workspace/` for the original local folder layout.
- Preserved all six top-level historical folders, including the otherwise empty `TRY BETA 7 WITH INFORM/` directory.
- Promoted the current beta 10 inputs, outputs, reports, manuscript, and supporting scripts into the canonical structure.
- Retained the repository's newer canonical versions of post-processing scripts 06-08; local variants remain in the historical archive.
- Configured Git LFS for nine large R-object paths (seven unique payloads), including four `.RData` workspace images whose scientific uniqueness could not be safely ruled out.
- Established `reports/current/`, `reports/archive/`, and `reports/supplementary/`; promoted the latest beta 10 report to `reports/current/`.
- Added `docs/LOCAL_PROJECT_INVENTORY.md` and `docs/SYNC_POLICY.md`.
- Replaced the previous broad ignore rules with a minimal local-state and temporary-file policy.
- Intentionally excluded only 50 unambiguous R/RStudio local-state files (`.Rhistory` and `.Rproj.user/`) from Git; they remain untouched on local disk and are documented in the inventory.
- No secrets were detected and no scientific file was omitted because of an upload or platform failure.

## 2026-09-20 — Codex handoff and persistent agent context

- Added root `AGENTS.md` with durable repository rules for Codex.
- Added `docs/CURRENT_STATE.md` as the live scientific/operational handoff.
- Added `docs/PROJECT_CONTEXT.md` with the full study context and rationale.
- Added `docs/DECISIONS.md` to record durable methodological decisions.
- Added `docs/TASK_LEDGER.md` with active, blocked and future tasks plus acceptance criteria.
- Added `docs/FUTURE_VISION.md` describing the intended evidence ladder and ChatGPT ↔ Codex workflow.
- Added `docs/CODEX_HANDOFF.md` with the exact local-PC starting procedure.
- The repository is now the shared coordination surface between ChatGPT and Codex; local Codex should pull first, read AGENTS/context files, execute locally, then update the ledger and push results.

## 2026-09-20 — Main report made cumulative

- Added scripts/post/08_update_report_with_module_statistics.R.
- The updater reads the outputs from script 07 and integrates them into the main analysis report.
- The updated report now includes:
  - beta7 vs beta10 robustness when the comparison tables are available;
  - module eigengene methodology;
  - factorial ANOVA results;
  - significant Cultivar x Stage interactions;
  - significant Cabernet vs Pinot contrasts by developmental stage;
  - Year effects;
  - interpretation limits and the next planned Year-robustness analysis.
- Before overwriting reports/analysis_report.html, .docx and .pdf, the previous version is archived under reports/archive_before_module_statistics/<timestamp>/.
- A permanent update log is written so the report history is recoverable.


## 2026-09-19 — Repository initialized and historical work consolidated

### Dataset and design
- GSE98923 established as the primary dataset.
- Balanced 54-sample baseline frozen:
  - Cabernet Sauvignon and Pinot noir
  - FruitSet, Veraison and Harvest
  - 2012, 2013 and 2014
  - 3 biological replicates per cultivar-stage-year cell
- Six CEMiTool classes, 9 samples per class.

### Baseline preprocessing
- Official processed GEO RPKM matrix.
- Transformation: log2(RPKM + 1).
- Pearson correlation.
- Unsigned network / signed TOM.
- CEMiTool filtering enabled (filter_pval = 0.1).
- apply_vst = FALSE.
- min_ngen = 30.
- seed = 1234.

### Beta 7
- Explicit beta 7 reproduction added.
- R² = 0.5495792734.
- 8 biological modules + Not.Correlated.
- 3,050 genes retained after filtering.

### Beta 10
- Explicit beta 10 analysis added.
- R² = 0.7063742471.
- 10 biological modules + Not.Correlated.
- 3,050 genes retained after filtering.

### Robustness
- Added direct gene-membership comparison beta7 vs beta10.
- Most beta7 modules retained ~81–100% of their membership in a corresponding beta10 module, except M6 (~65%).
- Working decision: beta10 primary network; beta7 sensitivity network.

### Next stage
- Added factorial module-statistics script:
  - module eigengenes/PC1
  - model: Eigengene ~ Cultivar * Stage + Year
  - Cabernet vs Pinot contrasts within each developmental stage
  - Benjamini-Hochberg FDR

### Scientific limitations retained
- Original tissue is berry pericarp, not skin-only.
- GSE98923 does not directly measure skin thickness.
- Two-cultivar contrast cannot by itself prove a thick-skin/thin-skin mechanism.
- External skin-only validation remains required.
