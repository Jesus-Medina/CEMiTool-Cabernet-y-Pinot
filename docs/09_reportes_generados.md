# 09 — Reportes y artefactos generados durante el proyecto

Este repositorio prioriza código, tablas pequeñas, logs y documentación histórica. Los reportes binarios se pueden regenerar a partir de los scripts maestros.

## Reportes científicos iniciales

Se generaron versiones en español e inglés del análisis/diseño de Fasoli-GSE98923:

- `Informe_Fasoli_GSE98923_CEMiTool_ES.pdf`
- `Informe_Fasoli_GSE98923_CEMiTool_ES.docx`
- `Fasoli_GSE98923_CEMiTool_Report_EN.pdf`
- `Fasoli_GSE98923_CEMiTool_Report_EN.docx`

## Reportes nativos CEMiTool

Para las corridas se generaron:

- reportes HTML CEMiTool;
- diagnostic reports HTML;
- plots de beta × R²;
- mean connectivity;
- sample tree;
- perfiles de módulos;
- GSEA.

## Workflow maestro completo

Las versiones MASTER generan además:

- `reports/analysis_report.html`
- `reports/analysis_report.docx`
- `reports/analysis_report.pdf`
- `manuscript/article_draft.docx`
- `manuscript/article_draft.pdf`
- manifest de material suplementario;
- checksums MD5;
- logs de parámetros;
- sessionInfo.

## Comparación beta7 vs beta10

También se generó un informe comparativo con figuras de:

- R²;
- tamaño de módulos;
- material de diagnóstico beta7/beta10.

## Política de versionado

Los binarios generados (PDF/DOCX/HTML/ZIP) se excluyen por defecto mediante `.gitignore` para evitar duplicar artefactos reproducibles y hacer crecer innecesariamente el repositorio.

La evidencia que los genera —scripts, parámetros, resultados tabulares y bitácora— sí se conserva. Si se necesita entregar una versión cerrada del informe, se puede adjuntar posteriormente como GitHub Release.
