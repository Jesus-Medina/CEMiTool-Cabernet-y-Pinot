import { Link, useParams } from 'react-router-dom'
import M5Explorer from './components/M5Explorer'
import { ModuleExplorerDetailPage, ModulesExplorerPage } from './ModuleExplorerPage'
import ExternalValidationPage from './ExternalValidationPage'
import T008DashboardPage from './T008DashboardPage'
import EvidenceBrowserPage from './EvidenceBrowserPage'
import MethodsPageView from './MethodsPage'
import GeneDetailPageView from './GeneDetailPage'
import { useCanonicalData } from './hooks/useCanonicalData'
import { formatDecimal, formatScientific } from './utils/format'

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
  status?: string
}

function PageIntro({
  eyebrow,
  title,
  description,
  status = 'Scaffold',
}: PageIntroProps) {
  return (
    <section className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{description}</p>
      </div>
      <span className="status-pill">{status}</span>
    </section>
  )
}

function DataState({
  loading,
  error,
}: {
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return (
      <div className="data-state" role="status">
        <span className="data-state-dot" aria-hidden="true" />
        Cargando resultados canónicos…
      </div>
    )
  }

  if (error) {
    return (
      <div className="data-state data-state--error" role="alert">
        <strong>No se pudieron cargar los datos generados.</strong>
        <span>{error}</span>
      </div>
    )
  }

  return null
}

function EvidenceBoundary() {
  return (
    <section className="boundary-grid" aria-label="Límites de interpretación">
      <article className="boundary-card boundary-card--supported">
        <p className="eyebrow">Qué sí muestra</p>
        <h2>Programas transcriptómicos diferenciales</h2>
        <p>
          El proyecto compara programas de coexpresión entre cultivares y etapas,
          revisa su robustez entre años y busca apoyo independiente en piel.
        </p>
      </article>
      <article className="boundary-card boundary-card--limit">
        <p className="eyebrow">Qué no demuestra</p>
        <h2>No es una prueba causal de grosor de piel</h2>
        <p>
          El baseline proviene de pericarpio y no contiene una medición directa de
          grosor de piel. Un hub o un eigengene tampoco equivale a un mecanismo causal.
        </p>
      </article>
    </section>
  )
}

export function HomePage() {
  const { project, modules, loading, error } = useCanonicalData()
  const m5 = modules?.modules.find((row) => row.module === 'M5') ?? null
  const robustness =
    m5?.robustness_classification === 'reproducible'
      ? 'Reproducible'
      : m5?.robustness_classification === 'year-dependent'
        ? 'Dependiente del año'
        : 'En revisión'

  return (
    <div className="overview-page">
      <section className="overview-hero">
        <div className="overview-hero-copy">
          <p className="eyebrow">Overview científico</p>
          <h1>Comparar programas de coexpresión durante la maduración.</h1>
          <p className="overview-lede">
            Cabernet Sauvignon y Pinot noir se comparan a través de etapas y años
            para identificar programas transcriptómicos diferenciales, revisar su
            robustez y buscar apoyo independiente en piel.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/results/modules">Explorar resultados</Link>
            <Link className="button button--secondary" to="/methods">Ver métodos</Link>
          </div>
          <p className="authorship">
            Proyecto científico de <strong>Catalina Constanza Marchant Hurtado</strong>
          </p>
        </div>

        <dl className="overview-facts" aria-label="Diseño del estudio">
          <div>
            <dt>Muestras baseline</dt>
            <dd>{project?.design.sample_count ?? '54'}</dd>
          </div>
          <div>
            <dt>Tejido</dt>
            <dd>Pericarpio</dd>
          </div>
          <div>
            <dt>Diseño</dt>
            <dd>
              {project
                ? [project.design.cultivars.length, project.design.stages.length, project.design.years.length].join(' × ')
                : '2 × 3 × 3'}
            </dd>
          </div>
          <div>
            <dt>Red principal</dt>
            <dd>β={project?.network.primary_beta ?? 10}</dd>
          </div>
        </dl>
      </section>

      <DataState loading={loading} error={error} />

      {project && (
        <>
          <section className="overview-design" aria-labelledby="overview-design-title">
            <div>
              <p className="eyebrow">Diseño experimental</p>
              <h2 id="overview-design-title">La misma comparación a través de tres etapas y tres años</h2>
              <p>
                {project.design.cultivars.join(' vs ')} · {project.design.years.join(', ')} ·
                {' '}{project.design.replicates_per_cell_values[0] ?? 3} réplicas por celda.
              </p>
            </div>
            <ol className="overview-stage-flow">
              {project.design.stages.map((stage, index) => (
                <li key={stage}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{stage}</strong>
                </li>
              ))}
            </ol>
          </section>

          <section className="overview-findings" aria-labelledby="overview-findings-title">
            <div className="overview-section-heading">
              <div>
                <p className="eyebrow">Hallazgos principales</p>
                <h2 id="overview-findings-title">Tres ideas para orientarse antes de explorar</h2>
              </div>
            </div>

            <div className="overview-finding-grid">
              <article>
                <span>01</span>
                <strong>M5</strong>
                <h3>Interacción Cultivar×Stage destacada</h3>
                <p>
                  FDR {formatScientific(m5?.cultivar_stage_fdr)} en el resumen canónico del módulo.
                </p>
                <Link to="/results/results/modules/M5">Abrir M5 →</Link>
              </article>

              <article>
                <span>02</span>
                <strong>{robustness}</strong>
                <h3>La robustez anual se evalúa por separado</h3>
                <p>
                  Significancia global y repetición entre años responden preguntas distintas.
                </p>
                <Link to="/results/modules">Comparar módulos →</Link>
              </article>

              <article>
                <span>03</span>
                <strong>Piel externa</strong>
                <h3>La validación no se mezcla con el baseline</h3>
                <p>
                  Los datasets de piel aislada se usan como evidencia observacional independiente.
                </p>
                <Link to="/results/validation">Ver validación →</Link>
              </article>
            </div>
          </section>

          <section className="overview-m5-highlight">
            <div>
              <p className="eyebrow">Resultado destacado</p>
              <h2>M5 concentra la exploración más profunda del sitio</h2>
              <p>
                {m5?.gene_count ?? '—'} genes · FDR Cultivar×Stage{' '}
                {formatScientific(m5?.cultivar_stage_fdr)} · {robustness.toLowerCase()}.
                Su workspace conecta trayectoria, hubs, red, función y evidencia externa
                sin convertir coexpresión en causalidad.
              </p>
              <div className="overview-inline-actions">
                <Link className="button button--primary" to="/results/results/modules/M5">Explorar M5</Link>
                <Link className="button button--secondary" to="/reproducibility">Auditar evidencia</Link>
              </div>
            </div>
            <div className="overview-m5-metrics">
              <div><span>Genes</span><strong>{m5?.gene_count ?? '—'}</strong></div>
              <div><span>Red principal</span><strong>β={project.network.primary_beta}</strong></div>
              <div><span>Scale-free R²</span><strong>{formatDecimal(project.network.scale_free_r2, 3)}</strong></div>
            </div>
          </section>

          <section className="overview-validation-band">
            <div>
              <p className="eyebrow">Evidencia externa</p>
              <h2>Baseline en pericarpio → comparación independiente en piel</h2>
              <p>
                La validación externa pregunta por concordancia de expresión en otro tejido/plataforma;
                no suma nuevas réplicas al diseño de 54 muestras.
              </p>
            </div>
            <Link className="button button--secondary" to="/results/validation">Abrir validación</Link>
          </section>
        </>
      )}

      <EvidenceBoundary />

      <nav className="overview-next" aria-label="Continuar explorando">
        <Link to="/results/modules"><span>Resultados</span><strong>Comparar módulos</strong></Link>
        <Link to="/methods"><span>Métodos</span><strong>Cómo se construyó la evidencia</strong></Link>
        <Link to="/reproducibility"><span>Reproducibilidad</span><strong>Fuentes, scripts y artefactos</strong></Link>
      </nav>
    </div>
  )
}

export function StoryPage() {
  const { project, modules, m5, loading, error } = useCanonicalData()
  const m5Summary = modules?.modules.find((row) => row.module === 'M5') ?? null
  const harvest = m5?.contrasts.filter((row) => row.Stage === 'Harvest') ?? []
  const harvestNegativeAllYears =
    harvest.length > 0 && harvest.every((row) => row.estimate < 0)

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="STORY"
        title="Historia científica"
        description="Una lectura guiada del proyecto, construida sobre datos exportados desde las tablas canónicas."
        status="Datos reales"
      />

      <DataState loading={loading} error={error} />

      {project && (
        <section className="story-timeline">
          <article className="story-step">
            <span>01</span>
            <div>
              <p className="eyebrow">Pregunta</p>
              <h2>Comparar programas, no buscar un “gen de piel gruesa”</h2>
              <p>
                La pregunta operacional es qué programas de coexpresión cambian de manera
                distinta entre Cabernet Sauvignon y Pinot noir durante el desarrollo, cuáles
                se repiten entre años y qué candidatos encuentran apoyo en piel aislada.
              </p>
            </div>
          </article>

          <article className="story-step">
            <span>02</span>
            <div>
              <p className="eyebrow">Diseño</p>
              <h2>{project.design.sample_count} muestras balanceadas</h2>
              <p>
                {project.design.cultivars.length} cultivares × {project.design.stages.length} etapas × {project.design.years.length} años
                {project.design.replicates_per_cell_values.length === 1
                  ? ` × ${project.design.replicates_per_cell_values[0]} réplicas biológicas por celda.`
                  : '.'}
              </p>
              <div className="story-tags">
                {project.design.cultivars.map((item) => <span key={item}>{item}</span>)}
                {project.design.years.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
          </article>

          <article className="story-step">
            <span>03</span>
            <div>
              <p className="eyebrow">Red de coexpresión</p>
              <h2>β = {project.network.primary_beta} como red principal</h2>
              <p>
                El sitio lee el beta primario desde los diagnósticos canónicos. El ajuste
                scale-free exportado para esta red es R² {formatDecimal(project.network.scale_free_r2, 3)}.
                La red beta=7 permanece como análisis de sensibilidad, no como una red reemplazada.
              </p>
            </div>
          </article>

          <article className="story-step story-step--focus">
            <span>04</span>
            <div>
              <p className="eyebrow">Resultado central</p>
              <h2>M5 emerge como foco principal</h2>
              <p>
                Su interacción Cultivar×Stage tiene FDR {formatScientific(m5Summary?.cultivar_stage_fdr)}.
                La clasificación de robustez exportada conserva la cautela de que el módulo
                puede depender del año a nivel global.
              </p>
              {harvest.length > 0 && (
                <p className="story-evidence-line">
                  Harvest disponible para {harvest.length} años en la tabla canónica:
                  {' '}
                  <strong>{harvestNegativeAllYears ? 'Cabernet − Pinot mantiene dirección negativa en todos ellos.' : 'la dirección no es idéntica en todos los años.'}</strong>
                </p>
              )}
              <Link className="inline-link" to="/results/results/modules/M5">Abrir M5 →</Link>
            </div>
          </article>

          <article className="story-step">
            <span>05</span>
            <div>
              <p className="eyebrow">Interpretación funcional</p>
              <h2>La función se evalúa a nivel de módulo</h2>
              <p>
                El enriquecimiento y los hubs se mantienen separados de la inferencia causal.
                La web hace visible el conflicto de anotación CHS/STS en vez de esconderlo
                detrás de una única etiqueta.
              </p>
            </div>
          </article>

          <article className="story-step">
            <span>06</span>
            <div>
              <p className="eyebrow">Piel aislada</p>
              <h2>La validación externa es otra capa de evidencia</h2>
              <p>
                Las fuentes externas no se agregan a las {project.design.sample_count} muestras
                del baseline como si fueran réplicas equivalentes. Se presentan por separado
                para evaluar concordancia observacional.
              </p>
            </div>
          </article>

          <article className="story-step">
            <span>07</span>
            <div>
              <p className="eyebrow">T-008</p>
              <h2>{project.t008.validated_runs} de {project.t008.total_runs} corridas validadas</h2>
              <p>
                {project.t008.complete
                  ? 'El exportador reporta el lote moderno como completo.'
                  : 'El lote moderno sigue incompleto; por eso la web no presenta todavía una conclusión de preservación moderna.'}
              </p>
              <Link className="inline-link" to="/status/t008">Ver estado T-008 →</Link>
            </div>
          </article>
        </section>
      )}

      <EvidenceBoundary />
    </div>
  )
}

export function ModulesPage() {
  return <ModulesExplorerPage />
}

export function ModuleDetailPage() {
  const { moduleId } = useParams()
  if (moduleId?.toUpperCase() === 'M5') {
    return <M5Explorer />
  }
  return <ModuleExplorerDetailPage />
}

export function GeneDetailPage() {
  return <GeneDetailPageView />
}

export function ValidationPage() {
  return <ExternalValidationPage />
}

export function T008Page() {
  return <T008DashboardPage />
}

export function MethodsPage() {
  return <MethodsPageView />
}

export function EvidencePage() {
  return <EvidenceBrowserPage />
}

export function NotFoundPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="404"
        title="Esta ruta todavía no existe"
        description="La arquitectura del explorador está creciendo por fases."
      />
      <Link className="button button--primary button--fit" to="/">Volver al inicio</Link>
    </div>
  )
}
