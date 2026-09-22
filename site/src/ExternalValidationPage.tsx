import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  loadExternalValidation,
  loadProvenance,
  type ExternalValidationPayload,
  type ExternalValidationRow,
  type ProvenancePayload,
} from './data/siteData'
import { formatDecimal, formatScientific } from './utils/format'
import './validation.css'

type DatasetId = 'GSE72421' | 'PRJNA260535'
type ModuleFilter = 'all' | 'M5' | 'M10' | 'M2'
type StatusFilter = 'all' | 'evaluable' | 'fdr' | 'concordant'

const DATASETS: DatasetId[] = ['GSE72421', 'PRJNA260535']
const MODULES: ModuleFilter[] = ['all', 'M5', 'M10', 'M2']
const NAC_GENE = 'VIT_12s0028g00860'
const CUAO_GENE = 'VIT_05s0020g03280'

function averageBaseline(row: ExternalValidationRow) {
  return row.Baseline_Harvest_mean_2012_2014
}

function datasetLabel(dataset: DatasetId) {
  return dataset === 'GSE72421' ? 'GSE72421 · microarray' : 'PRJNA260535 · RNA-seq'
}

function moduleClass(module: string) {
  if (module === 'M5') return 'validation-point--m5'
  if (module === 'M10') return 'validation-point--m10'
  return 'validation-point--m2'
}

function Scatter({ rows, dataset }: { rows: ExternalValidationRow[]; dataset: DatasetId }) {
  const plottable = rows.filter(
    (row) => row.Complete_data && row.Mean_CS_minus_PN !== null && averageBaseline(row) !== null,
  )

  if (plottable.length === 0) {
    return <p className="validation-empty">No hay genes evaluables bajo estos filtros.</p>
  }

  const width = 780
  const height = 500
  const left = 78
  const right = 28
  const top = 28
  const bottom = 72
  const xValues = plottable.map((row) => averageBaseline(row) as number)
  const yValues = plottable.map((row) => row.Mean_CS_minus_PN as number)
  const xAbs = Math.max(...xValues.map(Math.abs), 1) * 1.12
  const yAbs = Math.max(...yValues.map(Math.abs), 1) * 1.12
  const innerWidth = width - left - right
  const innerHeight = height - top - bottom
  const x = (value: number) => left + ((value + xAbs) / (2 * xAbs)) * innerWidth
  const y = (value: number) => top + ((yAbs - value) / (2 * yAbs)) * innerHeight
  const xTicks = [-xAbs, -xAbs / 2, 0, xAbs / 2, xAbs]
  const yTicks = [-yAbs, -yAbs / 2, 0, yAbs / 2, yAbs]

  function point(row: ExternalValidationRow) {
    const px = x(averageBaseline(row) as number)
    const py = y(row.Mean_CS_minus_PN as number)
    const significant = row.BH_prespecified_top37 !== null && row.BH_prespecified_top37 < 0.05
    const cls = 'validation-point ' + moduleClass(row.Module) + (significant ? ' validation-point--sig' : '')
    const concordance =
      row.Direction_matches_stable_primary === true
        ? 'sí'
        : row.Direction_matches_stable_primary === false
          ? 'no'
          : 'NA'
    const title =
      row.Gene + ' · ' + row.Module +
      ' · baseline mean=' + formatDecimal(averageBaseline(row), 2) +
      ' · external=' + formatDecimal(row.Mean_CS_minus_PN, 2) +
      ' · BH37=' + formatScientific(row.BH_prespecified_top37) +
      ' · concordancia=' + concordance

    if (row.Module === 'M10') {
      return <rect key={row.Gene} x={px - 6} y={py - 6} width="12" height="12" className={cls}><title>{title}</title></rect>
    }
    if (row.Module === 'M2') {
      const d = 'M ' + px + ' ' + (py - 7) + ' L ' + (px + 7) + ' ' + py + ' L ' + px + ' ' + (py + 7) + ' L ' + (px - 7) + ' ' + py + ' Z'
      return <path key={row.Gene} d={d} className={cls}><title>{title}</title></path>
    }
    return <circle key={row.Gene} cx={px} cy={py} r="6.5" className={cls}><title>{title}</title></circle>
  }

  const titleId = 'validation-scatter-title-' + dataset
  const descId = 'validation-scatter-desc-' + dataset

  return (
    <div className="validation-scatter-wrap">
      <svg className="validation-scatter" viewBox={'0 0 ' + width + ' ' + height} role="img" aria-labelledby={titleId + ' ' + descId}>
        <title id={titleId}>Concordancia direccional entre baseline y {dataset}</title>
        <desc id={descId}>
          El eje X usa la media descriptiva de los efectos Harvest Cabernet menos Pinot de 2012, 2013 y 2014. El eje Y usa el efecto externo. Solo se compara la dirección; las magnitudes no son equivalentes entre plataformas.
        </desc>

        {xTicks.map((tick, index) => (
          <g key={'x-' + index}>
            <line x1={x(tick)} x2={x(tick)} y1={top} y2={height - bottom} className="validation-grid" />
            <text x={x(tick)} y={height - bottom + 24} textAnchor="middle" className="validation-axis-text">{formatDecimal(tick, 1)}</text>
          </g>
        ))}
        {yTicks.map((tick, index) => (
          <g key={'y-' + index}>
            <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="validation-grid" />
            <text x={left - 12} y={y(tick) + 4} textAnchor="end" className="validation-axis-text">{formatDecimal(tick, 1)}</text>
          </g>
        ))}

        <rect x={left} y={top} width={x(0) - left} height={y(0) - top} className="discordant-quadrant" />
        <rect x={x(0)} y={y(0)} width={width - right - x(0)} height={height - bottom - y(0)} className="discordant-quadrant" />
        <line x1={x(0)} x2={x(0)} y1={top} y2={height - bottom} className="validation-zero" />
        <line x1={left} x2={width - right} y1={y(0)} y2={y(0)} className="validation-zero" />

        {plottable.map(point)}

        <text x={left + innerWidth / 2} y={height - 18} textAnchor="middle" className="validation-axis-title">
          Baseline pericarpio · media descriptiva Harvest CS−PN 2012/13/14
        </text>
        <text
          x="20"
          y={top + innerHeight / 2}
          textAnchor="middle"
          transform={'rotate(-90 20 ' + (top + innerHeight / 2) + ')'}
          className="validation-axis-title"
        >
          {dataset === 'GSE72421' ? 'Piel microarray · CS−PN' : 'Piel RNA-seq log2CPM · CS−PN'}
        </text>
      </svg>
      <p className="scatter-caution">
        Los ejes usan escalas de expresión diferentes. Los cuadrantes sirven para leer <strong>signo/concordancia</strong>;
        no hay línea y=x porque la cercanía de magnitudes no es interpretable entre plataformas.
      </p>
    </div>
  )
}

function Provenance({ provenance }: { provenance: ProvenancePayload }) {
  const artifact = provenance.artifacts.find((row) => row.artifact_id === 'external_validation')
  if (!artifact) return null

  const commit = provenance.repository_commit ?? 'main'
  const sourceUrl = (path: string) =>
    'https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot/blob/' + commit + '/' + path

  return (
    <details className="validation-provenance">
      <summary>ⓘ Provenance de validación externa</summary>
      <div className="validation-provenance-grid">
        <div>
          <h3>Fuentes</h3>
          {artifact.sources.map((source) => (
            <p key={source.path}>
              <a href={sourceUrl(source.path)} target="_blank" rel="noreferrer">{source.path}</a>
              <small>SHA-256 {source.sha256.slice(0, 16)}…</small>
            </p>
          ))}
        </div>
        <div>
          <h3>Scripts</h3>
          {artifact.scripts.map((script) => (
            <p key={script.path}>
              <a href={sourceUrl(script.path)} target="_blank" rel="noreferrer">{script.path}</a>
            </p>
          ))}
          <p><strong>Commit:</strong> <code>{commit.slice(0, 12)}</code></p>
        </div>
      </div>
    </details>
  )
}

export default function ExternalValidationPage() {
  const [data, setData] = useState<ExternalValidationPayload | null>(null)
  const [provenance, setProvenance] = useState<ProvenancePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataset, setDataset] = useState<DatasetId>('GSE72421')
  const [module, setModule] = useState<ModuleFilter>('M5')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([loadExternalValidation(), loadProvenance()])
      .then(([external, prov]) => {
        if (!active) return
        setData(external)
        setProvenance(prov)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Error al cargar T-007')
      })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase()
    return data.rows
      .filter((row) => row.Dataset === dataset)
      .filter((row) => module === 'all' || row.Module === module)
      .filter((row) => {
        if (status === 'evaluable') return row.Assayed && row.Complete_data
        if (status === 'fdr') return row.BH_prespecified_top37 !== null && row.BH_prespecified_top37 < 0.05
        if (status === 'concordant') return row.Direction_matches_stable_primary === true
        return true
      })
      .filter((row) => !normalized || row.Gene.toLowerCase().includes(normalized))
      .sort((a, b) => {
        if (a.Module !== b.Module) return a.Module.localeCompare(b.Module, undefined, { numeric: true })
        return a.Rank_kWithin - b.Rank_kWithin
      })
  }, [data, dataset, module, status, query])

  if (!data && !error) {
    return <div className="data-state" role="status"><span className="data-state-dot" />Cargando T-007 desde datos canónicos…</div>
  }
  if (error || !data) {
    return <div className="data-state data-state--error" role="alert"><strong>No se pudo cargar T-007.</strong><span>{error}</span></div>
  }

  const datasetInfo = data.datasets[dataset]
  const primarySummary = data.module_summary.filter(
    (row) =>
      row.Dataset === dataset &&
      row.Condition === datasetInfo.primary_condition &&
      (module === 'all' || row.Module === module),
  )
  const summaryTotals = primarySummary.reduce(
    (acc, row) => ({
      top: acc.top + row.Top_hubs,
      assayed: acc.assayed + row.Assayed_top_hubs,
      complete: acc.complete + row.Complete_data_top_hubs,
      concordant: acc.concordant + row.Direction_matched_stable_top_hubs,
      fdr: acc.fdr + row.Top_hubs_BH37_lt_005,
    }),
    { top: 0, assayed: 0, complete: 0, concordant: 0, fdr: 0 },
  )
  const nonEvaluable = filtered.filter((row) => !row.Assayed || !row.Complete_data)

  return (
    <div className="validation-page">
      <section className="validation-hero">
        <div>
          <p className="eyebrow">WEB-008 · T-007 skin-only evidence</p>
          <h1>Validación externa en piel aislada</h1>
          <p>
            Dos ensayos externos preguntan si candidatos preseleccionados conservan la dirección Cabernet Sauvignon − Pinot noir
            observada en Harvest. Son evidencia observacional separada del baseline, no nuevas réplicas de GSE98923.
          </p>
        </div>
        <div className="external-badge">FUENTE EXTERNA · NO SUMA AL N=54</div>
      </section>

      <section className="dataset-separation" aria-label="Fuentes externas separadas">
        {DATASETS.map((id, index) => {
          const info = data.datasets[id]
          return (
            <button
              type="button"
              key={id}
              className={dataset === id ? 'dataset-card dataset-card--active' : 'dataset-card'}
              onClick={() => setDataset(id)}
            >
              <span>EXTERNAL {index + 1}</span>
              <strong>{info.label}</strong>
              <small>{info.platform} · {info.year} · {info.tissue}</small>
              <p>
                Primaria: {id === 'PRJNA260535' ? info.primary_condition + ' °Brix' : info.primary_condition}
                {' · '}n={info.primary_target_samples} Cabernet/Pinot
              </p>
            </button>
          )
        })}
      </section>

      <section className="validation-controls">
        <div className="validation-control-group">
          <span>Módulo</span>
          <div className="segmented-control">
            {MODULES.map((item) => (
              <button
                type="button"
                key={item}
                className={module === item ? 'segment segment--active' : 'segment'}
                onClick={() => setModule(item)}
              >
                {item === 'all' ? 'Todos' : item}
              </button>
            ))}
          </div>
        </div>
        <label>
          <span>Estado</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
            <option value="all">Todos los hubs</option>
            <option value="evaluable">Evaluables</option>
            <option value="fdr">BH top-37 &lt; 0,05</option>
            <option value="concordant">Dirección concordante</option>
          </select>
        </label>
        <label className="validation-search">
          <span>Buscar gen</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="VIT_…" />
        </label>
      </section>

      <section className="validation-summary-grid">
        <article><span>Hubs preseleccionados</span><strong>{summaryTotals.top}</strong><small>de {module === 'all' ? 'M5+M10+M2' : module}</small></article>
        <article><span>Evaluables</span><strong>{summaryTotals.complete}/{summaryTotals.top}</strong><small>datos completos en condición primaria</small></article>
        <article><span>Concordantes</span><strong>{summaryTotals.concordant}</strong><small>solo donde Harvest primario tenía signo estable</small></article>
        <article><span>BH top-37 &lt;0,05</span><strong>{summaryTotals.fdr}</strong><small>familia preespecificada de 37 hubs</small></article>
      </section>

      <section className="validation-main">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sign concordance</p>
            <h2>{datasetLabel(dataset)} · {module === 'all' ? 'M5 + M10 + M2' : module}</h2>
          </div>
          <p>
            X = media descriptiva de los tres efectos gene-level Harvest del baseline. Y = efecto de la fuente externa.
            La gráfica no combina ni reescala plataformas.
          </p>
        </div>
        <div className="validation-legend">
          <span><i className="shape shape--circle" />M5</span>
          <span><i className="shape shape--square" />M10</span>
          <span><i className="shape shape--diamond" />M2</span>
          <span><i className="shape shape--bold" />BH top-37 &lt;0,05</span>
        </div>
        <Scatter rows={filtered} dataset={dataset} />
      </section>

      <section className="validation-table-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hub-level evidence</p>
            <h2>Genes bajo los filtros actuales</h2>
          </div>
          <p>{filtered.length} filas · {nonEvaluable.length} no evaluables/incompletas.</p>
        </div>
        <div className="scientific-table-wrap">
          <table className="scientific-table validation-table">
            <thead>
              <tr>
                <th>Módulo</th><th>Rank</th><th>Gen</th><th>Baseline mean</th><th>Externo CS−PN</th>
                <th>BH37</th><th>BH361</th><th>Concordancia</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={[row.Dataset, row.Module, row.Gene].join('-')} className={row.Gene === NAC_GENE || row.Gene === CUAO_GENE ? 'validation-highlight-row' : ''}>
                  <td>{row.Module}</td>
                  <td>{row.Rank_kWithin}</td>
                  <td><Link to={'/genes/' + row.Gene}><code>{row.Gene}</code></Link>{row.Gene === NAC_GENE ? ' · NAC' : row.Gene === CUAO_GENE ? ' · CuAO' : ''}</td>
                  <td>{formatDecimal(averageBaseline(row), 2)}</td>
                  <td>{formatDecimal(row.Mean_CS_minus_PN, 2)}</td>
                  <td>{formatScientific(row.BH_prespecified_top37)}</td>
                  <td>{formatScientific(row.BH_priority_361)}</td>
                  <td>{row.Direction_matches_stable_primary === true ? 'Sí' : row.Direction_matches_stable_primary === false ? 'No' : '—'}</td>
                  <td>{row.Assayed && row.Complete_data ? 'Evaluable' : row.Assayed ? 'Incompleto' : 'No evaluable'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="platform-limits">
        <article>
          <p className="eyebrow">GSE72421 · microarray</p>
          <h2>Una sonda “única” no elimina hibridación cruzada</h2>
          <p>
            La comparación principal WW usa piel cerca de 24 °Brix. Celdas faltantes no se imputan y una familia paráloga
            como CHS/STS puede seguir siendo difícil de resolver mediante sondas.
          </p>
        </article>
        <article>
          <p className="eyebrow">PRJNA260535 · RNA-seq</p>
          <h2>Ausente del archivo filtrado ≠ expresión cero</h2>
          <p>
            La comparación principal usa 24 °Brix. El archivo publicado fue filtrado y usa PN40024 V1;
            genes ausentes quedan no evaluables y la referencia no resuelve por sí sola paralogía o sesgo de mapeo.
          </p>
        </article>
      </section>

      <section className="validation-boundary">
        <div>
          <p className="eyebrow">Qué apoya</p>
          <h2>Concordancia observacional de expresión en piel</h2>
          <p>
            Para candidatos evaluables, el signo y la FDR permiten preguntar si una señal preseleccionada aparece también en piel aislada.
          </p>
        </div>
        <div>
          <p className="eyebrow">Qué no prueba</p>
          <h2>No es metaanálisis, causalidad ni grosor de piel</h2>
          <p>
            Año, tejido, maduración, tratamiento y plataforma difieren. Tampoco demuestra actividad enzimática, regulación directa ni identidad CHS frente a STS.
          </p>
        </div>
      </section>

      <section className="validation-next">
        <div>
          <p className="eyebrow">Conexión con T-008</p>
          <h2>La siguiente capa es revisar la robustez de procesamiento</h2>
          <p>
            Los extremos de M2 y las familias parálogas de M5 son precisamente el tipo de señal que el reprocesamiento FASTQ moderno debe revisar sin sustituir el baseline histórico.
          </p>
        </div>
        <Link className="button button--primary" to="/t008">Abrir T-008</Link>
      </section>

      {provenance && <Provenance provenance={provenance} />}
    </div>
  )
}
