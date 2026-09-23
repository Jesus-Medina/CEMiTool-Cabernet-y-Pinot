import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import M5Explorer from './components/M5Explorer'
import { ModuleExplorerDetailPage, ModulesExplorerPage } from './ModuleExplorerPage'
import ExternalValidationPage from './ExternalValidationPage'
import T008DashboardPage from './T008DashboardPage'
import EvidenceBrowserPage from './EvidenceBrowserPage'
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

function PlaceholderPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="placeholder-panel">
      <div className="placeholder-icon" aria-hidden="true">↗</div>
      <div>
        <h2>{title}</h2>
        <p>{children}</p>
      </div>
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

  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Interactive scientific explorer</p>
          <h1>Cabernet Sauvignon <span>×</span> Pinot noir</h1>
          <p className="hero-lede">
            Trayectorias de coexpresión, robustez interanual, metabolismo fenólico,
            hubs y validación externa, conectados directamente con la evidencia del repositorio.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/story">Entrar a la historia</Link>
            <Link className="button button--secondary" to="/modules/M5">Explorar M5</Link>
            <Link className="button button--secondary" to="/evidence">Ver evidencia</Link>
          </div>
          <p className="authorship">Proyecto científico de <strong>Catalina Constanza Marchant Hurtado</strong></p>
        </div>

        <div className="hero-orbit" aria-label="Estructura conceptual del sitio">
          <div className="orbit-card orbit-card--story">
            <strong>STORY</strong><span>Entender</span>
          </div>
          <div className="orbit-card orbit-card--explore">
            <strong>EXPLORE</strong><span>Investigar</span>
          </div>
          <div className="orbit-card orbit-card--evidence">
            <strong>EVIDENCE</strong><span>Auditar</span>
          </div>
        </div>
      </section>

      <DataState loading={loading} error={error} />

      {project && (
        <>
          <section className="metrics-grid" aria-label="Resumen del proyecto">
            <article className="metric-card">
              <p>Diseño</p>
              <strong>{project.design.sample_count}</strong>
              <span>
                {project.design.cultivars.length} cultivares · {project.design.stages.length} etapas · {project.design.years.length} años
              </span>
            </article>
            <article className="metric-card">
              <p>Red principal</p>
              <strong>β = {project.network.primary_beta}</strong>
              <span>R² scale-free {formatDecimal(project.network.scale_free_r2, 3)}</span>
            </article>
            <article className="metric-card metric-card--accent">
              <p>Foco actual</p>
              <strong>{m5?.module ?? 'M5'}</strong>
              <span>FDR Cultivar×Stage {formatScientific(m5?.cultivar_stage_fdr)}</span>
            </article>
            <article className="metric-card">
              <p>T-008 moderno</p>
              <strong>{project.t008.validated_runs}/{project.t008.total_runs}</strong>
              <span>{project.t008.complete ? 'Completo' : 'Aún sin matriz moderna completa'}</span>
            </article>
          </section>

          <section className="development-section">
            <div>
              <p className="eyebrow">Diseño biológico</p>
              <h2>Una misma pregunta a través de la maduración</h2>
              <p>
                Las etapas visibles aquí vienen del diseño canónico exportado desde el repositorio.
                El sitio no inventa ni reetiqueta muestras.
              </p>
            </div>
            <ol className="stage-flow">
              {project.design.stages.map((stage, index) => (
                <li key={stage}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{stage}</strong>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <EvidenceBoundary />

      <section className="portal-grid" aria-label="Áreas del explorador">
        <Link className="portal-card" to="/modules/M5">
          <span>01</span><h2>M5 Explorer</h2><p>Trayectorias, contrastes, hubs y provenance.</p>
        </Link>
        <Link className="portal-card" to="/validation">
          <span>02</span><h2>Validación</h2><p>Evidencia externa y límites de plataforma.</p>
        </Link>
        <Link className="portal-card" to="/t008">
          <span>03</span><h2>T-008</h2><p>Estado del reprocesamiento moderno.</p>
        </Link>
        <Link className="portal-card" to="/enrichment">
          <span>04</span><h2>Enriquecimiento</h2><p>MapMan v3/v5.1, GO auditado y cobertura.</p>
        </Link>
              <Link className="portal-card" to="/chat">
          <span>05</span><h2>Chat del proyecto</h2><p>Pregunta sobre resultados, métodos, scripts y trazabilidad usando las fuentes indexadas.</p>
        </Link>
</section>
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
              <Link className="inline-link" to="/modules/M5">Abrir M5 →</Link>
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
              <Link className="inline-link" to="/t008">Ver estado T-008 →</Link>
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

export function ResultsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="RESULTADOS M1–M10"
        title="Perfiles de coexpresión"
        description="Composición visual de los 10 módulos identificados en la red beta=10, junto con su resumen funcional y evidencia de validación."
        status="V2 Draft"
      />
      <PlaceholderPanel title="Composición visual M1–M10 en construcción">
        Esta pantalla mostrará el overview de todos los módulos, con la tabla comparativa y la explicación "cómo leer", en lugar de la antigua landing de módulos.
      </PlaceholderPanel>
    </div>
  )
}

export function ModuleDetailPage() {
  const { moduleId } = useParams()
  if (moduleId?.toUpperCase() === 'M5') {
    return <M5Explorer />
  }
  return <ModuleExplorerDetailPage />
}

export function GeneDetailPage() {
  const { geneId } = useParams()
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="GENE"
        title={geneId ?? 'Gen'}
        description="Ficha individual para integrar centralidad, anotaciones, posición y evidencia externa sin inventar información ausente."
      />
      <PlaceholderPanel title="Ficha completa pendiente">
        WEB-004 ya enlaza NAC, CuAO y genes CHS/STS hacia esta ruta. La ficha detallada reutilizable se completará junto con el explorador de genes.
      </PlaceholderPanel>
    </div>
  )
}

export function ValidationPage() {
  return <ExternalValidationPage />
}

export function T008Page() {
  return <T008DashboardPage />
}

export function MethodsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="METHODS"
        title="Métodos y decisiones"
        description="Puente entre la explicación humana, los parámetros analíticos y los scripts exactos del repositorio."
      />
      <PlaceholderPanel title="Métodos interactivos pendientes">
        Esta sección enlazará decisiones, definiciones y scripts sin ejecutar análisis científicos dentro del navegador.
      </PlaceholderPanel>
    </div>
  )
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
