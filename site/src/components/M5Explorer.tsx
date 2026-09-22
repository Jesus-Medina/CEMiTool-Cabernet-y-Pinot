import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  ExternalValidationRow,
  HubRow,
  M5Contrast,
  M5Profile,
  M5Sample,
  ProvenanceArtifact,
  ProvenancePayload,
} from '../data/siteData'
import { useM5ExplorerData } from '../hooks/useM5ExplorerData'
import { formatDecimal, formatScientific } from '../utils/format'
import M5NetworkExplorer from './M5NetworkExplorer'

const STAGES = ['FruitSet', 'Veraison', 'Harvest'] as const
const CULTIVARS = ['Cabernet Sauvignon', 'Pinot noir'] as const
const YEARS = [2012, 2013, 2014] as const
const NAC_GENE = 'VIT_12s0028g00860'
const CUAO_GENE = 'VIT_05s0020g03280'

type YearFilter = 'all' | 2012 | 2013 | 2014

function DataState({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) {
    return (
      <div className="data-state" role="status">
        <span className="data-state-dot" aria-hidden="true" />
        Cargando M5 desde datos canónicos…
      </div>
    )
  }

  if (error) {
    return (
      <div className="data-state data-state--error" role="alert">
        <strong>No se pudo construir el explorador M5.</strong>
        <span>{error}</span>
      </div>
    )
  }

  return null
}

function chartYExtent(
  profiles: M5Profile[],
  samples: M5Sample[],
  showReplicates: boolean,
) {
  const values = profiles.flatMap((row) => [row.Mean - row.SE, row.Mean + row.SE])
  if (showReplicates) {
    values.push(...samples.map((row) => row.M5))
  }

  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const span = Math.max(maximum - minimum, 1)
  return [minimum - span * 0.12, maximum + span * 0.12] as const
}

function TrajectorySvg({
  year,
  profiles,
  samples,
  showReplicates,
}: {
  year: number
  profiles: M5Profile[]
  samples: M5Sample[]
  showReplicates: boolean
}) {
  const yearProfiles = profiles.filter((row) => row.Year === year)
  const yearSamples = samples.filter((row) => row.Year === year)
  const [yMin, yMax] = chartYExtent(yearProfiles, yearSamples, showReplicates)
  const width = 720
  const height = 370
  const left = 74
  const right = 24
  const top = 30
  const bottom = 58
  const innerWidth = width - left - right
  const innerHeight = height - top - bottom
  const x = (stage: string) => {
    const index = STAGES.indexOf(stage as (typeof STAGES)[number])
    return left + (innerWidth * index) / (STAGES.length - 1)
  }
  const y = (value: number) => top + ((yMax - value) / (yMax - yMin)) * innerHeight
  const ticks = Array.from({ length: 5 }, (_, index) => yMin + ((yMax - yMin) * index) / 4)

  function cultivarRows(cultivar: string) {
    return STAGES.map((stage) =>
      yearProfiles.find((row) => row.Cultivar === cultivar && row.Stage === stage),
    ).filter((row): row is M5Profile => Boolean(row))
  }

  function linePath(rows: M5Profile[]) {
    return rows
      .map((row, index) => `${index === 0 ? 'M' : 'L'} ${x(row.Stage)} ${y(row.Mean)}`)
      .join(' ')
  }

  return (
    <div className="trajectory-chart-card">
      <div className="chart-card-header">
        <div>
          <p className="eyebrow">M5 trajectory</p>
          <h3>{year}</h3>
        </div>
        <div className="chart-legend" aria-label="Leyenda">
          <span><i className="legend-line legend-line--cabernet" />Cabernet Sauvignon</span>
          <span><i className="legend-line legend-line--pinot" />Pinot noir</span>
        </div>
      </div>

      <svg
        className="trajectory-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`m5-title-${year} m5-desc-${year}`}
      >
        <title id={`m5-title-${year}`}>Trayectoria del eigengene M5 en {year}</title>
        <desc id={`m5-desc-${year}`}>
          Medias y errores estándar por cultivar y etapa. Los puntos pequeños representan réplicas cuando están activadas.
        </desc>

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={width - right}
              y1={y(tick)}
              y2={y(tick)}
              className="chart-gridline"
            />
            <text x={left - 12} y={y(tick) + 4} textAnchor="end" className="chart-axis-label">
              {formatDecimal(tick, 1)}
            </text>
          </g>
        ))}

        {STAGES.map((stage) => (
          <g key={stage}>
            <line
              x1={x(stage)}
              x2={x(stage)}
              y1={top}
              y2={height - bottom}
              className="chart-stage-line"
            />
            <text x={x(stage)} y={height - 22} textAnchor="middle" className="chart-stage-label">
              {stage}
            </text>
          </g>
        ))}

        {showReplicates &&
          yearSamples.map((row) => {
            const jitter = (row.Replicate - 2) * 7
            return (
              <circle
                key={row.SampleName}
                cx={x(row.Stage) + jitter}
                cy={y(row.M5)}
                r="3.6"
                className={row.Cultivar === CULTIVARS[0] ? 'replicate-point replicate-point--cabernet' : 'replicate-point replicate-point--pinot'}
              >
                <title>{`${row.SampleName} · ${row.Cultivar} · ${row.Stage} · M5=${formatDecimal(row.M5, 2)}`}</title>
              </circle>
            )
          })}

        {CULTIVARS.map((cultivar) => {
          const rows = cultivarRows(cultivar)
          const isCabernet = cultivar === CULTIVARS[0]
          return (
            <g key={cultivar}>
              <path
                d={linePath(rows)}
                className={isCabernet ? 'trajectory-line trajectory-line--cabernet' : 'trajectory-line trajectory-line--pinot'}
              />
              {rows.map((row) => (
                <g key={`${cultivar}-${row.Stage}`}>
                  <line
                    x1={x(row.Stage)}
                    x2={x(row.Stage)}
                    y1={y(row.Mean - row.SE)}
                    y2={y(row.Mean + row.SE)}
                    className={isCabernet ? 'error-bar error-bar--cabernet' : 'error-bar error-bar--pinot'}
                  />
                  <line
                    x1={x(row.Stage) - 6}
                    x2={x(row.Stage) + 6}
                    y1={y(row.Mean - row.SE)}
                    y2={y(row.Mean - row.SE)}
                    className={isCabernet ? 'error-bar error-bar--cabernet' : 'error-bar error-bar--pinot'}
                  />
                  <line
                    x1={x(row.Stage) - 6}
                    x2={x(row.Stage) + 6}
                    y1={y(row.Mean + row.SE)}
                    y2={y(row.Mean + row.SE)}
                    className={isCabernet ? 'error-bar error-bar--cabernet' : 'error-bar error-bar--pinot'}
                  />
                  <circle
                    cx={x(row.Stage)}
                    cy={y(row.Mean)}
                    r="6"
                    className={isCabernet ? 'mean-point mean-point--cabernet' : 'mean-point mean-point--pinot'}
                  >
                    <title>
                      {cultivar} · {row.Stage} · media {formatDecimal(row.Mean, 2)} ± SE {formatDecimal(row.SE, 2)} · n={row.N}
                    </title>
                  </circle>
                </g>
              ))}
            </g>
          )
        })}

        {yMin < 0 && yMax > 0 && (
          <line x1={left} x2={width - right} y1={y(0)} y2={y(0)} className="zero-line" />
        )}

        <text
          x="18"
          y={top + innerHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 18 ${top + innerHeight / 2})`}
          className="chart-y-title"
        >
          Eigengene M5
        </text>
      </svg>
    </div>
  )
}

function downloadProfiles(rows: M5Profile[], yearFilter: YearFilter) {
  const header = ['Module', 'Cultivar', 'Stage', 'Year', 'Mean', 'SD', 'N', 'SE']
  const lines = [
    header.join(','),
    ...rows.map((row) =>
      [
        row.Module,
        row.Cultivar,
        row.Stage,
        row.Year,
        row.Mean,
        row.SD,
        row.N,
        row.SE,
      ]
        .map((value) => JSON.stringify(value))
        .join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `m5_trajectory_${yearFilter}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

function HarvestContrasts({ contrasts }: { contrasts: M5Contrast[] }) {
  const rows = contrasts
    .filter((row) => row.Stage === 'Harvest')
    .sort((a, b) => a.Year - b.Year)

  return (
    <section className="m5-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Harvest contrast</p>
          <h2>Cabernet Sauvignon − Pinot noir</h2>
        </div>
        <p>
          Estimaciones por año. Un valor negativo indica un eigengene M5 menor en Cabernet que en Pinot.
        </p>
      </div>
      <div className="contrast-grid">
        {rows.map((row) => (
          <article className="contrast-card" key={row.Year}>
            <span>{row.Year}</span>
            <strong>{formatDecimal(row.estimate, 2)}</strong>
            <p>
              IC95% {formatDecimal(row.CI_low_unadjusted, 2)} a {formatDecimal(row.CI_high_unadjusted, 2)}
            </p>
            <small>FDR global: {formatScientific(row.FDR_global_90)}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function hubLabel(row: HubRow) {
  if (row.Gene === NAC_GENE) return 'NAC'
  if (row.Gene === CUAO_GENE) return 'CuAO'
  if (row.V3_V5_STS_CHS_label_conflict) return 'CHS/STS'
  return null
}

function CandidateCard({
  title,
  gene,
  hub,
  externalRows,
}: {
  title: string
  gene: string
  hub: HubRow | undefined
  externalRows: ExternalValidationRow[]
}) {
  const primaryRows = externalRows.filter((row) => row.Gene === gene)
  const evaluable = primaryRows.filter((row) => row.Assayed && row.Complete_data)
  const supported = evaluable.filter(
    (row) =>
      row.Direction_matches_stable_primary === true &&
      row.BH_prespecified_top37 !== null &&
      row.BH_prespecified_top37 < 0.05,
  )

  return (
    <article className="candidate-card">
      <div className="candidate-card-top">
        <span className="candidate-name">{title}</span>
        <span className="rank-badge">#{hub?.Rank_kWithin ?? '—'} kWithin</span>
      </div>
      <code>{gene}</code>
      <dl>
        <div><dt>kWithin</dt><dd>{formatDecimal(hub?.kWithin, 3)}</dd></div>
        <div><dt>kME</dt><dd>{formatDecimal(hub?.kME_signed, 3)}</dd></div>
        <div><dt>Apoyo externo</dt><dd>{supported.length}/{evaluable.length} evaluables</dd></div>
      </dl>
      <p>
        {title === 'NAC'
          ? 'Factor de transcripción NAC anotado en ambas versiones. La centralidad lo prioriza como candidato; no demuestra regulación directa de CHS/STS.'
          : 'Copper amine oxidase priorizada como hub fuera del bloque CHS/STS. La función causal sobre el fenotipo no está demostrada.'}
      </p>
      <Link className="inline-link" to={`/genes/${gene}`}>Abrir ficha →</Link>
    </article>
  )
}

function HubsTable({ hubs }: { hubs: HubRow[] }) {
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const m5Hubs = useMemo(
    () =>
      hubs
        .filter((row) => row.Module === 'M5')
        .sort((a, b) => a.Rank_kWithin - b.Rank_kWithin),
    [hubs],
  )
  const normalized = query.trim().toLowerCase()
  const filtered = normalized
    ? m5Hubs.filter((row) => {
        const label = hubLabel(row)
        return row.Gene.toLowerCase().includes(normalized) || label?.toLowerCase().includes(normalized)
      })
    : m5Hubs
  const visible = showAll || normalized ? filtered : filtered.slice(0, 15)

  return (
    <section className="m5-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Hub ranking</p>
          <h2>Prioridad intramodular</h2>
        </div>
        <p>
          kWithin resume conectividad dentro de M5; no convierte al gen en regulador causal.
        </p>
      </div>

      <div className="table-toolbar">
        <label>
          <span>Buscar gen o etiqueta</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="VIT_… / NAC / CuAO / CHS"
          />
        </label>
        {!normalized && (
          <button className="button button--secondary" type="button" onClick={() => setShowAll((value) => !value)}>
            {showAll ? 'Mostrar top 15' : `Mostrar los ${m5Hubs.length}`}
          </button>
        )}
      </div>

      <div className="scientific-table-wrap">
        <table className="scientific-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Gen</th>
              <th>Señal</th>
              <th>kWithin</th>
              <th>kME</th>
              <th>Harvest 2012</th>
              <th>2013</th>
              <th>2014</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.Gene}>
                <td>{row.Rank_kWithin}</td>
                <td><Link to={`/genes/${row.Gene}`}><code>{row.Gene}</code></Link></td>
                <td>{hubLabel(row) ?? '—'}</td>
                <td>{formatDecimal(row.kWithin, 3)}</td>
                <td>{formatDecimal(row.kME_signed, 3)}</td>
                <td>{formatDecimal(row.Harvest_CS_minus_PN_2012, 2)}</td>
                <td>{formatDecimal(row.Harvest_CS_minus_PN_2013, 2)}</td>
                <td>{formatDecimal(row.Harvest_CS_minus_PN_2014, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">Mostrando {visible.length} de {filtered.length} genes M5.</p>
    </section>
  )
}

function AnnotationConflictPanel({ hubs }: { hubs: HubRow[] }) {
  const m5 = hubs.filter((row) => row.Module === 'M5')
  const conflicts = m5.filter((row) => row.V3_V5_STS_CHS_label_conflict === true)
  const topEleven = m5
    .filter((row) => row.Rank_kWithin <= 11)
    .filter((row) => row.V3_V5_STS_CHS_label_conflict === true)

  return (
    <section className="annotation-conflict">
      <div>
        <p className="eyebrow">CHS / STS annotation conflict</p>
        <h2>Una familia, etiquetas distintas entre versiones</h2>
        <p>
          Estos genes son etiquetados como stilbenoid en MapMan v3 y como CHS en v5.1,
          mientras comparten dominios CHS/STS. La web conserva la ambigüedad en lugar de
          elegir una enzima exacta sin evidencia suficiente.
        </p>
      </div>
      <div className="conflict-stats">
        <article><strong>{conflicts.length}</strong><span>genes M5 con conflicto v3/v5.1</span></article>
        <article><strong>{topEleven.length}</strong><span>entre los 11 hubs superiores</span></article>
      </div>
      <div className="gene-chip-list" aria-label="Genes CHS/STS con conflicto">
        {topEleven.map((row) => (
          <Link key={row.Gene} to={`/genes/${row.Gene}`}><code>{row.Gene}</code></Link>
        ))}
      </div>
    </section>
  )
}

function ProvenancePanel({
  provenance,
}: {
  provenance: ProvenancePayload
}) {
  const wanted = ['m5_trajectory', 'hubs', 'm5_network', 'external_validation']
  const artifacts = provenance.artifacts.filter((row) => wanted.includes(row.artifact_id))
  const commit = provenance.repository_commit

  function sourceUrl(path: string) {
    const ref = commit ?? 'main'
    return `https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot/blob/${ref}/${path}`
  }

  return (
    <section className="m5-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ⓘ Provenance</p>
          <h2>De la figura al archivo</h2>
        </div>
        <p>
          Commit científico/web exportado: <code>{commit?.slice(0, 12) ?? 'no disponible'}</code>
        </p>
      </div>
      <div className="provenance-grid">
        {artifacts.map((artifact: ProvenanceArtifact) => (
          <details className="provenance-card" key={artifact.artifact_id}>
            <summary>{artifact.artifact_id}</summary>
            <h3>Fuentes</h3>
            {artifact.sources.map((source) => (
              <p key={source.path}>
                <a href={sourceUrl(source.path)} target="_blank" rel="noreferrer">{source.path}</a>
                <small>SHA-256 {source.sha256.slice(0, 16)}…</small>
              </p>
            ))}
            <h3>Generado por</h3>
            {artifact.scripts.map((script) => (
              <p key={script.path}>
                <a href={sourceUrl(script.path)} target="_blank" rel="noreferrer">{script.path}</a>
              </p>
            ))}
          </details>
        ))}
      </div>
    </section>
  )
}

export default function M5Explorer() {
  const { trajectory, hubs, external, provenance, loading, error } = useM5ExplorerData()
  const [yearFilter, setYearFilter] = useState<YearFilter>('all')
  const [showReplicates, setShowReplicates] = useState(false)

  const filteredProfiles =
    trajectory?.profiles.filter((row) => yearFilter === 'all' || row.Year === yearFilter) ?? []

  const m5Hubs = hubs?.rows.filter((row) => row.Module === 'M5') ?? []
  const nacHub = m5Hubs.find((row) => row.Gene === NAC_GENE)
  const cuaoHub = m5Hubs.find((row) => row.Gene === CUAO_GENE)
  const yearsToRender = yearFilter === 'all' ? [...YEARS] : [yearFilter]

  return (
    <div className="m5-explorer">
      <section className="m5-hero">
        <div>
          <p className="eyebrow">M5 Explorer</p>
          <h1>M5 · fenoles, hubs y trayectoria interanual</h1>
          <p>
            Primera vista científica interactiva del sitio. Las curvas, contrastes,
            rankings y validaciones se cargan desde los JSON reconstruidos a partir de tablas canónicas.
          </p>
        </div>
        <div className="m5-hero-facts">
          <span><strong>{m5Hubs.length || '—'}</strong> genes</span>
          <span><strong>β=10</strong> red principal</span>
          <span><strong>{trajectory?.contrasts.filter((row) => row.Stage === 'Harvest').length ?? '—'}</strong> contrastes Harvest</span>
        </div>
      </section>

      <DataState loading={loading} error={error} />

      <div className="m5-crosslink">
        <span>Sigue la evidencia de M5 hacia función y piel aislada.</span>
        <div className="m5-crosslink-actions">
          <Link className="button button--secondary" to="/enrichment">Enriquecimiento funcional</Link>
          <Link className="button button--secondary" to="/validation">Validación en piel</Link>
        </div>
      </div>

      {trajectory && hubs && external && provenance && (
        <>
          <section className="m5-section">
            <div className="section-heading section-heading--controls">
              <div>
                <p className="eyebrow">Trajectory</p>
                <h2>Eigengene M5 por etapa y año</h2>
              </div>
              <div className="chart-controls">
                <fieldset>
                  <legend>Año</legend>
                  <div className="segmented-control">
                    {(['all', 2012, 2013, 2014] as const).map((year) => (
                      <button
                        type="button"
                        key={year}
                        className={yearFilter === year ? 'segment segment--active' : 'segment'}
                        onClick={() => setYearFilter(year)}
                        aria-pressed={yearFilter === year}
                      >
                        {year === 'all' ? 'Todos' : year}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="check-control">
                  <input
                    type="checkbox"
                    checked={showReplicates}
                    onChange={(event) => setShowReplicates(event.target.checked)}
                  />
                  <span>Mostrar réplicas</span>
                </label>
              </div>
            </div>

            <div className={yearsToRender.length > 1 ? 'trajectory-grid trajectory-grid--multi' : 'trajectory-grid'}>
              {yearsToRender.map((year) => (
                <TrajectorySvg
                  key={year}
                  year={year}
                  profiles={trajectory.profiles}
                  samples={trajectory.samples}
                  showReplicates={showReplicates}
                />
              ))}
            </div>

            <div className="chart-data-actions">
              <details>
                <summary>Ver datos mostrados</summary>
                <div className="scientific-table-wrap">
                  <table className="scientific-table scientific-table--compact">
                    <thead>
                      <tr><th>Año</th><th>Cultivar</th><th>Etapa</th><th>Media</th><th>SE</th><th>N</th></tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map((row) => (
                        <tr key={`${row.Year}-${row.Cultivar}-${row.Stage}`}>
                          <td>{row.Year}</td><td>{row.Cultivar}</td><td>{row.Stage}</td>
                          <td>{formatDecimal(row.Mean, 3)}</td><td>{formatDecimal(row.SE, 3)}</td><td>{row.N}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => downloadProfiles(filteredProfiles, yearFilter)}
              >
                Descargar datos mostrados
              </button>
            </div>
          </section>

          <HarvestContrasts contrasts={trajectory.contrasts} />

          <section className="m5-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Candidate hubs</p>
                <h2>Dos candidatos destacados fuera del bloque ambiguo</h2>
              </div>
              <p>
                Las fichas combinan centralidad interna y señal externa, sin convertir asociación en mecanismo.
              </p>
            </div>
            <div className="candidate-grid">
              <CandidateCard
                title="NAC"
                gene={NAC_GENE}
                hub={nacHub}
                externalRows={external.rows}
              />
              <CandidateCard
                title="CuAO"
                gene={CUAO_GENE}
                hub={cuaoHub}
                externalRows={external.rows}
              />
            </div>
          </section>

          <AnnotationConflictPanel hubs={hubs.rows} />
          <M5NetworkExplorer hubs={hubs.rows} provenance={provenance} />
          <HubsTable hubs={hubs.rows} />
          <ProvenancePanel provenance={provenance} />
        </>
      )}
    </div>
  )
}
