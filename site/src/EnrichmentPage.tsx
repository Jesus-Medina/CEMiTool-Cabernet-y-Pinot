import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  loadFunctionalEnrichment,
  type EnrichmentSourceId,
  type EnrichmentTerm,
  type EnrichmentTheme,
  type FunctionalEnrichmentPayload,
} from './data/enrichmentData'
import { formatDecimal, formatScientific } from './utils/format'
import './enrichment.css'

const MODULES = Array.from({ length: 10 }, (_, index) => `M${index + 1}`)
const SOURCE_ORDER: EnrichmentSourceId[] = ['v3_mapman', 'v5_mapman', 'go']

function negativeLog10(value: number | null) {
  if (value === null || value <= 0) return 0
  return Math.min(-Math.log10(value), 30)
}

function EnrichmentBars({ rows }: { rows: EnrichmentTerm[] }) {
  const top = rows.slice(0, 12)
  const maxScore = Math.max(...top.map((row) => negativeLog10(row.FDR_global_module_terms)), 1)

  if (top.length === 0) {
    return <p className="empty-state">No hay términos que cumplan los filtros actuales.</p>
  }

  return (
    <div className="enrichment-bars" aria-label="Términos ordenados por FDR global">
      {top.map((row) => {
        const score = negativeLog10(row.FDR_global_module_terms)
        return (
          <article className="enrichment-bar-row" key={`${row.Source}-${row.Module}-${row.TermID}`}>
            <div className="enrichment-bar-label">
              <strong title={row.TermName}>{row.TermName}</strong>
              <span>{row.TermID}{row.Aspect ? ` · ${row.Aspect}` : ''}</span>
            </div>
            <div className="enrichment-bar-track" aria-hidden="true">
              <span style={{ width: `${Math.max((score / maxScore) * 100, 1.5)}%` }} />
            </div>
            <div className="enrichment-bar-stats">
              <span>−log10 FDR {formatDecimal(score, 2)}</span>
              <span>fold {formatDecimal(row.Fold_enrichment, 2)}</span>
              <span>{row.Overlap_k}/{row.Module_n} genes anotados</span>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ThemePanel({
  themes,
  source,
  module,
}: {
  themes: EnrichmentTheme[]
  source: EnrichmentSourceId
  module: string
}) {
  const available = useMemo(
    () => themes.filter((row) => row.Source === source && row.Module === module),
    [themes, source, module],
  )
  const [selectedTheme, setSelectedTheme] = useState('cuticle_cutin_wax')

  useEffect(() => {
    const names = available.map((row) => row.Theme)
    if (!names.includes(selectedTheme)) {
      setSelectedTheme(names[0] ?? '')
    }
  }, [available, selectedTheme])

  if (source === 'go') {
    return (
      <section className="theme-panel theme-panel--disabled">
        <p className="eyebrow">Temas preespecificados</p>
        <h2>Disponibles para MapMan</h2>
        <p>
          Los nueve temas preespecificados se definieron como uniones de categorías MapMan.
          El GO auditado se explora por términos, no reutilizando artificialmente esas categorías.
        </p>
      </section>
    )
  }

  const selected = available.find((row) => row.Theme === selectedTheme)

  return (
    <section className="theme-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Temas preespecificados</p>
          <h2>Hipótesis funcionales definidas antes de mirar los hits</h2>
        </div>
        <p>
          Esta capa es distinta del ORA por término. La corrección BH se aplica a las combinaciones módulo×tema testables.
        </p>
      </div>

      <div className="theme-chip-row">
        {available.map((row) => (
          <button
            type="button"
            key={row.Theme}
            className={selectedTheme === row.Theme ? 'theme-chip theme-chip--active' : 'theme-chip'}
            onClick={() => setSelectedTheme(row.Theme)}
          >
            {row.Theme.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {selected && (
        <div className="theme-detail">
          <div>
            <span>Theme</span>
            <strong>{selected.Theme.replaceAll('_', ' ')}</strong>
          </div>
          <div>
            <span>Overlap</span>
            <strong>{selected.Overlap_k}/{selected.Module_n}</strong>
          </div>
          <div>
            <span>Fold</span>
            <strong>{formatDecimal(selected.Fold_enrichment, 2)}</strong>
          </div>
          <div>
            <span>FDR global temas</span>
            <strong>{formatScientific(selected.FDR_global_themes)}</strong>
          </div>
          <div>
            <span>Estado</span>
            <strong>{selected.Tested ? 'Testado' : selected.Reason_if_not_tested ?? 'No testado'}</strong>
          </div>
        </div>
      )}
    </section>
  )
}

function AnnotationComparison({ data }: { data: FunctionalEnrichmentPayload }) {
  function top(source: EnrichmentSourceId) {
    return data.terms
      .filter(
        (row) =>
          row.Source === source &&
          row.Module === 'M5' &&
          row.FDR_global_module_terms !== null &&
          row.FDR_global_module_terms < 0.05,
      )
      .sort((a, b) => (a.FDR_global_module_terms ?? 1) - (b.FDR_global_module_terms ?? 1))
      .slice(0, 4)
  }

  return (
    <section className="annotation-compare">
      <div className="section-heading">
        <div>
          <p className="eyebrow">M5 · anotación cruzada</p>
          <h2>La interpretación depende de la versión de anotación</h2>
        </div>
        <p>
          La señal funcional es fuerte, pero las etiquetas CHS/STS no son intercambiables.
          Por eso la web muestra ambas vistas sin adjudicar una enzima exacta por conveniencia.
        </p>
      </div>
      <div className="annotation-compare-grid">
        {(['v3_mapman', 'v5_mapman'] as const).map((source) => {
          const meta = data.sources.find((item) => item.id === source)
          return (
            <article key={source}>
              <span>{meta?.label}</span>
              {top(source).map((row) => (
                <div key={row.TermID}>
                  <strong>{row.TermName}</strong>
                  <small>FDR {formatScientific(row.FDR_global_module_terms)} · fold {formatDecimal(row.Fold_enrichment, 2)}</small>
                </div>
              ))}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default function EnrichmentPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedModule = searchParams.get('module')
  const initialModule = requestedModule && MODULES.includes(requestedModule) ? requestedModule : 'M5'
  const [data, setData] = useState<FunctionalEnrichmentPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<EnrichmentSourceId>('v3_mapman')
  const [module, setModule] = useState(initialModule)
  const [scope, setScope] = useState<'significant' | 'all'>('significant')
  const [query, setQuery] = useState('')
  const [showAllRows, setShowAllRows] = useState(false)

  useEffect(() => {
    let active = true
    loadFunctionalEnrichment()
      .then((payload) => {
        if (active) setData(payload)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Error al cargar enriquecimiento')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setShowAllRows(false)
  }, [source, module, scope, query])

  useEffect(() => {
    const requested = searchParams.get('module')
    if (requested && MODULES.includes(requested) && requested !== module) {
      setModule(requested)
    }
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get('module') === module) return
    const next = new URLSearchParams(searchParams)
    next.set('module', module)
    setSearchParams(next, { replace: true })
  }, [module, searchParams, setSearchParams])

  const terms = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase()
    return data.terms
      .filter((row) => row.Source === source && row.Module === module)
      .filter((row) => scope === 'all' || (row.FDR_global_module_terms !== null && row.FDR_global_module_terms < 0.05))
      .filter((row) => !normalized || row.TermName.toLowerCase().includes(normalized) || row.TermID.toLowerCase().includes(normalized))
      .sort((a, b) => {
        const afdr = a.FDR_global_module_terms ?? 1
        const bfdr = b.FDR_global_module_terms ?? 1
        if (afdr !== bfdr) return afdr - bfdr
        return (b.Fold_enrichment ?? 0) - (a.Fold_enrichment ?? 0)
      })
  }, [data, source, module, scope, query])

  const qc = data?.qc.find((row) => row.Source === source && row.Module === module)
  const sourceMeta = data?.sources.find((row) => row.id === source)
  const visibleRows = showAllRows ? terms : terms.slice(0, 80)

  return (
    <div className="enrichment-page">
      <section className="enrichment-hero">
        <div>
          <p className="eyebrow">Resultados · Función</p>
          <h1>¿Qué funciones aparecen sobrerrepresentadas?</h1>
          <p>
            Explora el ORA de módulos beta10 con MapMan v3, MapMan v5.1 y el GO corregido por la auditoría T-005A.
            La interfaz separa cobertura de anotación, significancia global y temas preespecificados.
          </p>
        </div>
      </section>

      <div className="explorer-context-banner">
        <div>
          <span>Contexto activo</span>
          <strong>{module}</strong>
          <small>Los filtros y resultados de esta vista corresponden al módulo seleccionado.</small>
        </div>
        <Link to={'/modules/' + module}>Volver a {module} →</Link>
      </div>

      {!data && !error && <div className="data-state" role="status"><span className="data-state-dot" />Cargando enriquecimiento canónico…</div>}
      {error && <div className="data-state data-state--error" role="alert"><strong>Error de datos</strong><span>{error}</span></div>}

      {data && (
        <>
          <section className="enrichment-controls">
            <div>
              <span className="control-label">Fuente</span>
              <div className="source-switcher">
                {SOURCE_ORDER.map((id) => {
                  const meta = data.sources.find((item) => item.id === id)
                  return (
                    <button
                      type="button"
                      key={id}
                      className={source === id ? 'source-button source-button--active' : 'source-button'}
                      onClick={() => setSource(id)}
                    >
                      <strong>{meta?.label}</strong>
                      <small>{meta?.role === 'primary' ? 'primaria' : 'secundaria'}</small>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="enrichment-filter-row">
              <label>
                <span className="control-label">Módulo</span>
                <select value={module} onChange={(event) => setModule(event.target.value)}>
                  {MODULES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span className="control-label">Términos</span>
                <select value={scope} onChange={(event) => setScope(event.target.value as 'significant' | 'all')}>
                  <option value="significant">FDR global &lt; 0,05</option>
                  <option value="all">Todos los testados</option>
                </select>
              </label>
              <label className="search-control">
                <span className="control-label">Buscar</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="stilbenoid, GO:…, PAL…"
                />
              </label>
            </div>
          </section>

          <section className="coverage-strip">
            <article>
              <span>Fuente activa</span>
              <strong>{sourceMeta?.label}</strong>
              <small>{sourceMeta?.notes}</small>
            </article>
            <article>
              <span>Cobertura {module}</span>
              <strong>{formatDecimal(qc?.Coverage_percent, 1)}%</strong>
              <small>{qc?.Annotated_module_genes ?? '—'} de {qc?.Assigned_module_genes ?? '—'} genes</small>
            </article>
            <article>
              <span>Términos testados</span>
              <strong>{qc?.Terms_tested ?? 0}</strong>
              <small>background anotado: {qc?.Background_annotated_genes ?? '—'}</small>
            </article>
            <article className={qc?.Coverage_warning ? 'coverage-warning' : ''}>
              <span>Hits FDR global</span>
              <strong>{qc?.Global_FDR_hits ?? 0}</strong>
              <small>{qc?.Coverage_warning ? 'Cobertura limitada: interpretar con cautela' : 'Sin warning de cobertura del pipeline'}</small>
            </article>
          </section>

          <section className="enrichment-main-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ORA por término</p>
                <h2>{module} · {sourceMeta?.label}</h2>
              </div>
              <div>
                <p>
                  Barras = −log10(FDR global). El fold indica sobrerrepresentación respecto del background anotado de esa fuente.
                </p>
                <Link className="inline-link" to="/evidence?artifact=functional_enrichment">Ver trazabilidad →</Link>
              </div>
            </div>
            <EnrichmentBars rows={terms} />

            <div className="enrichment-table-toolbar">
              <span>{terms.length} términos bajo los filtros actuales</span>
              {terms.length > 80 && (
                <button type="button" className="button button--secondary" onClick={() => setShowAllRows((value) => !value)}>
                  {showAllRows ? 'Mostrar primeros 80' : 'Mostrar todos'}
                </button>
              )}
            </div>

            <div className="scientific-table-wrap">
              <table className="scientific-table enrichment-table">
                <thead>
                  <tr>
                    <th>Término</th>
                    <th>ID</th>
                    <th>Overlap</th>
                    <th>Fold</th>
                    <th>p</th>
                    <th>FDR global</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={`${row.Source}-${row.Module}-${row.TermID}`}>
                      <td>{row.TermName}</td>
                      <td><code>{row.TermID}</code></td>
                      <td>{row.Overlap_k}/{row.Module_n}</td>
                      <td>{formatDecimal(row.Fold_enrichment, 2)}</td>
                      <td>{formatScientific(row.p_value)}</td>
                      <td>{formatScientific(row.FDR_global_module_terms)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <ThemePanel themes={data.themes} source={source} module={module} />

          {source === 'go' && (
            <section className="go-audit-panel">
              <div>
                <p className="eyebrow">GO auditado</p>
                <h2>La tabla GO histórica no es la fuente vigente</h2>
                <p>
                  Esta vista usa <code>{data.summary.go_current_table}</code>. La tabla histórica
                  <code> {data.summary.go_superseded_historical_table}</code> se conserva solo por trazabilidad.
                </p>
              </div>
              <div className="go-audit-stats">
                <article><strong>{String(data.summary.go_audit.term_status_counts ?? '—')}</strong><span>estado de términos</span></article>
                <article><strong>{String(data.summary.go_audit.tested_module_terms ?? '—')}</strong><span>tests módulo×término</span></article>
                <article><strong>{String(data.summary.go_audit.global_FDR05_hits ?? '—')}</strong><span>hits FDR global &lt;0,05</span></article>
              </div>
            </section>
          )}

          <AnnotationComparison data={data} />

          <section className="interpretation-boundary">
            <article>
              <p className="eyebrow">Qué muestra</p>
              <h2>Sobrerrepresentación funcional del módulo completo</h2>
              <p>
                El ORA identifica categorías con más genes del módulo de lo esperado según el background anotado.
              </p>
            </article>
            <article>
              <p className="eyebrow">Qué no demuestra</p>
              <h2>No identifica por sí solo drivers de una etapa ni especificidad de piel</h2>
              <p>
                Un término enriquecido no prueba que sus genes causen el contraste Cabernet–Pinot, ni que actúen específicamente en piel.
              </p>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
