# Generated site data

The JSON files in this directory are generated at build time from canonical repository TSVs.

Run:

```bash
cd site
python scripts/export_site_data.py
python scripts/validate_site_data.py
```

Generated JSON is intentionally ignored by Git. It must never be edited by hand. GitHub Actions regenerates and validates it before the frontend build.
