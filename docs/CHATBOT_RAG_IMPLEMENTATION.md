# RAG chatbot — Gemini File Search

**Status:** implementation scaffold complete; external credentials/deployment pending.

## Goal

Add a question-answering layer to the existing scientific explorer without duplicating scientific values in frontend code and without exposing API credentials.

The chatbot is an explanatory interface over project evidence. It is **not** a new scientific analysis.

## Architecture

```text
site/#/chat
  -> VITE_CHAT_API_URL
  -> Cloudflare Worker
  -> Gemini Interactions API
  -> File Search
  -> curated canonical sources
```

The frontend stays on GitHub Pages. The Gemini API key is stored only as a Worker secret.

## Canonical retrieval set

The repository paths indexed by default are frozen in:

`chatbot/source_manifest.txt`

The manifest prioritizes:
- current project state;
- methodology and glossary;
- T-003 through T-008 documentation;
- canonical module statistics and year-robustness tables;
- functional enrichment;
- hub rankings;
- external skin validation;
- T-008 progress;
- the scripts that produced those layers;
- selected current report/figure assets.

NotebookLM exports may be added as optional extra sources, but they do not supersede canonical repository evidence.

## Scientific response policy

The Worker applies a system instruction that requires the model to:
- answer from retrieved project evidence;
- say when evidence is insufficient;
- prioritize `CURRENT_STATE.md` and `T008_RAW_REPROCESSING.md` for live status;
- preserve the pericarp/skin distinction;
- avoid hub -> regulator claims;
- avoid M5 -> skin-thickness causality;
- preserve CHS/STS annotation uncertainty;
- avoid treating RNA abundance as protein/metabolite/activity;
- keep T-008 explicitly incomplete until current sources say otherwise.

File Search annotations are returned separately to React and rendered as source chips. The UI does not fabricate citations.

## Security

- No Gemini key in React or GitHub Pages.
- `GEMINI_API_KEY` is a Cloudflare Worker secret.
- `GEMINI_FILE_SEARCH_STORE` is also configured at the Worker.
- CORS is restricted to the public Pages origin plus localhost.
- Message and history lengths are bounded.
- Gemini Interactions requests use `store=false`.
- Local secret files and index state are ignored by Git.

This is sufficient for a low-traffic research/demo site. Before high public traffic, add abuse controls such as Cloudflare Turnstile and stronger rate limiting.

## Reproducible indexing

Indexer:

`chatbot/indexer/index_sources.py`

Windows helper:

`chatbot/indexer/INDEXAR_FUENTES_WINDOWS.ps1`

The indexer does not modify source files. For text-like files it creates temporary `.txt` copies only for upload MIME detection, then indexes them into a new Gemini File Search store.

A new store per scientific refresh is preferred over silently appending to an old store. After validation, update the Worker's store secret.

## Web integration

Frontend:
- `site/src/ChatPage.tsx`
- route `#/chat`
- navigation item `Chat`
- Home portal card

Production endpoint is injected at build time from the GitHub Actions repository variable:

`VITE_CHAT_API_URL`

If the variable is absent, the site still builds and the chat page shows a configuration warning instead of exposing a broken form.

## Deployment gate

The feature is not operational until all of these are true:

- [x] frontend route implemented;
- [x] Worker proxy implemented;
- [x] File Search indexer implemented;
- [x] canonical source manifest implemented;
- [x] scientific guardrails implemented;
- [ ] Gemini API key created by project owner;
- [ ] File Search store indexed;
- [ ] Worker deployed;
- [ ] `VITE_CHAT_API_URL` configured in GitHub;
- [ ] end-to-end questions checked against source files;
- [ ] public abuse/rate behavior reviewed.

## Acceptance checks

Minimum manual questions:
1. “¿Qué es M5 y cuál es la formulación correcta del hallazgo en Harvest?”
2. “¿Por qué beta=10 es principal y beta=7 sensibilidad?”
3. “¿NAC regula directamente CHS/STS?”
4. “¿Los datasets de piel aumentan N=54?”
5. “¿T-008 ya confirmó M5?”
6. “¿Dónde está el script de robustez por año?”
7. “¿Qué evidencia respalda CuAO y NAC en piel?”

A passing assistant should answer from indexed evidence, expose retrieved source filenames, and preserve all interpretation boundaries.
