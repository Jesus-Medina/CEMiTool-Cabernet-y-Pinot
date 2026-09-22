import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  loadExternalValidation,
  loadHubs,
  loadModuleContrasts,
  loadModules,
  type ExternalValidationPayload,
  type HubsPayload,
  type ModuleContrast,
  type ModuleSummary,
  type ModulesPayload,
} from './data/siteData'
import {
  loadFunctionalEnrichment,
  type FunctionalEnrichmentPayload,
} from './data/enrichmentData'
import { formatDecimal, formatScientific } from './utils/format'
import './modules.css'

type ModuleExplorerData = {
  modules: ModulesPayload
  contrasts: ModuleContrast[]
  hubs: HubsPayload
  external: ExternalValidationPayload
  enrichment: FunctionalEnrichmentPayload
}

type ModuleFilter = 'all' | 'significant' | 'reproducible' | 'year-dependent' | 'enriched' | 'external'

function useModuleExplorerData() {
  const [data, setData] = useState<ModuleExplorerData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      loadModules(),
      loadModuleContrasts(),
      loadHubs(),
      loadExternalValidation(),
      loadFunctionalEnrichment(),
    ])
      .then(([modules, contrasts, hubs, external, enrichment]) => {
        if (!active) return
        setData({
          modules,
          contrasts: contrasts.contrasts,
          hubs,
          external,
          enrichment,
        })
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'No se pudo cargar el explorador de módulos')
      })

    return () => {
      active = false
    }
  }, [])

  return { data, error }
}

function significantV3Count(data: FunctionalEnrichmentPayload, module: string) {
  return data.terms.filter(
    (row) =>
      row.Source === 'v3_mapman' &&
      row.Module === module &&
      row.FDR_global_module_terms !== null &&
      row.FDR_global_module_terms < 0.05,
  ).length
}

function externalEvaluableCount(data: ExternalValidationPayload, module: string) {
  return data.module_summary
    .filter((row) => row.Module === module)
    .reduce((sum, row) => sum + row.Complete_data_genes, 0)
}

function topHubCount(data: HubsPayload, module: string) {
  return data.rows.filter((row) => row.Module === module && row.Top_decile_kWithin).length
}

function statusLabel(row: ModuleSummary) {
  if (row.robustness_classification === 'reproducible') return 'Reproducible'
  if (row.robustness_classification === 'year-dependent') return 'Dependiente del año'
  return 'Sin clasificación prioritaria'
}

function ModuleCard({
  row,
  enrichment,
  external,
  hubs,
}: {
  row: ModuleSummary
  enrichment: FunctionalEnrichmentPayload
  external: ExternalValidationPayload
  hubs: HubsPayload
}) {
  const significantTerms = significantV3Count(enrichment, row.module)
  const evaluable = externalEvaluableCount(external, row.module)
  const topHubs = topHubCount(hubs, row.module)
  const priority = ['M5', 'M10', 'M2'].includes(row.module)

  return (
    <article className={priority ? 'module-card module-card--priority' : 'module-card'}>
      <div className="module-card-identity">
        <div>
          <span className="module-id">{row.module}</span>
          {priority && <span className="priority-pill">prioridad</span>}
        </div>
        <span className="module-status">{statusLabel(row)}</span>
      </div>

      <div className="module-row-stat">
        <span>Genes</span>
        <strong>{row.gene_count}</strong>
      </div>

      <div className="module-row-stat">
        <span>Cultivar×Stage</span>
        <strong>{formatScientific(row.cultivar_stage_fdr)}</strong>
        <small>{row.cultivar_stage_significant_fdr05 ? 'FDR < 0,05' : 'sin señal global FDR<0,05'}</small>
      </div>

      <div className="module-row-stat">
        <span>ORA v3</span>
        <strong>{significantTerms}</strong>
        <small>términos globales</small>
      </div>

      <div className="module-row-stat">
        <span>Hubs</span>
        <strong>{topHubs || '—'}</strong>
        <small>top decile</small>
      </div>

      <div className="module-row-stat">
        <span>Evidencia externa</span>
        <strong>{evaluable || '—'}</strong>
        <small>filas evaluables</small>
      </div>

      <Link className="button button--secondary module-card-link" to={'/modules/' + row.module}>
        Abrir
      </Link>

      <p className="module-card-note">
        {row.robustness_note ?? 'Sin nota de robustez prioritaria para este módulo.'}
      </p>
    </article>
  )
}

function ContrastMatrix({
  rows,
  module,
}: {
  rows: ModuleContrast[]
  module: string
}) {
  const moduleRows = rows.filter((row) => row.Module === module)
  const stages = ['FruitSet', 'Veraison', 'Harvest']
  const years = [2012, 2013, 2014]

  return (
    <section className="module-detail-section">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Robustez anual</p>
          <h2>Contraste Cabernet − Pinot por etapa y año</h2>
        </div>
        <div>
          <p>
            La dirección y la magnitud se muestran por celda. El FDR global corresponde a la familia de 90 contrastes.
          </p>
          <Link className="inline-link" to="/evidence?artifact=module_contrasts">ⓘ Ver provenance →</Link>
        </div>
      </div>

      <div className="contrast-matrix" role="table" aria-label={`Contrastes de ${module}`}>
        <div className="contrast-cell contrast-cell--header" />
        {years.map((year) => (
          <div key={year} className="contrast-cell contrast-cell--header" role="columnheader">{year}</div>
        ))}
        {stages.map((stage) => (
          <div className="contrast-matrix-row" key={stage}>
            <div className="contrast-cell contrast-cell--stage" role="rowheader">{stage}</div>
            {years.map((year) => {
              const row = moduleRows.find((item) => item.Stage === stage && item.Year === year)
              const significant = row?.FDR_global_90 !== null && row?.FDR_global_90 !== undefined && row.FDR_global_90 < 0.05
              const direction = row ? (row.estimate < 0 ? 'negative' : 'positive') : 'missing'
              return (
                <div
                  key={year}
                  className={`contrast-cell contrast-cell--value contrast-cell--${direction} ${significant ? 'contrast-cell--significant' : ''}`}
                  role="cell"
                >
                  <strong>{formatDecimal(row?.estimate, 2)}</strong>
                  <span>FDR {formatScientific(row?.FDR_global_90)}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="module-footnote">
        Valores negativos = eigengene menor en Cabernet Sauvignon que en Pinot noir. La matriz no implica causalidad.
      </p>
    </section>
  )
}

function ModuleHubs({
  data,
  module,
}: {
  data: HubsPayload
  module: string
}) {
  const rows = data.rows
    .filter((row) => row.Module === module)
    .sort((a, b) => a.Rank_kWithin - b.Rank_kWithin)
    .slice(0, 12)

  if (rows.length === 0) return null

  return (
    <section className="module-detail-section">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Hub ranking</p>
          <h2>Top 12 por kWithin</h2>
        </div>
        <p>Centralidad intramodular, no jerarquía causal.</p>
      </div>
      <div className="scientific-table-wrap">
        <table className="scientific-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Gen</th>
              <th>kWithin</th>
              <th>kME</th>
              <th>Top decile</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.Gene}>
                <td>{row.Rank_kWithin}</td>
                <td><Link to={`/genes/${row.Gene}`}><code>{row.Gene}</code></Link></td>
                <td>{formatDecimal(row.kWithin, 3)}</td>
                <td>{formatDecimal(row.kME_signed, 3)}</td>
                <td>{row.Top_decile_kWithin ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ModuleFunctionalSummary({
  enrichment,
  module,
}: {
  enrichment: FunctionalEnrichmentPayload
  module: string
}) {
  const terms = enrichment.terms
    .filter(
      (row) =>
        row.Source === 'v3_mapman' &&
        row.Module === module &&
        row.FDR_global_module_terms !== null &&
        row.FDR_global_module_terms < 0.05,
    )
    .sort((a, b) => (a.FDR_global_module_terms ?? 1) - (b.FDR_global_module_terms ?? 1))
    .slice(0, 5)

  return (
    <section className="module-detail-section">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Functional enrichment</p>
          <h2>MapMan v3 · hits globales</h2>
        </div>
        <Link className="inline-link" to={'/enrichment?module=' + module}>Abrir explorador de enriquecimiento →</Link>
      </div>

      {terms.length === 0 ? (
        <div className="module-empty">
          No hay términos MapMan v3 con FDR global &lt; 0,05 para {module}. Esto no equivale a “sin función”.
        </div>
      ) : (
        <div className="module-term-list">
          {terms.map((row) => (
            <article key={row.TermID}>
              <span>{row.TermID}</span>
              <strong>{row.TermName}</strong>
              <small>fold {formatDecimal(row.Fold_enrichment, 2)} · FDR {formatScientific(row.FDR_global_module_terms)}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function ModuleExternalSummary({
  external,
  module,
}: {
  external: ExternalValidationPayload
  module: string
}) {
  const rows = external.module_summary.filter((row) => row.Module === module)
  if (rows.length === 0) {
    return (
      <section className="module-detail-section">
        <div className="module-empty">
          La validación externa prioritaria T-007 se concentró en M5/M10/M2; {module} no tiene resumen equivalente en ese conjunto congelado.
        </div>
      </section>
    )
  }

  return (
    <section className="module-detail-section">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Skin-only externa</p>
          <h2>Cobertura y concordancia</h2>
        </div>
        <Link className="inline-link" to={'/validation?module=' + module}>Abrir validación externa →</Link>
      </div>
      <div className="external-module-grid">
        {rows.map((row) => (
          <article key={`${row.Dataset}-${row.Condition}`}>
            <span>{row.Dataset} · {row.Condition}</span>
            <strong>{row.Complete_data_genes}/{row.Module_genes}</strong>
            <p>genes con datos completos</p>
            <small>{row.Direction_matched_stable_genes} concordantes entre los estables evaluables</small>
          </article>
        ))}
      </div>
    </section>
  )
}

export function ModulesExplorerPage() {
  const { data, error } = useModuleExplorerData()
  const [filter, setFilter] = useState<ModuleFilter>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase()

    return data.modules.modules.filter((row) => {
      const enriched = significantV3Count(data.enrichment, row.module) > 0
      const external = externalEvaluableCount(data.external, row.module) > 0
      const matchesFilter =
        filter === 'all' ||
        (filter === 'significant' && row.cultivar_stage_significant_fdr05) ||
        (filter === 'reproducible' && row.robustness_classification === 'reproducible') ||
        (filter === 'year-dependent' && row.robustness_classification === 'year-dependent') ||
        (filter === 'enriched' && enriched) ||
        (filter === 'external' && external)

      return matchesFilter && (!normalized || row.module.toLowerCase().includes(normalized))
    })
  }, [data, filter, query])

  return (
    <div className="modules-page">
      <section className="modules-hero">
        <div>
          <p className="eyebrow">Resultados · Módulos</p>
          <h1>Comparar los diez módulos</h1>
          <p>
            Tamaño, interacción Cultivar×Stage, robustez anual, enriquecimiento y evidencia externa,
            lado a lado y sin convertir esas dimensiones en un ranking artificial.
          </p>
        </div>
      </section>

      {!data && !error && <div className="data-state" role="status"><span className="data-state-dot" />Cargando módulos canónicos…</div>}
      {error && <div className="data-state data-state--error" role="alert"><strong>Error de datos</strong><span>{error}</span></div>}

      {data && (
        <>
          <section className="module-filter-panel">
            <div className="module-filter-buttons" aria-label="Filtros de módulos">
              {([
                ['all', 'Todos'],
                ['significant', 'Interacción FDR<0,05'],
                ['reproducible', 'Reproducible'],
                ['year-dependent', 'Dependiente del año'],
                ['enriched', 'Con ORA v3'],
                ['external', 'Con evidencia externa'],
              ] as Array<[ModuleFilter, string]>).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={filter === value ? 'module-filter module-filter--active' : 'module-filter'}
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="module-search">
              <span>Buscar módulo</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="M5, M10…"
              />
            </label>
          </section>

          <section className="module-overview-strip">
            <article><strong>{data.modules.modules.length}</strong><span>módulos biológicos</span></article>
            <article><strong>{data.modules.modules.filter((row) => row.cultivar_stage_significant_fdr05).length}</strong><span>interacción FDR&lt;0,05</span></article>
            <article><strong>{data.modules.modules.filter((row) => row.robustness_classification === 'reproducible').length}</strong><span>clasificados reproducibles</span></article>
            <article><strong>{data.modules.modules.filter((row) => significantV3Count(data.enrichment, row.module) > 0).length}</strong><span>con ORA v3 global</span></article>
          </section>

          <section className="module-card-grid">
            {filtered.map((row) => (
              <ModuleCard
                key={row.module}
                row={row}
                enrichment={data.enrichment}
                external={data.external}
                hubs={data.hubs}
              />
            ))}
          </section>

          {filtered.length === 0 && (
            <div className="module-empty">No hay módulos que cumplan los filtros actuales.</div>
          )}

          <section className="module-boundary">
            <article>
              <p className="eyebrow">Lectura correcta</p>
              <h2>“Significativo” y “reproducible” responden preguntas distintas</h2>
              <p>
                La interacción Cultivar×Stage viene del modelo aditivo; la clasificación anual resume la revisión de robustez.
                Un módulo puede mostrar una interacción fuerte y aun así depender del año.
              </p>
            </article>
            <article>
              <p className="eyebrow">Sin ranking artificial</p>
              <h2>No existe una puntuación total de “mejor módulo”</h2>
              <p>
                La web cruza dimensiones reales —FDR, robustez, ORA, hubs y validación— sin convertirlas en un score inventado.
              </p>
            </article>
          </section>
        </>
      )}
    </div>
  )
}

export function ModuleExplorerDetailPage() {
  const { moduleId } = useParams()
  const module = moduleId?.toUpperCase() ?? ''
  const { data, error } = useModuleExplorerData()
  const summary = data?.modules.modules.find((row) => row.module === module)
  const v3Hits = data ? significantV3Count(data.enrichment, module) : 0
  const externalRows = data ? externalEvaluableCount(data.external, module) : 0

  if (!module.match(/^M(?:10|[1-9])$/)) {
    return (
      <div className="modules-page">
        <section className="modules-hero"><div><p className="eyebrow">MODULE</p><h1>Módulo no reconocido</h1></div></section>
        <Link className="button button--primary button--fit" to="/modules">Volver a módulos</Link>
      </div>
    )
  }

  return (
    <div className="modules-page">
      <section className={module === 'M2' ? 'module-detail-hero module-detail-hero--warning' : 'module-detail-hero'}>
        <div>
          <p className="eyebrow">Module Explorer</p>
          <h1>{module}</h1>
          {summary && (
            <p>
              {summary.gene_count} genes · FDR Cultivar×Stage {formatScientific(summary.cultivar_stage_fdr)} · {statusLabel(summary)}
            </p>
          )}
        </div>
        <div className="module-detail-hero-stats">
          <span><strong>{v3Hits}</strong> ORA v3 hits</span>
          <span><strong>{externalRows || '—'}</strong> filas externas evaluables</span>
        </div>
      </section>

      {!data && !error && <div className="data-state" role="status"><span className="data-state-dot" />Cargando detalle de {module}…</div>}
      {error && <div className="data-state data-state--error" role="alert"><strong>Error de datos</strong><span>{error}</span></div>}

      {data && summary && (
        <>
          {module === 'M2' && (
            <section className="module-provisional-warning">
              <p className="eyebrow">Estado provisional</p>
              <h2>M2 no debe cerrarse interpretativamente antes de T-008</h2>
              <p>
                El proyecto documenta una sensibilidad histórica relacionada con ceros de expresión y posibles efectos de referencia/mapeo.
                La web conserva M2 como candidato, pero no lo presenta como una conclusión moderna establecida.
              </p>
              <Link className="inline-link" to="/t008">Ver progreso T-008 →</Link>
            </section>
          )}

          {module === 'M10' && (
            <section className="module-highlight">
              <p className="eyebrow">Robustez</p>
              <h2>M10 está clasificado como reproducible bajo la regla preespecificada</h2>
              <p>
                Esa etiqueta describe repetición anual del patrón relevante; no asigna por sí sola una función biológica específica.
              </p>
            </section>
          )}

          <ContrastMatrix rows={data.contrasts} module={module} />
          <ModuleFunctionalSummary enrichment={data.enrichment} module={module} />
          <ModuleHubs data={data.hubs} module={module} />
          <ModuleExternalSummary external={data.external} module={module} />

          <section className="module-detail-section">
            <div className="module-section-heading">
              <div>
                <p className="eyebrow">Rutas a resultados</p>
                <h2>Seguir explorando</h2>
              </div>
            </div>
            <div className="module-route-grid">
              <Link to={'/enrichment?module=' + module}><strong>Enriquecimiento</strong><span>MapMan v3/v5.1 + GO</span></Link>
              <Link to={'/validation?module=' + module}><strong>Validación externa</strong><span>skin-only T-007</span></Link>
              <Link to="/t008"><strong>T-008</strong><span>reprocesamiento moderno</span></Link>
              {module === 'M5' && <Link to="/modules/M5"><strong>M5 Explorer</strong><span>red, chr16 y hubs</span></Link>}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
