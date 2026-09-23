import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ActionLink, AsyncState, Badge, ButtonLink, Callout, EmptyState, FilterBar, TableFrame } from './components/ui'
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

const MODULE_FILTERS: ModuleFilter[] = ['all', 'significant', 'reproducible', 'year-dependent', 'enriched', 'external']

const PROFILE_MODULES = Array.from({ length: 10 }, (_, index) => `M${index + 1}`)
const MODULE_IDS = PROFILE_MODULES

function scrollToModuleSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

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
    <section className="module-detail-section" id="module-contrasts">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Robustez anual</p>
          <h2>Contraste Cabernet − Pinot por etapa y año</h2>
        </div>
        <div>
          <p>
            La dirección y la magnitud se muestran por celda. El FDR global corresponde a la familia de 90 contrastes.
          </p>
          <Link className="inline-link" to="/reproducibility?artifact=module_contrasts">ⓘ Ver trazabilidad →</Link>
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
    <section className="module-detail-section" id="module-hubs">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Hub ranking</p>
          <h2>Top 12 por kWithin</h2>
        </div>
        <p>Centralidad intramodular, no jerarquía causal.</p>
      </div>
      <details className="data-disclosure">
        <summary>Ver top 12 hubs</summary>
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
                  <td><Link to={`/results/genes/${row.Gene}`}><code>{row.Gene}</code></Link></td>
                  <td>{formatDecimal(row.kWithin, 3)}</td>
                  <td>{formatDecimal(row.kME_signed, 3)}</td>
                  <td>{row.Top_decile_kWithin ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
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
    <section className="module-detail-section" id="module-function">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Función</p>
          <h2>MapMan v3 · hits globales</h2>
        </div>
        <Link className="inline-link" to={'/results/function?module=' + module}>Abrir explorador de enriquecimiento →</Link>
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
      <section className="module-detail-section" id="module-validation">
        <div className="module-empty">
          La validación externa prioritaria se concentró en M5/M10/M2; {module} no tiene resumen equivalente en ese conjunto congelado.
        </div>
      </section>
    )
  }

  return (
    <section className="module-detail-section" id="module-validation">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Piel externa</p>
          <h2>Cobertura y concordancia</h2>
        </div>
        <Link className="inline-link" to={'/results/validation?module=' + module}>Abrir validación externa →</Link>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedFilter = searchParams.get('filter')
  const filter: ModuleFilter = MODULE_FILTERS.includes(requestedFilter as ModuleFilter)
    ? requestedFilter as ModuleFilter
    : 'all'
  const query = searchParams.get('q') ?? ''

  function updateSearch(next: { filter?: ModuleFilter; query?: string }) {
    const updated = new URLSearchParams(searchParams)
    const nextFilter = next.filter ?? filter
    const nextQuery = next.query ?? query

    if (nextFilter === 'all') updated.delete('filter')
    else updated.set('filter', nextFilter)

    if (nextQuery.trim()) updated.set('q', nextQuery)
    else updated.delete('q')

    setSearchParams(updated, { replace: true })
  }

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

      {!data && !error && <AsyncState state="loading">Cargando módulos canónicos…</AsyncState>}
      {error && <AsyncState state="error" title="Error de datos">{error}</AsyncState>}

      {data && (
        <>
          <section className="cemitool-profile-panel">
            <div className="module-section-heading">
              <div>
                <p className="eyebrow">Salida original · CEMiTool β10</p>
                <h2>Perfiles de los diez módulos</h2>
              </div>
              <p>
                Estos paneles son las imágenes canónicas exportadas por CEMiTool para M1–M10.
                La web no recalcula ni redibuja esta figura.
              </p>
            </div>

            <figure className="cemitool-profile-figure">
              <div className="cemitool-profile-grid">
                {PROFILE_MODULES.map((moduleId) => (
                  <Link
                    key={moduleId}
                    className="cemitool-profile-tile"
                    to={'/results/modules/' + moduleId}
                    aria-label={'Abrir detalle de ' + moduleId}
                  >
                    <img
                      src={import.meta.env.BASE_URL + 'assets/cemitool/profile_' + moduleId + '.png'}
                      alt={'Perfil CEMiTool del módulo ' + moduleId}
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{moduleId}</span>
                  </Link>
                ))}
              </div>
              <figcaption>
                Figura CEMiTool beta10. Cada panel enlaza al detalle del módulo.
                {' '}
                <a
                  href={import.meta.env.BASE_URL + 'assets/cemitool/profile_beta10.pdf'}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir PDF original ↗
                </a>
              </figcaption>
            </figure>
          </section>

          <section className="module-overview-strip" aria-label="Resumen global de módulos">
            <article><strong>{data.modules.modules.length}</strong><span>módulos</span></article>
            <article><strong>{data.modules.modules.filter((row) => row.cultivar_stage_significant_fdr05).length}</strong><span>interacción FDR&lt;0,05</span></article>
            <article><strong>{data.modules.modules.filter((row) => row.robustness_classification === 'reproducible').length}</strong><span>reproducibles</span></article>
            <article><strong>{data.modules.modules.filter((row) => significantV3Count(data.enrichment, row.module) > 0).length}</strong><span>con ORA v3 global</span></article>
          </section>

          <section className="module-data-panel">
            <div className="module-section-heading">
              <div>
                <p className="eyebrow">Datos por módulo</p>
                <h2>Las cifras detrás de M1–M10</h2>
              </div>
              <p>Filtra la tabla sin alterar la figura CEMiTool original.</p>
            </div>

            <details className="module-column-guide">
              <summary>Cómo leer las columnas</summary>
              <dl>
                <div>
                  <dt>FDR Cultivar×Stage</dt>
                  <dd>Interacción del modelo aditivo ajustada por BH; no mide estabilidad entre años.</dd>
                </div>
                <div>
                  <dt>Robustez</dt>
                  <dd>Clasificación derivada de la revisión anual; “dependiente del año” no significa ausencia de señal.</dd>
                </div>
                <div>
                  <dt>ORA v3</dt>
                  <dd>Número de términos MapMan v3 significativos a FDR global, evaluados para el módulo completo.</dd>
                </div>
                <div>
                  <dt>Hubs top decile</dt>
                  <dd>Genes priorizados por centralidad intramodular; centralidad no implica causalidad.</dd>
                </div>
                <div>
                  <dt>Evidencia externa</dt>
                  <dd>Filas evaluables en datasets independientes de piel; no se suman al baseline de 54 muestras.</dd>
                </div>
              </dl>
              <p>No existe un score total: cada columna responde una pregunta científica distinta.</p>
            </details>

            <FilterBar className="module-filter-panel">
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
                    onClick={() => updateSearch({ filter: value })}
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
                  onChange={(event) => updateSearch({ query: event.target.value })}
                  placeholder="M5, M10…"
                />
              </label>
            </FilterBar>

            <TableFrame className="module-data-table-wrap" label="Comparación de los diez módulos">
              <table className="scientific-table module-data-table">
                <caption>
                  Comparación de módulos por tamaño, interacción Cultivar×Stage, robustez anual,
                  enriquecimiento funcional, hubs y evidencia externa.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Módulo</th>
                    <th scope="col">Genes</th>
                    <th scope="col">FDR Cultivar×Stage</th>
                    <th scope="col">Robustez</th>
                    <th scope="col">ORA v3</th>
                    <th scope="col">Hubs top decile</th>
                    <th scope="col">Evidencia externa</th>
                    <th scope="col"><span className="visually-hidden">Acción</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const priority = ['M5', 'M10', 'M2'].includes(row.module)
                    return (
                      <tr key={row.module}>
                        <th scope="row">
                          <Link className="module-table-id" to={'/results/modules/' + row.module}>
                            {row.module}
                          </Link>
                          {priority && <Badge tone="brand" className="priority-pill">prioridad</Badge>}
                        </th>
                        <td>{row.gene_count}</td>
                        <td>
                          <strong>{formatScientific(row.cultivar_stage_fdr)}</strong>
                          <small>{row.cultivar_stage_significant_fdr05 ? 'FDR < 0,05' : 'no significativo a 0,05'}</small>
                        </td>
                        <td>{statusLabel(row)}</td>
                        <td>{significantV3Count(data.enrichment, row.module)}</td>
                        <td>{topHubCount(data.hubs, row.module) || '—'}</td>
                        <td>{externalEvaluableCount(data.external, row.module) || '—'}</td>
                        <td><Link className="inline-link" to={'/results/modules/' + row.module}>Abrir →</Link></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TableFrame>

            <div className="module-mobile-list" aria-label="Comparación móvil de módulos">
              {filtered.map((row) => {
                const priority = ['M5', 'M10', 'M2'].includes(row.module)
                return (
                  <article className={priority ? 'module-mobile-card module-mobile-card--priority' : 'module-mobile-card'} key={row.module}>
                    <header>
                      <div>
                        <Link to={'/results/modules/' + row.module}>{row.module}</Link>
                        {priority && <Badge tone="brand">prioridad</Badge>}
                      </div>
                      <span>{row.gene_count} genes</span>
                    </header>
                    <dl>
                      <div>
                        <dt>Interacción</dt>
                        <dd>{formatScientific(row.cultivar_stage_fdr)}</dd>
                        <small>{row.cultivar_stage_significant_fdr05 ? 'FDR < 0,05' : 'no significativa'}</small>
                      </div>
                      <div>
                        <dt>Robustez</dt>
                        <dd>{statusLabel(row)}</dd>
                      </div>
                      <div>
                        <dt>Función</dt>
                        <dd>{significantV3Count(data.enrichment, row.module)} ORA v3</dd>
                      </div>
                      <div>
                        <dt>Evidencia</dt>
                        <dd>{topHubCount(data.hubs, row.module) || '—'} hubs · {externalEvaluableCount(data.external, row.module) || '—'} externas</dd>
                      </div>
                    </dl>
                    <ActionLink to={'/results/modules/' + row.module}>Abrir módulo</ActionLink>
                  </article>
                )
              })}
            </div>
            <p className="module-result-count" role="status" aria-live="polite">
              Mostrando {filtered.length} de {data.modules.modules.length} módulos.
            </p>
          </section>

          {filtered.length === 0 && (
            <EmptyState title="Sin módulos coincidentes">No hay módulos que cumplan los filtros actuales.</EmptyState>
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
  const moduleIndex = MODULE_IDS.indexOf(module)
  const previousModule = moduleIndex > 0 ? MODULE_IDS[moduleIndex - 1] : null
  const nextModule = moduleIndex >= 0 && moduleIndex < MODULE_IDS.length - 1 ? MODULE_IDS[moduleIndex + 1] : null
  const [activeSection, setActiveSection] = useState('module-contrasts')

  useEffect(() => {
    const ids = ['module-contrasts', 'module-function', 'module-hubs', 'module-validation']
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-130px 0px -52% 0px', threshold: [0.1, 0.25, 0.5] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [data, module])

  if (!module.match(/^M(?:10|[1-9])$/)) {
    return (
      <div className="modules-page">
        <section className="modules-hero"><div><p className="eyebrow">MODULE</p><h1>Módulo no reconocido</h1></div></section>
        <ButtonLink variant="primary" fit to="/results/modules">Volver a módulos</ButtonLink>
      </div>
    )
  }

  return (
    <div className="modules-page">
      <section className={module === 'M2' ? 'module-detail-hero module-detail-hero--warning' : 'module-detail-hero'}>
        <div>
          <p className="eyebrow">Resultados · Módulo</p>
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

      <nav className="module-detail-pager" aria-label={'Navegación entre módulos'}>
        <Link className="module-detail-back" to="/results/modules">← Todos los módulos</Link>
        <div>
          {previousModule ? <Link to={'/results/modules/' + previousModule}>← {previousModule}</Link> : <span />}
          {nextModule ? <Link to={'/results/modules/' + nextModule}>{nextModule} →</Link> : <span />}
        </div>
      </nav>

      {!data && !error && <AsyncState state="loading">Cargando detalle de {module}…</AsyncState>}
      {error && <AsyncState state="error" title="Error de datos">{error}</AsyncState>}

      <nav className="module-section-nav" aria-label={'Secciones de ' + module}>
        <button
          type="button"
          className={activeSection === 'module-contrasts' ? 'module-section-nav-link module-section-nav-link--active' : 'module-section-nav-link'}
          onClick={() => {
            setActiveSection('module-contrasts')
            scrollToModuleSection('module-contrasts')
          }}
          aria-current={activeSection === 'module-contrasts' ? 'true' : undefined}
        >
          Contrastes
        </button>
        <button
          type="button"
          className={activeSection === 'module-function' ? 'module-section-nav-link module-section-nav-link--active' : 'module-section-nav-link'}
          onClick={() => {
            setActiveSection('module-function')
            scrollToModuleSection('module-function')
          }}
          aria-current={activeSection === 'module-function' ? 'true' : undefined}
        >
          Función
        </button>
        <button
          type="button"
          className={activeSection === 'module-hubs' ? 'module-section-nav-link module-section-nav-link--active' : 'module-section-nav-link'}
          onClick={() => {
            setActiveSection('module-hubs')
            scrollToModuleSection('module-hubs')
          }}
          aria-current={activeSection === 'module-hubs' ? 'true' : undefined}
        >
          Hubs
        </button>
        <button
          type="button"
          className={activeSection === 'module-validation' ? 'module-section-nav-link module-section-nav-link--active' : 'module-section-nav-link'}
          onClick={() => {
            setActiveSection('module-validation')
            scrollToModuleSection('module-validation')
          }}
          aria-current={activeSection === 'module-validation' ? 'true' : undefined}
        >
          Validación
        </button>
      </nav>

      {data && summary && (
        <>
          {module === 'M2' && (
            <Callout className="module-provisional-warning" tone="warning" eyebrow="Estado provisional" title="M2 no debe cerrarse interpretativamente antes de T-008">
              <p>
                El proyecto documenta una sensibilidad histórica relacionada con ceros de expresión y posibles efectos de referencia/mapeo.
                La web conserva M2 como candidato, pero no lo presenta como una conclusión moderna establecida.
              </p>
              <ActionLink to="/status/t008">Ver progreso T-008</ActionLink>
            </Callout>
          )}

          {module === 'M10' && (
            <Callout className="module-highlight" tone="success" eyebrow="Robustez" title="M10 está clasificado como reproducible bajo la regla preespecificada">
              <p>
                Esa etiqueta describe repetición anual del patrón relevante; no asigna por sí sola una función biológica específica.
              </p>
            </Callout>
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
              <Link to={'/results/function?module=' + module}><strong>Enriquecimiento</strong><span>MapMan v3/v5.1 + GO</span></Link>
              <Link to={'/results/validation?module=' + module}><strong>Validación externa</strong><span>evidencia independiente en piel</span></Link>
              <Link to="/status/t008"><strong>T-008</strong><span>reprocesamiento moderno</span></Link>
              {module === 'M5' && <Link to="/results/modules/M5"><strong>M5</strong><span>red, chr16 y hubs</span></Link>}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
