# CEMiTool Cabernet–Pinot Interactive Explorer — Plan de implementación

**Estado general:** EN IMPLEMENTACIÓN  
**Inicio:** 2026-09-22  
**Repositorio:** `Jesus-Medina/CEMiTool-Cabernet-y-Pinot`  
**Objetivo:** convertir el proyecto en un sitio web científico, interactivo, auditable y desplegado en GitHub Pages, sin reemplazar ni alterar el pipeline científico original.

---

## 0. Propósito de este documento

Este archivo es la hoja de ruta operativa del sitio web. Debe actualizarse a medida que se implementen etapas, se validen criterios de aceptación o cambien decisiones de diseño.

La regla es simple:

- no implementar “por intuición” si la fuente de datos o el criterio ya está documentado;
- no duplicar resultados manualmente cuando pueden derivarse de tablas canónicas;
- no modificar análisis científicos para adaptarlos a la web;
- no marcar una etapa como completada sin comprobar sus criterios de aceptación;
- mantener la web como **capa de visualización y navegación**, no como un nuevo pipeline de inferencia.

La web debe funcionar como:

1. **paper interactivo**, para entender la historia científica;
2. **dashboard exploratorio**, para navegar módulos, genes y validaciones;
3. **visor de evidencia**, para llegar desde una figura al TSV, script y versión que la generó.

---

# 1. Visión del producto

Nombre de trabajo:

## CEMiTool Cabernet–Pinot Explorer

Propuesta de URL:

`https://jesus-medina.github.io/CEMiTool-Cabernet-y-Pinot/`

La web tendrá tres capas conceptuales:

### STORY

Para una persona que quiere entender qué se investigó, por qué se hizo y cuál es la evidencia principal.

### EXPLORE

Para explorar módulos, trayectorias, genes, hubs, enriquecimiento, validaciones externas y progreso T-008.

### EVIDENCE

Para auditar de dónde sale cada afirmación: tabla, script, input y commit.

---

# 2. Principios científicos que la web no puede romper

Estos invariantes deben reflejarse tanto en el contenido como en la interfaz:

- GSE98923 corresponde a pericarpio, no a piel aislada.
- GSE98923 no mide directamente grosor de piel.
- La red principal es beta=10; beta=7 es sensibilidad.
- Los nombres M1, M2, etc. son etiquetas específicas de corrida.
- Los eigengenes resumen módulos; no son genes reales ni fold-changes.
- Un hub no es automáticamente un regulador causal.
- Una diferencia de eigengene no demuestra “represión”.
- RNA no implica directamente proteína o actividad enzimática.
- La familia CHS/STS presenta conflicto de anotación y no debe simplificarse artificialmente.
- M2 sigue siendo provisional hasta que T-008 permita reevaluarlo.
- La validación externa en piel es observacional y no se mezcla con las 54 muestras del baseline.
- Mientras T-008 esté incompleto, la web debe mostrar explícitamente que no existe todavía una conclusión moderna de preservación.

La web debe incluir bloques visibles de **“Qué muestra la evidencia”** y **“Qué NO demuestra”** en resultados sensibles.

---

# 3. Arquitectura técnica propuesta

## 3.1 Stack

- **Frontend:** React + TypeScript + Vite
- **Routing:** React Router
- **Gráficos:** Plotly.js
- **Redes:** Cytoscape.js
- **Tablas:** TanStack Table o componente equivalente
- **Estilos:** CSS variables + CSS Modules o Tailwind solo si no complica la trazabilidad visual
- **Conversión de datos:** Python
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions
- **Backend:** ninguno

La web será estática. No debe ejecutar CEMiTool ni recalcular modelos científicos en el navegador.

## 3.2 Flujo de datos

```text
R / Python analysis
        ↓
canonical results/*.tsv
        ↓
site/scripts/export_site_data.py
        ↓
validated JSON / compact TSV
        ↓
site/public/data/
        ↓
React components
        ↓
GitHub Pages
```

## 3.3 Regla de fuente única

La web nunca debe contener a mano un número que ya existe en una tabla canónica, salvo textos narrativos claramente etiquetados.

Siempre que sea posible:

`resultado científico → archivo canónico → exportador → JSON → gráfico`

---

# 4. Estructura propuesta del repositorio

```text
site/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   ├── pages/
│   │   ├── Home/
│   │   ├── Story/
│   │   ├── Modules/
│   │   ├── ModuleDetail/
│   │   ├── Genes/
│   │   ├── Validation/
│   │   ├── T008/
│   │   ├── Methods/
│   │   └── Evidence/
│   ├── components/
│   ├── charts/
│   ├── network/
│   ├── tables/
│   ├── data/
│   ├── types/
│   └── styles/
├── scripts/
│   ├── export_site_data.py
│   ├── validate_site_data.py
│   └── build_provenance_manifest.py
├── public/
│   ├── data/
│   └── assets/
└── tests/
    ├── data/
    └── ui/

.github/
└── workflows/
    └── deploy-site.yml
```

No mover ni renombrar resultados científicos existentes para acomodar esta estructura.

---

# 5. Mapa del sitio

## / — Inicio

Objetivo: explicar el estudio en menos de un minuto.

Contenido:

- título completo del proyecto;
- autora: Catalina Constanza Marchant Hurtado;
- resumen visual del diseño;
- tarjetas:
  - 54 muestras;
  - beta=10;
  - M5 como foco principal;
  - estado actual de T-008;
- diagrama FruitSet → Veraison → Harvest;
- bloque “hallazgo principal”;
- bloque “limitaciones esenciales”;
- accesos a STORY, EXPLORE y EVIDENCE.

## /story — Historia científica

Narrativa por etapas:

1. pregunta científica;
2. diseño de 54 muestras;
3. CEMiTool;
4. beta=10 vs beta=7;
5. módulos;
6. robustez anual;
7. M5;
8. enriquecimiento;
9. hubs;
10. piel aislada;
11. T-008;
12. conclusiones y límites.

Debe leerse como un paper visual, no como un README técnico.

## /modules — Explorador de módulos

Tabla y resumen de M1–M10:

- tamaño;
- FDR Cultivar×Stage;
- clasificación de robustez;
- enriquecimientos;
- número de hubs destacados;
- estado interpretativo.

Filtros:

- interacción significativa;
- reproducible;
- year-dependent;
- enriquecimiento significativo;
- con validación externa.

## /modules/:module — Detalle de módulo

Para M5, M10 y M2 habrá vistas ricas.

Elementos:

- resumen;
- trayectoria por etapa;
- selector 2012 / 2013 / 2014 / todos;
- promedio ± SE;
- opción de mostrar réplicas individuales;
- contrastes;
- ranking de genes;
- enriquecimientos;
- red;
- evidencia externa;
- provenance.

M5 recibirá prioridad de diseño.

## /genes/:geneId — Ficha de gen

Mostrar cuando la evidencia exista:

- ID VIT_;
- módulo;
- rango kWithin;
- kWithin;
- kME;
- anotación v3;
- anotación v5.1;
- conflicto de anotación cuando corresponda;
- efecto baseline;
- evidencia GSE72421;
- evidencia PRJNA260535;
- cromosoma/posición si está disponible;
- enlaces internos a tablas/scripts de evidencia.

Nunca inventar una anotación ausente.

## /validation — Validación externa

Separar claramente:

### GSE72421
- plataforma: microarray;
- piel;
- condición principal;
- limitación de hibridación cruzada.

### PRJNA260535
- plataforma: RNA-seq;
- piel;
- 24 °Brix como condición principal;
- cobertura y multimapping.

Componentes:

- scatter baseline vs piel;
- filtros por módulo/gen;
- FDR;
- dirección concordante/no concordante;
- evaluable/no evaluable.

## /t008 — Reprocesamiento moderno

Dashboard dinámico desde archivos canónicos.

Mostrar:

- corridas totales;
- corridas PASS;
- descarga;
- MD5;
- FASTQ QC;
- Salmon;
- mapping rate;
- fallos;
- progreso global;
- advertencia visible mientras no exista 54/54.

Fuente principal prevista:

`results/fastq_reprocessing_t008/t008_batch_progress.tsv`

Cuando T-008 termine, esta página debe evolucionar a comparación histórico vs moderno sin borrar el historial del progreso.

## /methods — Métodos

Explicar:

- selección de 54 muestras;
- log2(RPKM+1);
- CEMiTool;
- Pearson;
- unsigned network;
- signed TOM;
- beta;
- PCA/eigengene;
- ANOVA tipo III;
- BH FDR;
- ORA;
- kWithin;
- validación externa;
- T-008.

Debe permitir abrir el script exacto asociado.

## /evidence — Evidencia y trazabilidad

Buscador de afirmaciones/resultados.

Ejemplo:

**M5 Harvest reproducido en tres años**

→ tabla  
→ script  
→ input  
→ commit  
→ descarga del dato usado

También debe mostrar:

- commit del sitio;
- commit científico del dataset exportado;
- fecha de generación;
- checksums del bundle web cuando sea práctico.

---

# 6. Componentes visuales principales

## 6.1 M5 trajectory chart

Fuente:

- `results/year_robustness_beta10/cell_profiles.tsv`
- `results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv`

Interacción:

- año;
- cultivar;
- mostrar/ocultar réplicas;
- tooltip con media, SE, n;
- línea cero;
- modo “comparar años”.

## 6.2 Module summary matrix

Cruzar:

- módulo;
- tamaño;
- FDR;
- robustez;
- ORA;
- hubs;
- validación externa.

No crear una “puntuación total” científica que no exista en el análisis.

## 6.3 Hub ranking

Fuente:

- `results/hub_prioritization_beta10/m5_full_hub_ranking.tsv`
- `results/hub_prioritization_beta10/m10_m2_full_hub_ranking.tsv`

Interacción:

- ordenar por kWithin;
- buscar gen;
- filtrar por anotación;
- abrir ficha.

## 6.4 Coexpression network

Cytoscape.js.

Primera versión:

- M5;
- top N genes configurable;
- filtro de edge weight;
- tamaño = kWithin;
- tooltip = ID + anotación + kWithin.

No cargar por defecto redes gigantes completas si perjudican el navegador.

## 6.5 Functional enrichment

Fuentes:

- `results/functional_enrichment_beta10/v3_mapman_global_FDR05_hits.tsv`
- `results/functional_enrichment_beta10/v3_mapman_all_terms.tsv`
- `results/functional_enrichment_beta10/v3_mapman_prespecified_themes.tsv`
- tablas equivalentes v5.1;
- `results/go_ora_beta10/`

Interacción:

- MapMan v3 / v5.1 / GO;
- significativo / todos;
- módulo;
- tema preespecificado;
- tooltip con k, K fondo, fold y FDR.

Debe hacer visible la cobertura de anotación.

## 6.6 CHS/STS annotation conflict panel

Componente específico para explicar:

- misma familia;
- labels distintas entre versiones;
- límites para asignar enzima exacta;
- genes afectados.

Esto es una característica científica, no un “error” a ocultar.

## 6.7 Chromosome 16 view

Primera versión sencilla, tipo locus strip:

- posición genómica;
- genes CHS/STS-like;
- hover;
- enlace a ficha de gen.

Evitar inferir expansión específica de Pinot o pérdida en Cabernet.

## 6.8 External validation scatter

Fuente:

`results/external_skin_validation_beta10/primary_external_condition_hubs.tsv`

Interacción:

- módulo;
- dataset;
- FDR;
- hubs/todos;
- concordancia direccional;
- click en gen.

## 6.9 T-008 progress board

Fuente:

`results/fastq_reprocessing_t008/t008_batch_progress.tsv`

Mostrar:

- progreso global;
- tabla por SRR;
- mapping;
- estado;
- último checkpoint.

El sitio debe poder reconstruirse sin editar manualmente el progreso.

---

# 7. Sistema de provenance

Cada visualización científica importante tendrá un botón:

## ⓘ Provenance

Debe abrir un panel como:

```text
RESULT
results/year_robustness_beta10/
cabernet_vs_pinot_by_stage_year.tsv

GENERATED BY
scripts/post/09_year_robustness_beta10.R

INPUT
module eigengenes + metadata

NETWORK
beta = 10

SITE DATASET GENERATED FROM
<git commit>

VIEW SOURCE
<GitHub link>
```

Para soportarlo se generará:

`site/public/data/provenance.json`

Esquema inicial:

```json
{
  "artifact_id": "m5_year_trajectory",
  "sources": [],
  "scripts": [],
  "parameters": {},
  "scientific_commit": "",
  "generated_at": ""
}
```

---

# 8. Exportador de datos

Archivo:

`site/scripts/export_site_data.py`

Responsabilidades:

- leer solo rutas canónicas;
- fallar si falta una fuente obligatoria;
- validar columnas esperadas;
- no imputar valores;
- preservar NA de forma explícita;
- producir archivos compactos para frontend;
- generar manifest;
- registrar commit científico;
- guardar hashes SHA-256 de inputs usados.

Primera salida prevista:

```text
site/public/data/
├── project_summary.json
├── modules.json
├── m5_trajectory.json
├── module_contrasts.json
├── enrichments.json
├── hubs.json
├── m5_network.json
├── external_validation.json
├── t008_progress.json
└── provenance.json
```

---

# 9. Diseño visual

La interfaz debe conservar una sola identidad visual coherente con la presentación del proyecto.

Dirección:

- fondo claro;
- Cabernet: tono vino/burdeos;
- Pinot: rosado/púrpura;
- metodología/QC: neutros fríos;
- advertencias: contraste alto y discreto;
- gráficos científicos prioritariamente legibles antes que decorativos.

Antes de fijar HEX definitivos, extraer y congelar la paleta exacta de la presentación aprobada.

Variables previstas:

```css
--cabernet;
--pinot;
--ink;
--muted;
--surface;
--surface-alt;
--border;
--warning;
--success;
```

Reglas:

- no usar color como único canal de significado;
- mantener contraste WCAG;
- leyendas explícitas;
- tipografía legible;
- responsive desde móvil a desktop;
- evitar animaciones que distorsionen lectura científica.

---

# 10. GitHub Pages y CI/CD

Workflow:

`.github/workflows/deploy-site.yml`

En cada push relevante:

1. checkout;
2. instalar Python;
3. ejecutar validación/exportador;
4. instalar Node;
5. ejecutar tests;
6. `npm run build`;
7. publicar `site/dist/` en GitHub Pages.

El deployment debe detenerse si:

- falta una fuente canónica requerida;
- falla la validación de datos;
- falla TypeScript;
- falla el build;
- falla un test crítico.

No bloquear el sitio porque T-008 esté incompleto: debe mostrar correctamente el estado incompleto.

---

# 11. Rendimiento y tamaño

No enviar al navegador matrices completas innecesarias.

Reglas iniciales:

- tablas grandes se filtran/exportan;
- redes se limitan por módulo/edge threshold;
- M1 no se renderiza completo por defecto;
- cargar páginas pesadas de forma lazy;
- comprimir JSON;
- usar SVG/Canvas según corresponda;
- no copiar objetos RDS al sitio.

Objetivo inicial:

- Home < 1 MB de datos propios;
- carga inicial usable < 3 s en conexión normal;
- red M5 interactiva sin congelamiento visible.

---

# 12. Accesibilidad y reproducibilidad

La web debe ser usable sin depender exclusivamente de hover.

Requisitos:

- teclado;
- etiquetas ARIA donde corresponda;
- tablas disponibles detrás de gráficos;
- textos alternativos;
- tooltips también accesibles por foco;
- números copiables;
- link al TSV fuente;
- versión visible del sitio.

Cada gráfico principal debe tener opción:

**Ver datos**

y, cuando sea razonable:

**Descargar datos mostrados**

sin modificar el archivo científico original.

---

# 13. Roadmap de implementación

## Fase WEB-000 — Planificación y contrato científico

- [x] Crear este plan.
- [x] Definir que la web es capa de visualización, no análisis.
- [x] Definir arquitectura estática GitHub Pages.
- [ ] Congelar paleta visual exacta.
- [ ] Revisar qué material ya público puede exponerse directamente.
- [ ] Definir versión inicial del esquema de provenance.

**Aceptación:** arquitectura y límites científicos acordados antes de crear gráficos.

---

## Fase WEB-001 — Scaffold

- [x] Crear `site/`.
- [x] Inicializar React + TypeScript + Vite.
- [x] Configurar base path para GitHub Pages.
- [x] Añadir router.
- [x] Crear layout global.
- [x] Añadir variables visuales.
- [x] Crear páginas placeholder.
- [x] Añadir lint/typecheck/build.

**Aceptación:** `npm run build` genera sitio estático sin errores.

**Verificación 2026-09-22:** GitHub Actions `Site scaffold checks`, run `35745067306`, completó instalación, lint, typecheck y build con resultado `success`. Scaffold principal: commit `f0c0c38`.

---

## Fase WEB-002 — Exportador canónico

- [x] Crear `export_site_data.py`.
- [x] Implementar validación de fuentes.
- [x] Generar `project_summary.json`.
- [x] Generar `modules.json`.
- [x] Generar `m5_trajectory.json`.
- [x] Generar `hubs.json`.
- [x] Generar `external_validation.json`.
- [x] Generar `t008_progress.json`.
- [x] Generar `provenance.json`.
- [x] Registrar SHA-256 de inputs.
- [x] Tests de row counts/columnas/NA.

**Aceptación:** los JSON se reconstruyen automáticamente desde resultados canónicos sin edición manual.

**Verificación 2026-09-22:** commit `1cad93d`. GitHub Actions run `35745653944` generó 10 archivos JSON en build-time y validó `samples=54`, `modules=3050` genes, `hubs=361` y `T-008=2/54`. Export, validation, lint, typecheck y build finalizaron con `success`. Los JSON generados están ignorados por Git y siempre se reconstruyen desde fuentes canónicas para evitar datos web obsoletos.

---

## Fase WEB-003 — Home + Story

- [x] Home.
- [x] tarjetas 54 / beta10 / M5 / T-008;
- [x] flujo FruitSet→Veraison→Harvest;
- [x] resumen de M5;
- [x] límites científicos;
- [x] Story completa;
- [x] navegación móvil.

**Aceptación:** alguien ajeno al repo puede entender la pregunta, diseño, resultado principal y límites sin abrir GitHub.

**Verificación 2026-09-22:** commit `abeb5e4`. Home y Story consumen `project_summary.json`, `modules.json` y `m5_trajectory.json`; las tarjetas y el estado T-008 se derivan de datos canónicos. La Story mantiene explícitas las fronteras pericarpio/piel, hub/causalidad y T-008 incompleto. GitHub Actions run `35746120112` completó export, validation, lint, typecheck y build con `success`.

---

## Fase WEB-004 — M5 Explorer

- [x] trayectoria 2012;
- [x] trayectoria 2013;
- [x] trayectoria 2014;
- [x] modo todos;
- [x] réplicas individuales;
- [x] contraste Harvest;
- [x] tabla de hubs;
- [x] ficha NAC;
- [x] ficha CuAO;
- [x] panel CHS/STS;
- [x] provenance.

**Aceptación:** las cifras coinciden con tablas canónicas y los filtros no alteran los datos subyacentes.

**Verificación 2026-09-22:** commit `b940af4`. El explorador M5 consume `m5_trajectory.json`, `hubs.json`, `external_validation.json` y `provenance.json`. Incluye selector Todos/2012/2013/2014, medias ± SE, réplicas opcionales, tabla descargable de datos mostrados, contrastes Harvest, ranking buscable de 108 hubs, tarjetas NAC/CuAO, panel de conflicto CHS/STS derivado de flags canónicos y enlaces de provenance a fuente/script/hash/commit. GitHub Actions run `35747710946` pasó exportación, validación, lint, typecheck y build.

**Decisión de implementación:** la primera gráfica M5 usa SVG nativo accesible y responsive para mantener el bundle pequeño; Plotly.js queda reservado para vistas donde zoom/selección compleja aporte valor científico.

---

## Fase WEB-005 — Network + chromosome

- [ ] Cytoscape M5;
- [ ] top N;
- [ ] threshold;
- [ ] tamaño por kWithin;
- [ ] labels;
- [ ] navegación a genes;
- [ ] vista chr16.

**Aceptación:** la red es usable y no implica causalidad o dirección regulatoria inexistente.

---

## Fase WEB-006 — Functional enrichment

- [x] barras ORA;
- [x] vista MapMan v3;
- [x] vista MapMan v5.1;
- [x] vista GO auditado;
- [x] temas preespecificados;
- [x] cobertura;
- [x] conflicto CHS/STS.

**Aceptación:** un usuario puede distinguir claramente enriquecimiento, cobertura y conflicto de anotación.

**Verificación 2026-09-22:** commit `126fead`. Se añadió `functional_enrichment.json` generado desde tablas canónicas vigentes y un explorador en `/enrichment` con selector de fuente, módulo, FDR significativo/todos los tests, búsqueda, barras ORA, cobertura, warnings, temas MapMan, auditoría GO T-005A y comparación M5 v3/v5.1. El exportador excluye la tabla GO histórica de la inferencia actual y usa `results/go_ora_beta10/go_all_terms.tsv`. CI run `35749918846` pasó export, validación, lint, typecheck y build; validó 11.104 términos testados. GitHub Pages run `35749918954` desplegó la actualización con éxito.

---

## Fase WEB-007 — Module Explorer

- [ ] tabla M1–M10;
- [ ] filtros;
- [ ] M10;
- [ ] M2 con advertencia provisional;
- [ ] rutas a resultados;
- [ ] robustez anual.

**Aceptación:** no se reduce el análisis a M5 y se preserva el estado interpretativo real de cada módulo.

---

## Fase WEB-008 — External Validation

- [x] GSE72421;
- [x] PRJNA260535;
- [x] scatter;
- [x] FDR;
- [x] cobertura;
- [x] concordancia;
- [x] evaluable/no evaluable;
- [x] límites de plataforma.

**Aceptación:** queda visualmente imposible confundir validación externa con réplicas del baseline.

**Verificación 2026-09-22:** commit `839c7db`. La ruta `/validation` separa explícitamente GSE72421 y PRJNA260535 como fuentes externas skin-only y las etiqueta como evidencia que no aumenta el N=54 del baseline. El scatter usa como eje X una media descriptiva —claramente etiquetada— de los tres efectos gene-level Harvest 2012/2013/2014 y como eje Y el efecto externo; no dibuja línea y=x ni equipara magnitudes entre plataformas. Incluye filtros por módulo/estado/gen, BH top-37 y BH361, cobertura/evaluable, concordancia, límites de microarray/RNA-seq, conexión a T-008 y provenance. CI run `35751143173` pasó exportación, validación, lint, typecheck y build; validó `external_hubs=74`. GitHub Pages run `35751143153` desplegó con éxito.

---

## Fase WEB-009 — T-008 live status

- [ ] progreso dinámico;
- [ ] tabla SRR;
- [ ] QC;
- [ ] mapping;
- [ ] estados PASS/FAIL/PENDING;
- [ ] advertencia 54/54;
- [ ] preparado para comparación histórico/moderno futura.

**Aceptación:** actualizar `t008_batch_progress.tsv` y redeployar actualiza la página sin editar React.

---

## Fase WEB-010 — Evidence browser

- [ ] provenance global;
- [ ] provenance por gráfico;
- [ ] links a GitHub;
- [ ] links a scripts;
- [ ] links a TSV;
- [ ] commit científico;
- [ ] fecha de exportación;
- [ ] buscador de evidencias.

**Aceptación:** para cada hallazgo principal puede identificarse tabla + script + commit.

---

## Fase WEB-011 — QA

- [ ] validación científica de cifras;
- [ ] pruebas de filtros;
- [ ] responsive;
- [ ] Chrome;
- [ ] Firefox;
- [ ] móvil;
- [ ] accesibilidad básica;
- [ ] broken links;
- [ ] performance;
- [ ] build reproducible.

**Aceptación:** checklist firmado antes de publicar.

---

## Fase WEB-012 — GitHub Pages

- [ ] workflow;
- [ ] permisos Pages;
- [ ] deployment preview;
- [ ] deployment final;
- [ ] URL en README;
- [ ] versión inicial etiquetada.

**Aceptación:** sitio público estable, reconstruible desde el repo y sin secretos.

---

# 14. Orden recomendado para no perdernos

No intentar construir todo a la vez.

Secuencia concreta:

1. WEB-001 Scaffold.
2. WEB-002 Exportador.
3. WEB-003 Home.
4. WEB-004 M5 Explorer.
5. Publicar primera preview.
6. WEB-006 Enrichment.
7. WEB-008 Validation.
8. WEB-009 T-008.
9. WEB-005 Network.
10. WEB-007 resto de módulos.
11. WEB-010 Evidence.
12. WEB-011 QA.
13. WEB-012 release pública estable.

La primera versión útil no necesita todos los módulos.

## MVP

Debe contener solamente:

- Home;
- Story corta;
- M5 trajectory;
- M5 hubs;
- enriquecimiento M5;
- validación externa M5;
- T-008 status;
- provenance básico.

Eso ya produce un sitio científicamente útil.

---

# 15. Datos canónicos prioritarios para el MVP

| Función web | Fuente canónica |
|---|---|
| Diseño | `data/metadata/samples.tsv` |
| Módulos | `results/beta10/tables/module.tsv` |
| Beta | `results/beta10/tables/beta_fit_indices.tsv` |
| Factorial | `results/module_statistics_beta10/module_factorial_ANOVA_typeIII.tsv` |
| Eigengenes | `results/module_statistics_beta10/module_eigengenes_with_metadata_54.tsv` |
| Robustez | `results/year_robustness_beta10/cell_profiles.tsv` |
| Contrastes año | `results/year_robustness_beta10/cabernet_vs_pinot_by_stage_year.tsv` |
| ORA | `results/functional_enrichment_beta10/v3_mapman_global_FDR05_hits.tsv` |
| Hubs M5 | `results/hub_prioritization_beta10/m5_full_hub_ranking.tsv` |
| Red M5 | `results/hub_prioritization_beta10/m5_all_intramodular_edges.tsv` |
| Validación | `results/external_skin_validation_beta10/primary_external_condition_hubs.tsv` |
| T-008 | `results/fastq_reprocessing_t008/t008_batch_progress.tsv` |

Antes de programar un componente, comprobar las columnas reales de su archivo.

---

# 16. Política de actualización

Cuando cambie un resultado científico validado:

1. actualizar resultados canónicos;
2. actualizar documentación científica correspondiente;
3. correr exportador web;
4. correr tests;
5. revisar diff de JSON generado;
6. desplegar;
7. registrar en CHANGELOG.

No editar el JSON generado a mano.

Para cambios puramente visuales:

- no regenerar datos si no es necesario;
- no tocar tablas científicas;
- revisar que los números sigan viniendo del exportador.

---

# 17. Versionado del sitio

Propuesta:

- `web-v0.1` = Home + M5 MVP;
- `web-v0.2` = enrichment + validation;
- `web-v0.3` = T-008 + evidence;
- `web-v0.4` = module explorer + network;
- `web-v1.0` = versión pública estable y auditada.

El versionado web no reemplaza versiones científicas.

---

# 18. Definición de “DONE”

El sitio completo solo se considera DONE cuando:

- se construye desde cero con instrucciones documentadas;
- lee fuentes canónicas;
- no duplica manualmente cifras críticas;
- cada gráfico principal tiene provenance;
- los límites científicos son visibles;
- M5, validación externa y T-008 funcionan;
- GitHub Actions valida y despliega;
- GitHub Pages está activo;
- README apunta al sitio;
- QA científico y visual está completado.

---

# 19. Próximo paso exacto

## Próxima tarea: WEB-009 — T-008 live status

La validación externa T-007 ya está publicada. El siguiente paso es convertir el ledger de reprocesamiento FASTQ en un tablero vivo que se actualice sin editar React.

Debe leer el estado canónico de T-008 y mostrar:

- progreso global 2/54 → 54/54 cuando corresponda;
- PASS / FAIL / IN PROGRESS / PENDING;
- etapas del pipeline por SRR;
- mapping rate y QC disponibles;
- último checkpoint;
- una advertencia inequívoca mientras no exista matriz moderna completa;
- espacio preparado para la futura comparación histórico vs moderno sin borrar el historial.

---

# 20. Registro de progreso

| Fase | Estado | Fecha | Nota |
|---|---|---|---|
| WEB-000 | IN PROGRESS | 2026-09-22 | Plan creado; falta congelar paleta y provenance schema |
| WEB-001 | DONE | 2026-09-22 | Scaffold + routing + CI; lint/typecheck/build PASS |
| WEB-002 | DONE | 2026-09-22 | Exportador + validator + provenance; CI PASS (run 35745653944) |
| WEB-003 | DONE | 2026-09-22 | Home + Story conectadas a JSON canónico; CI PASS (run 35746120112) |
| WEB-004 | DONE | 2026-09-22 | M5 Explorer interactivo + hubs + CHS/STS + provenance; CI PASS (run 35747710946) |
| WEB-005 | TODO | — | Después de preview/enrichment |
| WEB-006 | DONE | 2026-09-22 | MapMan v3/v5.1 + GO T-005A + temas/cobertura; CI/deploy PASS |
| WEB-007 | TODO | — | — |
| WEB-008 | DONE | 2026-09-22 | T-007 skin-only explorer; CI/deploy PASS |
| WEB-009 | TODO | — | Próxima |
| WEB-010 | TODO | — | — |
| WEB-011 | TODO | — | — |
| WEB-012 | IN PROGRESS | 2026-09-22 | Preview pública desplegada; release estable queda para después de QA final |

Este cuadro debe actualizarse en cada sesión de implementación para evitar perder el estado del trabajo.
