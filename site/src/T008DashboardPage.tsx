import { useEffect, useMemo, useState } from 'react'
import {
  loadProvenance,
  loadT008Progress,
  type ProvenancePayload,
  type T008ProgressPayload,
  type T008Run,
  type T008RunStatus,
} from './data/siteData'
import { formatDecimal } from './utils/format'
import './t008.css'

type StatusFilter = 'all' | T008RunStatus
type CultivarFilter = 'all' | 'Cabernet Sauvignon' | 'Pinot noir'
type StageFilter = 'all' | 'FruitSet' | 'Veraison' | 'Harvest'

const CULTIVARS: CultivarFilter[] = ['all', 'Cabernet Sauvignon', 'Pinot noir']
const STAGES: StageFilter[] = ['all', 'FruitSet', 'Veraison', 'Harvest']
const STATUS_ORDER: T008RunStatus[] = ['PASS', 'FAIL', 'IN_PROGRESS', 'PENDING']

function bytesToGB(bytes: number) {
  return bytes / 1_000_000_000
}

function billions(value: number) {
  return value / 1_000_000_000
}

function shortDate(value: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('es-CL', {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZoneName: 'short',
  })
}

function statusLabel(status: T008RunStatus) {
  if (status === 'PASS') return 'PASS'
  if (status === 'FAIL') return 'FAIL'
  if (status === 'IN_PROGRESS') return 'EN PROGRESO'
  return 'PENDIENTE'
}

function statusClass(status: T008RunStatus) {
  return 't008-status t008-status--' + status.toLowerCase().replace('_', '-')
}

function DesignMatrix({ runs }: { runs: T008Run[] }) {
  return (
    <section className="t008-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Cobertura del diseño</p>
          <h2>¿Qué celdas del 2×3×3 ya tienen QC moderno?</h2>
        </div>
        <p>Cada cultivar×etapa contiene 9 corridas: 3 años × 3 réplicas.</p>
      </div>
      <div className="t008-design-grid">
        {(['Cabernet Sauvignon', 'Pinot noir'] as const).flatMap((cultivar) =>
          (['FruitSet', 'Veraison', 'Harvest'] as const).map((stage) => {
            const cell = runs.filter((run) => run.cultivar === cultivar && run.stage === stage)
            const pass = cell.filter((run) => run.status === 'PASS').length
            const fail = cell.filter((run) => run.status === 'FAIL').length
            const progress = cell.filter((run) => run.status === 'IN_PROGRESS').length
            return (
              <article key={cultivar + '-' + stage}>
                <span>{cultivar}</span>
                <h3>{stage}</h3>
                <strong>{pass}/{cell.length}</strong>
                <div className="t008-mini-progress" aria-label={String(pass) + ' de ' + String(cell.length) + ' validadas'}>
                  <i style={{ width: String((100 * pass) / Math.max(cell.length, 1)) + '%' }} />
                </div>
                <small>{fail > 0 ? String(fail) + ' FAIL' : progress > 0 ? String(progress) + ' en progreso' : 'QC PASS'}</small>
              </article>
            )
          }),
        )}
      </div>
    </section>
  )
}

function Provenance({ provenance }: { provenance: ProvenancePayload }) {
  const artifact = provenance.artifacts.find((row) => row.artifact_id === 't008_progress')
  if (!artifact) return null
  const commit = provenance.repository_commit ?? 'main'
  const sourceUrl = (path: string) =>
    'https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot/blob/' + commit + '/' + path

  return (
    <details className="t008-provenance">
      <summary>ⓘ Provenance del tablero T-008</summary>
      <div className="t008-provenance-grid">
        <div>
          <h3>Fuentes canónicas</h3>
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
            <p key={script.path}><a href={sourceUrl(script.path)} target="_blank" rel="noreferrer">{script.path}</a></p>
          ))}
          <p><strong>Commit:</strong> <code>{commit.slice(0, 12)}</code></p>
        </div>
      </div>
    </details>
  )
}

export default function T008DashboardPage() {
  const [data, setData] = useState<T008ProgressPayload | null>(null)
  const [provenance, setProvenance] = useState<ProvenancePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [cultivar, setCultivar] = useState<CultivarFilter>('all')
  const [stage, setStage] = useState<StageFilter>('all')
  const [year, setYear] = useState<'all' | 2012 | 2013 | 2014>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([loadT008Progress(), loadProvenance()])
      .then(([progress, prov]) => {
        if (!active) return
        setData(progress)
        setProvenance(prov)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Error al cargar T-008')
      })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase()
    return data.runs
      .filter((run) => status === 'all' || run.status === status)
      .filter((run) => cultivar === 'all' || run.cultivar === cultivar)
      .filter((run) => stage === 'all' || run.stage === stage)
      .filter((run) => year === 'all' || run.year === year)
      .filter((run) => !normalized || run.sra_run.toLowerCase().includes(normalized) || run.gsm.toLowerCase().includes(normalized))
  }, [data, status, cultivar, stage, year, query])

  if (!data && !error) {
    return <div className="data-state" role="status"><span className="data-state-dot" />Cargando progreso T-008…</div>
  }
  if (error || !data) {
    return <div className="data-state data-state--error" role="alert"><strong>No se pudo cargar T-008.</strong><span>{error}</span></div>
  }

  const summary = data.summary
  const validated = data.runs.filter((run) => run.status === 'PASS')
  const recentEvents = [...data.events].reverse().slice(0, 14)

  return (
    <div className="t008-page">
      <section className="t008-hero">
        <div>
          <p className="eyebrow">WEB-009 · modern raw-read reprocessing</p>
          <h1>T-008 · estado vivo del reprocesamiento</h1>
          <p>
            Las mismas 54 corridas del baseline histórico se cuantifican contra PN40024 T2T v5.1 con Salmon.
            Este tablero refleja el ledger versionado y los QC por corrida; no ejecuta ni infiere análisis en el navegador.
          </p>
        </div>
        <div className="t008-big-number">
          <strong>{summary.validated_runs}/{summary.total_runs}</strong>
          <span>corridas validadas</span>
        </div>
      </section>

      <section className={summary.complete ? 't008-gate t008-gate--complete' : 't008-gate'}>
        <div>
          <p className="eyebrow">{summary.complete ? 'QC de corridas completo' : 'Gate científico activo'}</p>
          <h2>{summary.complete ? '54/54 permite pasar a ensamblaje, no a una conclusión automática' : 'Todavía no existe matriz moderna completa'}</h2>
          <p>
            {summary.complete
              ? 'El tablero solo confirma que las corridas pasaron QC. La matriz, normalización y comparación de módulos siguen siendo pasos científicos separados.'
              : 'Mientras falte una sola corrida validada, la web no presenta preservación moderna de M5/M10/M2 ni contrasta cultivares con esta cuantificación.'}
          </p>
        </div>
        <span className="t008-gate-badge">{summary.complete ? 'RUN QC COMPLETE' : 'NO PRESERVATION CLAIM'}</span>
      </section>

      <section className="t008-progress-panel">
        <div className="t008-progress-top">
          <div>
            <span>Progreso QC</span>
            <strong>{formatDecimal(summary.progress_percent, 1)}%</strong>
          </div>
          <p>Último checkpoint: {shortDate(summary.latest_event_utc)}</p>
        </div>
        <div className="t008-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.progress_percent}>
          <span style={{ width: String(summary.progress_percent) + '%' }} />
        </div>
        <div className="t008-status-grid">
          {STATUS_ORDER.map((item) => {
            const value =
              item === 'PASS' ? summary.validated_runs :
              item === 'FAIL' ? summary.failed_runs :
              item === 'IN_PROGRESS' ? summary.in_progress_runs :
              summary.pending_runs
            return <article key={item}><span className={statusClass(item)}>{statusLabel(item)}</span><strong>{value}</strong></article>
          })}
        </div>
      </section>

      <section className="t008-scale-grid">
        <article>
          <span>FASTQ seleccionados</span>
          <strong>{formatDecimal(bytesToGB(summary.total_fastq_bytes), 2)} GB</strong>
          <small>bytes comprimidos declarados por ENA</small>
        </article>
        <article>
          <span>Lecturas declaradas</span>
          <strong>{formatDecimal(billions(summary.total_reads), 3)} B</strong>
          <small>en las 54 corridas congeladas</small>
        </article>
        <article>
          <span>Salmon validado</span>
          <strong>{validated[0]?.salmon_version ?? '—'}</strong>
          <small>versión observada en QC PASS</small>
        </article>
        <article>
          <span>Mapping PASS</span>
          <strong>{formatDecimal(summary.mapping_percent_mean, 2)}%</strong>
          <small>rango {formatDecimal(summary.mapping_percent_min, 2)}–{formatDecimal(summary.mapping_percent_max, 2)}%</small>
        </article>
      </section>

      <DesignMatrix runs={data.runs} />

      <section className="t008-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">QC validado</p>
            <h2>Corridas que ya cerraron el pipeline</h2>
          </div>
          <p>Mapping y recuentos son métricas técnicas por biblioteca, no evidencia de preservación de módulos.</p>
        </div>
        <div className="t008-pass-grid">
          {validated.map((run) => (
            <article key={run.sra_run}>
              <div className="t008-run-heading">
                <div><span>{run.gsm}</span><h3>{run.sra_run}</h3></div>
                <span className={statusClass(run.status)}>{run.status}</span>
              </div>
              <dl>
                <div><dt>Diseño</dt><dd>{run.cultivar} · {run.stage} {run.year} · rep {run.replicate}</dd></div>
                <div><dt>Mapping</dt><dd>{formatDecimal(run.percent_mapped, 2)}%</dd></div>
                <div><dt>Reads</dt><dd>{run.read_count.toLocaleString('es-CL')}</dd></div>
                <div><dt>Procesados</dt><dd>{run.processed_fragments?.toLocaleString('es-CL') ?? '—'}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="t008-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">54-run ledger</p>
            <h2>Manifiesto y estado por corrida</h2>
          </div>
          <p>{filtered.length} corridas bajo los filtros actuales.</p>
        </div>

        <div className="t008-filters">
          <label><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
            <option value="all">Todos</option>{STATUS_ORDER.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
          </select></label>
          <label><span>Cultivar</span><select value={cultivar} onChange={(event) => setCultivar(event.target.value as CultivarFilter)}>
            {CULTIVARS.map((item) => <option key={item} value={item}>{item === 'all' ? 'Todos' : item}</option>)}
          </select></label>
          <label><span>Etapa</span><select value={stage} onChange={(event) => setStage(event.target.value as StageFilter)}>
            {STAGES.map((item) => <option key={item} value={item}>{item === 'all' ? 'Todas' : item}</option>)}
          </select></label>
          <label><span>Año</span><select value={year} onChange={(event) => setYear(event.target.value === 'all' ? 'all' : Number(event.target.value) as 2012 | 2013 | 2014)}>
            <option value="all">Todos</option><option value="2012">2012</option><option value="2013">2013</option><option value="2014">2014</option>
          </select></label>
          <label className="t008-search"><span>SRR / GSM</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="SRR556…" /></label>
        </div>

        <div className="scientific-table-wrap">
          <table className="scientific-table t008-table">
            <thead><tr><th>Estado</th><th>SRR</th><th>GSM</th><th>Cultivar</th><th>Etapa</th><th>Año</th><th>Rep</th><th>Mapping</th><th>Últimas etapas registradas</th></tr></thead>
            <tbody>
              {filtered.map((run) => (
                <tr key={run.sra_run}>
                  <td><span className={statusClass(run.status)}>{statusLabel(run.status)}</span></td>
                  <td><code>{run.sra_run}</code></td>
                  <td><code>{run.gsm}</code></td>
                  <td>{run.cultivar}</td><td>{run.stage}</td><td>{run.year}</td><td>{run.replicate}</td>
                  <td>{run.percent_mapped === null ? '—' : formatDecimal(run.percent_mapped, 2) + '%'}</td>
                  <td>{Object.entries(run.pipeline_stages).length === 0 ? '—' : Object.entries(run.pipeline_stages).map(([key, value]) => key + ':' + value).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="t008-section">
        <div className="section-heading">
          <div><p className="eyebrow">Event log</p><h2>Últimos checkpoints versionados</h2></div>
          <p>Se muestran eventos del ledger, incluyendo controles globales del lote.</p>
        </div>
        <ol className="t008-events">
          {recentEvents.map((event, index) => (
            <li key={event.UTC + '-' + event.SRA_Run + '-' + event.Stage + '-' + String(index)}>
              <time>{shortDate(event.UTC)}</time>
              <code>{event.SRA_Run}</code>
              <strong>{event.Stage}</strong>
              <span className={'event-status event-status--' + event.Status.toLowerCase()}>{event.Status}</span>
              <small>{event.Detail === null ? '—' : String(event.Detail)}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="t008-boundary">
        <article>
          <p className="eyebrow">Qué sí refleja</p>
          <h2>Estado técnico reproducible de las mismas 54 lecturas</h2>
          <p>Descarga verificada, QC, cuantificación y métricas por corrida aparecen cuando existen en los archivos canónicos.</p>
        </article>
        <article>
          <p className="eyebrow">Qué no refleja todavía</p>
          <h2>No hay contraste moderno ni módulo preservado/perdido</h2>
          <p>El material continúa siendo pericarpio. Completar FASTQ/Salmon es requisito previo, no una conclusión biológica.</p>
        </article>
      </section>

      {provenance && <Provenance provenance={provenance} />}
    </div>
  )
}
