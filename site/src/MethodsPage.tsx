import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  loadProjectSummary,
  loadProvenance,
  type ProjectSummary,
  type ProvenanceArtifact,
  type ProvenancePayload,
} from './data/siteData'
import { formatDecimal } from './utils/format'

const REPO = 'https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot'

type MethodSection = {
  id: string
  label: string
  artifactIds: string[]
}

const sections: MethodSection[] = [
  { id: 'design', label: 'Diseño', artifactIds: ['project_summary'] },
  { id: 'network', label: 'Red', artifactIds: ['project_summary', 'modules'] },
  { id: 'statistics', label: 'Estadística', artifactIds: ['modules', 'module_contrasts'] },
  { id: 'enrichment', label: 'Función', artifactIds: ['functional_enrichment', 'enrichments'] },
  { id: 'validation', label: 'Validación', artifactIds: ['external_validation'] },
  { id: 't008', label: 'T-008', artifactIds: ['t008_progress'] },
]

function githubUrl(path: string, commit: string | null) {
  return REPO + '/blob/' + (commit ?? 'main') + '/' + path
}

function MethodEvidence({
  artifacts,
  provenance,
}: {
  artifacts: ProvenanceArtifact[]
  provenance: ProvenancePayload
}) {
  if (artifacts.length === 0) {
    return <p className="method-no-evidence">No hay un artefacto de provenance asociado a esta sección.</p>
  }

  return (
    <div className="method-evidence">
      {artifacts.map((artifact) => (
        <details key={artifact.artifact_id}>
          <summary>
            <span>{artifact.artifact_id}</span>
            <small>{artifact.sources.length} fuente(s) · {artifact.scripts.length} script(s)</small>
          </summary>
          <div className="method-evidence-body">
            {artifact.sources.length > 0 && (
              <div>
                <strong>Resultados / entradas</strong>
                {artifact.sources.map((source) => (
                  <a key={source.path} href={githubUrl(source.path, provenance.repository_commit)} target="_blank" rel="noreferrer">
                    {source.path}
                  </a>
                ))}
              </div>
            )}
            {artifact.scripts.length > 0 && (
              <div>
                <strong>Scripts</strong>
                {artifact.scripts.map((script) => (
                  <a key={script.path} href={githubUrl(script.path, provenance.repository_commit)} target="_blank" rel="noreferrer">
                    {script.path}
                  </a>
                ))}
              </div>
            )}
            {Object.keys(artifact.parameters).length > 0 && (
              <div className="method-parameters">
                <strong>Parámetros exportados</strong>
                <pre>{JSON.stringify(artifact.parameters, null, 2)}</pre>
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  )
}

export default function MethodsPage() {
  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [provenance, setProvenance] = useState<ProvenancePayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([loadProjectSummary(), loadProvenance()])
      .then(([projectPayload, provenancePayload]) => {
        if (!active) return
        setProject(projectPayload)
        setProvenance(provenancePayload)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los métodos')
      })
    return () => { active = false }
  }, [])

  const artifactMap = useMemo(
    () => new Map(provenance?.artifacts.map((artifact) => [artifact.artifact_id, artifact]) ?? []),
    [provenance],
  )

  function evidence(ids: string[]) {
    return ids.map((id) => artifactMap.get(id)).filter((item): item is ProvenanceArtifact => Boolean(item))
  }

  return (
    <div className="methods-page">
      <header className="methods-intro">
        <div>
          <p className="eyebrow">Métodos</p>
          <h1>Cómo se construyó la evidencia</h1>
          <p>
            Diseño, red, estadística, función, validación y reprocesamiento moderno,
            conectados con los scripts y artefactos que realmente usa el sitio.
          </p>
        </div>
        {project && (
          <div className="methods-summary">
            <span><strong>{project.design.sample_count}</strong> muestras baseline</span>
            <span><strong>β={project.network.primary_beta}</strong> red principal</span>
            <span><strong>{project.design.balanced ? 'Balanceado' : 'No balanceado'}</strong> diseño</span>
          </div>
        )}
      </header>

      {!project && !error && (
        <div className="data-state" role="status"><span className="data-state-dot" />Cargando métodos y provenance…</div>
      )}
      {error && (
        <div className="data-state data-state--error" role="alert"><strong>No se pudieron cargar los métodos.</strong><span>{error}</span></div>
      )}

      {project && provenance && (
        <div className="methods-layout">
          <aside className="methods-index">
            <span>En esta página</span>
            <nav aria-label="Índice de métodos">
              {sections.map((section) => <a key={section.id} href={'#' + section.id}>{section.label}</a>)}
            </nav>
            <Link to="/reproducibility">Abrir reproducibilidad →</Link>
          </aside>

          <div className="methods-content">
            <section className="method-section" id="design">
              <div className="method-section-heading"><span>01</span><div><p className="eyebrow">Diseño</p><h2>Diseño experimental</h2></div></div>
              <div className="method-answer"><p>
                El baseline contiene <strong>{project.design.sample_count} muestras</strong>: {' '}
                {project.design.cultivars.length} cultivares × {project.design.stages.length} etapas × {' '}
                {project.design.years.length} años, con {' '}
                {project.design.replicates_per_cell_values.join('/')} réplicas por celda según el exportador.
              </p></div>
              <dl className="method-facts">
                <div><dt>Cultivares</dt><dd>{project.design.cultivars.join(' / ')}</dd></div>
                <div><dt>Etapas</dt><dd>{project.design.stages.join(' → ')}</dd></div>
                <div><dt>Años</dt><dd>{project.design.years.join(', ')}</dd></div>
                <div><dt>Balanceado</dt><dd>{project.design.balanced ? 'Sí' : 'No'}</dd></div>
              </dl>
              <MethodEvidence artifacts={evidence(['project_summary'])} provenance={provenance} />
            </section>

            <section className="method-section" id="network">
              <div className="method-section-heading"><span>02</span><div><p className="eyebrow">Red</p><h2>Construcción de la red</h2></div></div>
              <div className="method-answer"><p>
                La web trata <strong>β={project.network.primary_beta}</strong> como red principal. El diagnóstico exportado reporta R² scale-free {' '}
                {formatDecimal(project.network.scale_free_r2, 3)} y conectividad media {' '}
                {formatDecimal(project.network.mean_connectivity, 2)}.
              </p></div>
              <div className="method-boundary">Una arista unsigned resume fuerza de coexpresión transformada; no indica activación, inhibición ni dirección causal.</div>
              <MethodEvidence artifacts={evidence(['project_summary', 'modules'])} provenance={provenance} />
            </section>

            <section className="method-section" id="statistics">
              <div className="method-section-heading"><span>03</span><div><p className="eyebrow">Estadística</p><h2>Contrastes y robustez</h2></div></div>
              <div className="method-answer"><p>El sitio separa la señal global Cultivar×Stage de la revisión anual de contrastes por etapa. No las combina en una puntuación única de “mejor módulo”.</p></div>
              <MethodEvidence artifacts={evidence(['modules', 'module_contrasts'])} provenance={provenance} />
            </section>

            <section className="method-section" id="enrichment">
              <div className="method-section-heading"><span>04</span><div><p className="eyebrow">Función</p><h2>Enriquecimiento funcional</h2></div></div>
              <div className="method-answer"><p>La función se evalúa a nivel de módulo mediante las fuentes exportadas por el proyecto. Los conflictos de anotación, como CHS/STS, se mantienen visibles en vez de forzar una identidad enzimática única.</p></div>
              <Link className="inline-link" to="/results/function">Abrir exploración funcional →</Link>
              <MethodEvidence artifacts={evidence(['functional_enrichment', 'enrichments'])} provenance={provenance} />
            </section>

            <section className="method-section" id="validation">
              <div className="method-section-heading"><span>05</span><div><p className="eyebrow">Validación</p><h2>Validación externa en piel</h2></div></div>
              <div className="method-answer"><p>Los datasets externos se presentan como evidencia observacional independiente. No se agregan al N={project.design.sample_count} del baseline como si fueran réplicas equivalentes.</p></div>
              <Link className="inline-link" to="/results/validation">Abrir validación externa →</Link>
              <MethodEvidence artifacts={evidence(['external_validation'])} provenance={provenance} />
            </section>

            <section className="method-section" id="t008">
              <div className="method-section-heading"><span>06</span><div><p className="eyebrow">Reprocesamiento moderno</p><h2>T-008</h2></div></div>
              <div className="method-answer"><p>
                Estado exportado actual: <strong>{project.t008.validated_runs}/{project.t008.total_runs}</strong> corridas validadas. {' '}
                {project.t008.complete ? 'El exportador marca el lote como completo.' : 'La matriz moderna completa todavía no está disponible, por lo que el sitio no presenta una conclusión moderna final.'}
              </p></div>
              <Link className="inline-link" to="/status/t008">Abrir estado T-008 →</Link>
              <MethodEvidence artifacts={evidence(['t008_progress'])} provenance={provenance} />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}