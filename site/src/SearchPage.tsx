import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { loadHubs, loadModules, loadProvenance, type HubsPayload, type ModulesPayload, type ProvenancePayload } from './data/siteData'
import { BackLink } from './components/ui'

const destinations = [
  { label: 'Resumen', description: 'Pregunta, diseño y hallazgos principales', to: '/', keywords: 'inicio resumen overview pregunta diseño hallazgos' },
  { label: 'Módulos', description: 'Comparar M1–M10', to: '/results/modules', keywords: 'resultados modulos m1 m2 m3 m4 m5 m6 m7 m8 m9 m10' },
  { label: 'Función', description: 'Enriquecimiento MapMan y GO', to: '/results/function', keywords: 'funcion enriquecimiento mapman go ora chs sts' },
  { label: 'Validación', description: 'Evidencia externa en piel', to: '/results/validation', keywords: 'validacion piel gse72421 prjna260535 externo' },
  { label: 'Métodos', description: 'Diseño, red, estadística y scripts', to: '/methods', keywords: 'metodos diseño beta estadistica scripts cemitool' },
  { label: 'Reproducibilidad', description: 'Claims, archivos, scripts y hashes', to: '/reproducibility', keywords: 'evidencia reproducibilidad provenance archivos scripts hash' },
  { label: 'Síntesis científica', description: 'Conclusiones integradas y documentos completos', to: '/results/synthesis', keywords: 'sintesis informe manuscrito conclusion integrada m5 m10 m2' },
  { label: 'T-008', description: 'Estado del reprocesamiento moderno', to: '/status/t008', keywords: 't008 salmon fastq reprocesamiento qc status' },
  { label: 'Preguntar', description: 'Asistente grounded del proyecto', to: '/ask', keywords: 'chat preguntar asistente gemini rag' },
]

function geneKeywords(row: HubsPayload['rows'][number]) {
  const tags = [row.Gene, row.V3_gene ?? '', row.V5_gene ?? '', row.Module]
  if (row.V3_NAC_label || row.V5_NAC_label) tags.push('NAC')
  if (row.V3_TF_label || row.V5_TF_label) tags.push('factor transcripcion')
  if (row.V3_V5_STS_CHS_label_conflict) tags.push('CHS STS stilbenoid conflict')
  if (row.V5_CHS_label) tags.push('CHS')
  return tags.join(' ').toLowerCase()
}

export default function SearchPage() {
  const { pathname } = useLocation()
  const genesMode = pathname.startsWith('/results/genes')
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [modules, setModules] = useState<ModulesPayload | null>(null)
  const [hubs, setHubs] = useState<HubsPayload | null>(null)
  const [provenance, setProvenance] = useState<ProvenancePayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([loadModules(), loadHubs(), loadProvenance()])
      .then(([moduleData, hubData, provenanceData]) => {
        if (!active) return
        setModules(moduleData)
        setHubs(hubData)
        setProvenance(provenanceData)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'No se pudo cargar la búsqueda')
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (current === query) return
    const next = new URLSearchParams(searchParams)
    if (query.trim()) next.set('q', query)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }, [query, searchParams, setSearchParams])

  const normalized = query.trim().toLowerCase()

  const pageResults = useMemo(() => {
    if (!normalized) return destinations.slice(0, 6)
    return destinations.filter((item) => (item.label + ' ' + item.description + ' ' + item.keywords).toLowerCase().includes(normalized))
  }, [normalized])

  const moduleResults = useMemo(() => {
    if (!modules || !normalized) return []
    return modules.modules.filter((row) =>
      [row.module, row.robustness_classification ?? '', row.robustness_note ?? ''].join(' ').toLowerCase().includes(normalized),
    )
  }, [modules, normalized])

  const geneResults = useMemo(() => {
    if (!hubs) return []
    if (!normalized) {
      if (!genesMode) return []
      return [...hubs.rows]
        .sort((a, b) => a.Module.localeCompare(b.Module) || a.Rank_kWithin - b.Rank_kWithin)
        .slice(0, 36)
    }
    return hubs.rows.filter((row) => geneKeywords(row).includes(normalized)).slice(0, 36)
  }, [hubs, normalized, genesMode])

  const artifactResults = useMemo(() => {
    if (!provenance || !normalized) return []
    return provenance.artifacts.filter((artifact) =>
      [artifact.artifact_id, ...artifact.sources.map((source) => source.path), ...artifact.scripts.map((script) => script.path)]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    ).slice(0, 20)
  }, [provenance, normalized])

  const resultCount = genesMode
    ? geneResults.length
    : pageResults.length + moduleResults.length + geneResults.length + artifactResults.length

  return (
    <div className="search-page">
      {genesMode && <BackLink to="/results">Volver a Resultados</BackLink>}
      <header className="search-intro">
        <div>
          <p className="eyebrow">{genesMode ? 'Resultados · Genes' : 'Buscar'}</p>
          <h1>{genesMode ? 'Explora genes priorizados.' : 'Encuentra un resultado sin saber dónde vive.'}</h1>
          <p>
            {genesMode
              ? 'Busca por ID, módulo o etiqueta funcional y abre una ficha con centralidad, anotación y evidencia externa.'
              : 'Busca módulos, genes, métodos, datasets, artefactos o conceptos del proyecto.'}
          </p>
        </div>
        <label className="global-search-box">
          <span>{genesMode ? 'Buscar genes' : 'Buscar en el explorador'}</span>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={genesMode ? 'VIT_…, NAC, CHS, M5…' : 'M5, NAC, VIT_…, CHS, T-008…'}
          />
          {(normalized || genesMode) && <small>{resultCount} resultado(s) visibles</small>}
        </label>
      </header>

      {!modules && !error && <div className="data-state" role="status"><span className="data-state-dot" />Preparando búsqueda…</div>}
      {error && <div className="data-state data-state--error" role="alert"><strong>No se pudo preparar la búsqueda.</strong><span>{error}</span></div>}

      <section className="search-results">
        {!genesMode && (
          <div className="search-group">
            <div className="search-group-heading"><h2>{normalized ? 'Páginas' : 'Accesos rápidos'}</h2><span>{pageResults.length}</span></div>
            <div className="search-result-list">
              {pageResults.map((item) => (
                <Link key={item.to} to={item.to} className="search-result-row">
                  <div><strong>{item.label}</strong><span>{item.description}</span></div><span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!genesMode && normalized && moduleResults.length > 0 && (
          <div className="search-group">
            <div className="search-group-heading"><h2>Módulos</h2><span>{moduleResults.length}</span></div>
            <div className="search-result-list">
              {moduleResults.map((row) => (
                <Link key={row.module} to={'/results/modules/' + row.module} className="search-result-row">
                  <div><strong>{row.module}</strong><span>{row.gene_count} genes · {row.robustness_classification ?? 'sin clasificación prioritaria'}</span></div><span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(normalized || genesMode) && geneResults.length > 0 && (
          <div className="search-group">
            <div className="search-group-heading"><h2>Genes</h2><span>{geneResults.length}</span></div>
            <div className="search-result-list search-result-list--dense">
              {geneResults.map((row) => (
                <Link key={row.Gene} to={'/results/genes/' + row.Gene} className="search-result-row">
                  <div><strong>{row.Gene}</strong><span>{row.Module} · rank #{row.Rank_kWithin}{row.V3_V5_STS_CHS_label_conflict ? ' · CHS/STS' : row.V3_NAC_label || row.V5_NAC_label ? ' · NAC' : ''}</span></div><span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!genesMode && normalized && artifactResults.length > 0 && (
          <div className="search-group">
            <div className="search-group-heading"><h2>Reproducibilidad</h2><span>{artifactResults.length}</span></div>
            <div className="search-result-list search-result-list--dense">
              {artifactResults.map((artifact) => (
                <Link key={artifact.artifact_id} to={'/reproducibility?artifact=' + encodeURIComponent(artifact.artifact_id)} className="search-result-row">
                  <div><strong>{artifact.artifact_id}</strong><span>{artifact.sources.length} fuente(s) · {artifact.scripts.length} script(s)</span></div><span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(normalized || genesMode) && resultCount === 0 && (
          <div className="search-empty"><strong>Sin coincidencias</strong><span>Prueba con un ID de gen, módulo, dataset o término más corto.</span></div>
        )}
      </section>
    </div>
  )
}
