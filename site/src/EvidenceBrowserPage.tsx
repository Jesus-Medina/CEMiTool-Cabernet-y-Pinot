import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  loadProvenance,
  type ProvenanceArtifact,
  type ProvenancePayload,
} from './data/siteData'
import './evidence.css'

const REPO = 'https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot'

type EvidenceClaim = {
  id: string
  title: string
  description: string
  artifactIds: string[]
  route: string
  boundary: string
}

const CLAIMS: EvidenceClaim[] = [
  {
    id: 'baseline-design',
    title: 'Diseño balanceado y red beta10',
    description: 'Trazabilidad del diseño de 54 muestras, metadata y diagnóstico de la red principal.',
    artifactIds: ['project_summary', 'modules'],
    route: '/',
    boundary: 'El baseline usa pericarpio, no piel aislada, y no mide grosor de piel.',
  },
  {
    id: 'module-effects',
    title: 'Efectos Cultivar × Stage y robustez anual',
    description: 'Tablas que sostienen la comparación de módulos y los contrastes Cabernet−Pinot por Stage × Year.',
    artifactIds: ['modules', 'module_contrasts'],
    route: '/results/modules',
    boundary: 'Significancia del modelo y reproducibilidad anual son dimensiones distintas.',
  },
  {
    id: 'm5-harvest',
    title: 'Trayectoria interanual de M5',
    description: 'Perfiles, eigengenes y contrastes usados por el explorador M5, incluido Harvest por año.',
    artifactIds: ['m5_trajectory', 'module_contrasts'],
    route: '/results/modules/M5',
    boundary: 'Una diferencia de eigengene resume coexpresión; no demuestra represión ni causalidad.',
  },
  {
    id: 'm5-function',
    title: 'Enriquecimiento funcional y conflicto CHS/STS',
    description: 'ORA MapMan v3/v5.1 y GO auditado, con cobertura y fuentes funcionales vigentes.',
    artifactIds: ['functional_enrichment', 'enrichments'],
    route: '/results/function',
    boundary: 'El enriquecimiento describe sobrerrepresentación del módulo; no identifica por sí solo un driver causal.',
  },
  {
    id: 'hub-priority',
    title: 'Priorización de hubs M5/M10/M2',
    description: 'Rankings de kWithin y evidencia de centralidad intramodular usada para priorizar candidatos.',
    artifactIds: ['hubs'],
    route: '/results/modules/M5',
    boundary: 'Centralidad de red no equivale a regulación causal.',
  },
  {
    id: 'm5-network',
    title: 'Red de coexpresión M5',
    description: 'Aristas beta10 y script que generan la red interactiva M5 y la vista chr16.',
    artifactIds: ['m5_network', 'hubs'],
    route: '/results/modules/M5',
    boundary: 'La red es unsigned: una arista no significa activación, inhibición ni dirección regulatoria.',
  },
  {
    id: 'skin-validation',
    title: 'Validación externa en piel aislada',
    description: 'Fuentes, scripts y parámetros usados para GSE72421 y PRJNA260535 en T-007.',
    artifactIds: ['external_validation'],
    route: '/results/validation',
    boundary: 'La validación externa es observacional y no se suma al N=54 del baseline.',
  },
  {
    id: 't008-progress',
    title: 'Reprocesamiento moderno y preservación T-008',
    description: 'Manifiesto de 54 corridas, QC por SRR, matrices, preservación de módulos y scripts reproducibles.',
    artifactIds: ['t008_progress'],
    route: '/status/t008',
    boundary: 'La preservación moderada se limita al núcleo con equivalencia recíproca; no cubre genes no mapeados ni demuestra causalidad.',
  },
]

function githubUrl(path: string, commit: string | null) {
  const ref = commit ?? 'main'
  return `${REPO}/blob/${ref}/${path}`
}

function shortHash(value: string) {
  return `${value.slice(0, 16)}…`
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date) + ' UTC'
}

function ArtifactEvidence({
  artifact,
  provenance,
}: {
  artifact: ProvenanceArtifact
  provenance: ProvenancePayload
}) {
  return (
    <details className="evidence-artifact" id={`artifact-${artifact.artifact_id}`}>
      <summary>
        <span>
          <strong>{artifact.artifact_id}</strong>
          <small>{artifact.sources.length} fuente(s) · {artifact.scripts.length} script(s)</small>
        </span>
        <span className="evidence-chevron" aria-hidden="true">⌄</span>
      </summary>

      <div className="evidence-artifact-body">
        <section>
          <h3>RESULTADO / ENTRADA</h3>
          {artifact.sources.map((source) => (
            <article className="evidence-file" key={source.path}>
              <a href={githubUrl(source.path, provenance.repository_commit)} target="_blank" rel="noreferrer">
                {source.path}
              </a>
              <div>
                <code>SHA-256 {shortHash(source.sha256)}</code>
                <span>{source.bytes.toLocaleString('es-CL')} bytes</span>
              </div>
            </article>
          ))}
        </section>

        <section>
          <h3>GENERADO POR</h3>
          {artifact.scripts.map((script) => (
            <article className="evidence-file" key={script.path}>
              <a href={githubUrl(script.path, provenance.repository_commit)} target="_blank" rel="noreferrer">
                {script.path}
              </a>
              <div><code>SHA-256 {shortHash(script.sha256)}</code></div>
            </article>
          ))}
        </section>

        {Object.keys(artifact.parameters).length > 0 && (
          <section>
            <h3>PARÁMETROS / ALCANCE</h3>
            <pre>{JSON.stringify(artifact.parameters, null, 2)}</pre>
          </section>
        )}
      </div>
    </details>
  )
}

export default function EvidenceBrowserPage() {
  const [data, setData] = useState<ProvenancePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const requestedArtifact = searchParams.get('artifact')
  const requestedQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(requestedQuery)
  const [view, setView] = useState<'claims' | 'artifacts'>(requestedArtifact ? 'artifacts' : 'claims')

  useEffect(() => {
    let active = true
    loadProvenance()
      .then((payload) => {
        if (active) setData(payload)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar la trazabilidad reproducible')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setQuery(requestedQuery)
  }, [requestedQuery])

  useEffect(() => {
    if (requestedArtifact) setView('artifacts')
  }, [requestedArtifact])

  useEffect(() => {
    if (!data || !requestedArtifact) return
    const target = document.getElementById(`artifact-${requestedArtifact}`)
    if (target instanceof HTMLDetailsElement) {
      target.open = true
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [data, requestedArtifact])

  const artifactMap = useMemo(
    () => new Map(data?.artifacts.map((artifact) => [artifact.artifact_id, artifact]) ?? []),
    [data],
  )

  const filteredClaims = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase()
    if (!normalized) return CLAIMS

    return CLAIMS.filter((claim) => {
      const artifacts = claim.artifactIds
        .map((id) => artifactMap.get(id))
        .filter((item): item is ProvenanceArtifact => Boolean(item))
      const searchable = [
        claim.id,
        claim.title,
        claim.description,
        claim.boundary,
        ...claim.artifactIds,
        ...artifacts.flatMap((artifact) => [
          ...artifact.sources.map((source) => source.path),
          ...artifact.scripts.map((script) => script.path),
        ]),
      ].join(' ').toLowerCase()
      return searchable.includes(normalized)
    })
  }, [artifactMap, data, query])

  const filteredArtifacts = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase()
    if (!normalized) return data.artifacts

    return data.artifacts.filter((artifact) =>
      [
        artifact.artifact_id,
        ...artifact.sources.map((source) => source.path),
        ...artifact.scripts.map((script) => script.path),
        JSON.stringify(artifact.parameters),
      ].join(' ').toLowerCase().includes(normalized),
    )
  }, [data, query])

  const uniqueSources = new Set(data?.artifacts.flatMap((artifact) => artifact.sources.map((source) => source.path)) ?? [])
  const uniqueScripts = new Set(data?.artifacts.flatMap((artifact) => artifact.scripts.map((script) => script.path)) ?? [])

  return (
    <div className="evidence-page">
      <section className="evidence-hero">
        <div>
          <p className="eyebrow">Reproducibilidad</p>
          <h1>Audita un resultado hasta su fuente</h1>
          <p>
            Busca un hallazgo, módulo, gen, archivo o script y sigue la cadena de trazabilidad
            hasta los datos, parámetros, hashes y commit usados para construir la vista.
          </p>
        </div>
        <img
          className="evidence-hero-illustration"
          src={`${import.meta.env.BASE_URL}assets/reproducibility/provenance-grape-magnifier.png`}
          alt=""
        />
      </section>

      {!data && !error && (
        <div className="data-state" role="status">
          <span className="data-state-dot" />Cargando trazabilidad reproducible…
        </div>
      )}
      {error && (
        <div className="data-state data-state--error" role="alert">
          <strong>Error de trazabilidad</strong><span>{error}</span>
        </div>
      )}

      {data && (
        <>
          <section className="evidence-version-grid">
            <article>
              <span>Commit del dataset web</span>
              <a
                href={`${REPO}/commit/${data.repository_commit ?? 'main'}`}
                target="_blank"
                rel="noreferrer"
              >
                <code>{data.repository_commit?.slice(0, 12) ?? '—'}</code>
              </a>
            </article>
            <article>
              <span>Generado</span>
              <strong>{formatDate(data.generated_at_utc)}</strong>
            </article>
            <article>
              <span>Artefactos</span>
              <strong>{data.artifacts.length}</strong>
            </article>
            <article>
              <span>Fuentes / scripts únicos</span>
              <strong>{uniqueSources.size} / {uniqueScripts.size}</strong>
            </article>
          </section>

          <section className="evidence-search-panel">
            <label>
              <span>Buscar evidencia</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="M5, Harvest, enrichment, t008, module_contrasts.tsv…"
              />
            </label>
            <p>
              La búsqueda cubre hallazgos, artifact IDs, rutas de resultados, scripts y parámetros.
            </p>
          </section>

          <nav className="evidence-view-tabs" aria-label="Vista de reproducibilidad">
            <button
              type="button"
              className={view === 'claims' ? 'evidence-view-tab evidence-view-tab--active' : 'evidence-view-tab'}
              onClick={() => setView('claims')}
              aria-pressed={view === 'claims'}
            >
              <span>Hallazgos</span>
              <strong>{filteredClaims.length}</strong>
            </button>
            <button
              type="button"
              className={view === 'artifacts' ? 'evidence-view-tab evidence-view-tab--active' : 'evidence-view-tab'}
              onClick={() => setView('artifacts')}
              aria-pressed={view === 'artifacts'}
            >
              <span>Artefactos</span>
              <strong>{filteredArtifacts.length}</strong>
            </button>
          </nav>

          {view === 'claims' && (
          <section className="evidence-claims">
            <div className="evidence-section-heading">
              <div>
                <p className="eyebrow">Hallazgos</p>
                <h2>Resultado → evidencia</h2>
              </div>
              <span>{filteredClaims.length} de {CLAIMS.length}</span>
            </div>

            <div className="evidence-claim-grid">
              {filteredClaims.map((claim) => (
                <article className="evidence-claim" key={claim.id}>
                  <div>
                    <span className="evidence-claim-id">{claim.id}</span>
                    <h3>{claim.title}</h3>
                    <p>{claim.description}</p>
                  </div>
                  <div className="evidence-artifact-chips">
                    {claim.artifactIds.map((id) => (
                      <Link key={id} to={'/reproducibility?artifact=' + encodeURIComponent(id)}>{id}</Link>
                    ))}
                  </div>
                  <div className="evidence-boundary">
                    <strong>Límite</strong>
                    <span>{claim.boundary}</span>
                  </div>
                  <Link className="inline-link" to={claim.route}>Ver resultado en la web →</Link>
                </article>
              ))}
            </div>

            {filteredClaims.length === 0 && (
              <div className="module-empty">No hay hallazgos principales que coincidan con la búsqueda.</div>
            )}
          </section>
          )}

          {view === 'artifacts' && (
          <section className="evidence-catalog">
            <div className="evidence-section-heading">
              <div>
                <p className="eyebrow">Catálogo técnico</p>
                <h2>Artefactos, datos y scripts</h2>
              </div>
              <span>{filteredArtifacts.length} de {data.artifacts.length}</span>
            </div>

            <div className="evidence-artifact-list">
              {filteredArtifacts.map((artifact) => (
                <ArtifactEvidence key={artifact.artifact_id} artifact={artifact} provenance={data} />
              ))}
            </div>
          </section>
          )}

          <section className="evidence-boundary-grid">
            <article>
              <p className="eyebrow">Qué garantiza</p>
              <h2>Reproducibilidad de la capa web</h2>
              <p>
                Cada archivo expuesto registra su SHA-256 y queda enlazado al commit usado durante
                la exportación. La web puede volver a construirse desde esas rutas canónicas.
              </p>
            </article>
            <article>
              <p className="eyebrow">Qué no garantiza</p>
              <h2>Un hash no convierte una interpretación en causal</h2>
              <p>
                La trazabilidad demuestra qué archivo y script sostienen una visualización; las limitaciones
                biológicas y estadísticas siguen aplicando exactamente igual.
              </p>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
