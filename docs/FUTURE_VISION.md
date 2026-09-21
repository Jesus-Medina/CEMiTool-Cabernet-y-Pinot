# Future vision

## What we are building

This repository should become a complete, auditable research project rather than a collection of R scripts.

A future reader should be able to answer:

- What biological question was asked?
- Which exact samples were used?
- Why were they selected?
- What preprocessing was used?
- Why beta10?
- How stable was the network to beta?
- Which modules differed by cultivar and developmental stage?
- Were those effects reproducible across years?
- What functions and hub genes were implicated?
- Did the signal replicate in skin-only data?
- Did modern FASTQ reprocessing preserve the result?
- What limitations remain?

## Desired evidence ladder

### Layer 1 — Reproducible input/design
Exact 54-sample selection and metadata.

### Layer 2 — Network construction
CEMiTool beta10 with archived diagnostics.

### Layer 3 — Network sensitivity
Beta7 comparison.

### Layer 4 — Factorial module statistics
Cultivar, Stage, Year, Cultivar × Stage.

### Layer 5 — Seasonal robustness
Cultivar × Stage × Year and Stage × Year contrasts.

### Layer 6 — Biological meaning
Functional annotation/enrichment.

### Layer 7 — Candidate genes
Hub/centrality plus pathway context.

### Layer 8 — Tissue validation
Skin-only independent datasets.

### Layer 9 — Processing robustness
Modern FASTQ reanalysis/current annotation.

### Layer 10 — Integrated interpretation
Report/manuscript with calibrated claims.

## Repository vision

The root should remain usable for active work.

Historical states should remain accessible rather than being overwritten.

Target concept:

```
repo/
├── AGENTS.md
├── README.md
├── CHANGELOG.md
├── scripts/
├── data/
├── results/
├── reports/
│   ├── current/
│   └── archive/
├── manuscript/
├── docs/
└── history/
    └── local_workspace/
```

## ChatGPT ↔ Codex collaboration model

There is no assumption of a hidden live conversation between ChatGPT and a local Codex session.

The **repository is the shared memory/coordination surface**.

ChatGPT can:

- update repository context and planning documents;
- create/edit scripts through GitHub;
- review pushed results;
- update scientific documentation.

Codex running on the user's PC can:

- read `AGENTS.md` automatically;
- read local files and the detailed context documents;
- execute R/scripts locally;
- inspect outputs that have not yet been pushed;
- sync completed work to GitHub.

The handoff protocol is:

```
ChatGPT updates repo context/tasks
        ↓
user/Codex git pull
        ↓
Codex executes locally
        ↓
Codex updates ledger + commits + pushes
        ↓
ChatGPT reviews GitHub
        ↓
next task
```

## Principle

Do not optimize for maximum automation if it weakens scientific auditability.

Automation should make evidence easier to reproduce, inspect and challenge.
