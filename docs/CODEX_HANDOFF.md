# Codex handoff

## Start here

You are working on a grapevine CEMiTool/R project with a long scientific history.

Before doing anything:

1. read `../AGENTS.md`;
2. read `CURRENT_STATE.md`;
3. read `PROJECT_CONTEXT.md`;
4. read `DECISIONS.md`;
5. read `TASK_LEDGER.md`;
6. read `FUTURE_VISION.md`;
7. run `git status`.

## Current operational priority

The immediate local-PC task is **T-001: full workspace synchronization**, unless the user explicitly asks to do another task first.

Do not destroy or reorganize the original local source folder in place.

Original workspace:

`C:/Users/jesus/OneDrive/Documentos/Cata/CEMiTool`

Remote:

`https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot`

The intended sync design is:

- canonical organized working tree in repository root;
- intact local historical copies under `history/local_workspace/`;
- Git LFS for genuinely large/binary scientific artifacts when needed;
- public-repository secret scan;
- no force push.

## After migration

The next scientific actions are already recorded as T-002 through T-004.

Do not skip directly to biological enrichment before reviewing eigengene/model QC and year robustness.

## Completion discipline

At the end of each substantial local task:

- update `TASK_LEDGER.md`;
- update `CURRENT_STATE.md` if state changed;
- update `CHANGELOG.md`;
- commit with a descriptive message;
- push normally;
- report final SHA and unresolved issues.
