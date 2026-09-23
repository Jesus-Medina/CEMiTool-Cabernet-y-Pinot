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
  const m10 = modules?.modules.find((row) => row.module === 'M10') ?? null
  const moduleCount = modules?.modules.length ?? 10
  const replicates = project?.design.replicates_per_cell_values[0] ?? 3

  return (
    <div className="home-v2">
      <section className="home-v2-hero">
        <div className="home-v2-hero-copy">
          <p className="home-v2-kicker">Caracterización transcriptómica comparativa</p>
          <h1>
            Comparar programas de coexpresión entre{' '}
            <span>Cabernet Sauvignon</span> y <span>Pinot noir.</span>
          </h1>
          <p className="home-v2-lede">
            CEMiTool Explorer identifica programas de coexpresión que divergen durante la
            maduración de la baya, evalúa su robustez entre años y explora el apoyo externo
            en piel de uva.
          </p>
          <div className="home-v2-actions">
            <Link className="home-v2-button home-v2-button--primary" to="/results">
              Explorar resultados <span aria-hidden="true">→</span>
            </Link>
            <Link className="home-v2-button home-v2-button--secondary" to="/methods">
              Ver métodos
            </Link>
          </div>
        </div>

        <figure className="home-v2-grapes">
          <img
            src={import.meta.env.BASE_URL + 'assets/home/grapes-hero.jpg'}
            alt="Racimos de uva tinta y rosada usados como recurso visual para representar Cabernet Sauvignon y Pinot noir"
          />
        </figure>

        <aside className="home-v2-study-card" aria-label="Resumen del diseño experimental">
          <div className="home-v2-fact">
            <span className="home-v2-fact-icon" aria-hidden="true">◫</span>
            <div><strong>GSE98923</strong><small>Conjunto de datos GEO</small></div>
          </div>
          <div className="home-v2-fact">
            <span className="home-v2-fact-icon" aria-hidden="true">◎</span>
            <div><strong>{project?.design.sample_count ?? 54} muestras</strong><small>Expresión transcriptómica</small></div>
          </div>
          <div className="home-v2-fact">
            <span className="home-v2-fact-icon" aria-hidden="true">◒</span>
            <div><strong>{project?.design.cultivars.length ?? 2} cultivares</strong><small>Cabernet Sauvignon y Pinot noir</small></div>
          </div>
          <div className="home-v2-fact">
            <span className="home-v2-fact-icon" aria-hidden="true">▥</span>
            <div><strong>{project?.design.stages.length ?? 3} etapas</strong><small>{project?.design.stages.join(', ') ?? 'FruitSet, Veraison, Harvest'}</small></div>
          </div>
          <div className="home-v2-fact">
            <span className="home-v2-fact-icon" aria-hidden="true">□</span>
            <div><strong>{project?.design.years.length ?? 3} años</strong><small>{project?.design.years.join(', ') ?? '2012, 2013, 2014'}</small></div>
          </div>
          <div className="home-v2-fact">
            <span className="home-v2-fact-icon" aria-hidden="true">✤</span>
            <div><strong>Pericarpio completo</strong><small>Tejido del baseline</small></div>
          </div>
          <div className="home-v2-fact">
            <span className="home-v2-fact-icon" aria-hidden="true">⚙</span>
            <div><strong>β{project?.network.primary_beta ?? 10} principal</strong><small>Construcción de la red</small></div>
          </div>
          <div className="home-v2-fact">
            <span className="home-v2-fact-icon" aria-hidden="true">⚙</span>
            <div><strong>β7 sensibilidad</strong><small>Análisis complementario</small></div>
          </div>
        </aside>
      </section>

      <DataState loading={loading} error={error} />

      <section className="home-v2-section home-v2-findings" aria-labelledby="home-v2-findings-title">
        <div className="home-v2-section-heading">
          <p>Hallazgos principales</p>
          <h2 id="home-v2-findings-title">Cuatro conclusiones clave</h2>
        </div>
        <div className="home-v2-finding-row">
          <article>
            <span className="home-v2-round-icon" aria-hidden="true">⌘</span>
            <div><strong>{moduleCount} módulos β10</strong><p>La red principal identifica diez programas de coexpresión.</p></div>
          </article>
          <article>
            <span className="home-v2-round-icon" aria-hidden="true">◇</span>
            <div><strong>M10 reproducible</strong><p>{m10 ? 'Cumple la regla preespecificada de reproducibilidad anual.' : 'Clasificación reproducible en la capa de robustez anual.'}</p></div>
          </article>
          <article>
            <span className="home-v2-round-icon" aria-hidden="true">▥</span>
            <div><strong>M5, M2, M3 y M1</strong><p>Muestran dependencia anual a nivel de módulo.</p></div>
          </article>
          <article>
            <span className="home-v2-round-icon" aria-hidden="true">▤</span>
            <div><strong>Validación en piel</strong><p>Es externa y permanece separada del baseline de 54 muestras.</p></div>
          </article>
        </div>
      </section>

      {project && (
        <section className="home-v2-section home-v2-design" aria-labelledby="home-v2-design-title">
          <div className="home-v2-section-heading">
            <p>Diseño del estudio</p>
            <h2 id="home-v2-design-title">De las muestras a los módulos</h2>
          </div>
          <ol className="home-v2-flow">
            <li>
              <span className="home-v2-flow-icon" aria-hidden="true">● ●</span>
              <strong>Cabernet Sauvignon<br />y Pinot noir</strong>
              <small>{project.design.cultivars.length} cultivares</small>
            </li>
            <li>
              <span className="home-v2-flow-icon" aria-hidden="true">● ● ●</span>
              <strong>{project.design.stages.length} etapas</strong>
              <small>{project.design.stages.join(' · ')}</small>
            </li>
            <li>
              <span className="home-v2-flow-icon" aria-hidden="true">▣</span>
              <strong>{project.design.years.length} años</strong>
              <small>{project.design.years.join(', ')}</small>
            </li>
            <li>
              <span className="home-v2-flow-icon" aria-hidden="true">Ⅱ</span>
              <strong>{replicates} réplicas</strong>
              <small>por condición</small>
            </li>
            <li>
              <span className="home-v2-flow-icon" aria-hidden="true">▰</span>
              <strong>GSE98923</strong>
              <small>{project.design.sample_count} muestras</small>
            </li>
            <li>
              <span className="home-v2-flow-icon" aria-hidden="true">⌘</span>
              <strong>Red de coexpresión<br />CEMiTool</strong>
              <small>módulos y programas</small>
            </li>
          </ol>
        </section>
      )}

      <section className="home-v2-section home-v2-m5" aria-labelledby="home-v2-m5-title">
        <div className="home-v2-m5-copy">
          <p className="home-v2-section-kicker">Resultado destacado</p>
          <h2 id="home-v2-m5-title">Resultado destacado: <span>M5</span></h2>
          <p>
            M5 se presenta como caso de estudio porque combina una interacción
            Cultivar×Stage destacada con interpretación funcional y de red, mientras
            mantiene dependencia anual a nivel de módulo.
          </p>
          <Link className="home-v2-button home-v2-button--primary" to="/results/modules/M5">
            Ver detalle de M5 <span aria-hidden="true">→</span>
          </Link>
        </div>

        <figure className="home-v2-m5-chart">
          <figcaption>M5 · Trayectoria por etapa y año</figcaption>
          <img
            src={import.meta.env.BASE_URL + 'assets/home/m5-stage-by-year.png'}
            alt="Trayectorias observadas del eigengene M5 por etapa, cultivar y año"
            loading="lazy"
          />
        </figure>

        <aside className="home-v2-m5-summary">
          <h3>M5 en síntesis</h3>
          <ul>
            <li><span aria-hidden="true">⌁</span><strong>{m5?.gene_count ?? 108} genes</strong></li>
            <li><span aria-hidden="true">▥</span><strong>Interacción Cultivar×Stage</strong></li>
            <li><span aria-hidden="true">□</span><strong>Year-dependent</strong></li>
            <li><span aria-hidden="true">◒</span><strong>Harvest conserva señal en los tres años</strong></li>
          </ul>
          <Link to="/results/modules/M5">Ver detalle de M5 →</Link>
        </aside>
      </section>

      <section className="home-v2-section home-v2-limits" aria-labelledby="home-v2-limits-title">
        <div className="home-v2-section-heading">
          <p>Qué no demuestra este análisis</p>
          <h2 id="home-v2-limits-title">Cuatro consideraciones importantes</h2>
        </div>
        <div className="home-v2-limit-row">
          <article><span aria-hidden="true">⌁</span><div><strong>Eigengene ≠ expresión de un gen</strong><p>Resume el patrón del módulo, no la expresión de un gen individual.</p></div></article>
          <article><span aria-hidden="true">⌘</span><div><strong>Hub ≠ causalidad</strong><p>Centralidad en la red no demuestra regulación causal.</p></div></article>
          <article><span aria-hidden="true">◒</span><div><strong>Pericarpio ≠ piel aislada</strong><p>El baseline analiza pericarpio completo; la piel externa es otra capa de evidencia.</p></div></article>
          <article><span aria-hidden="true">△</span><div><strong>Expresión ≠ actividad proteica</strong><p>ARNm y actividad de proteína no son medidas equivalentes.</p></div></article>
        </div>
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
              <Link className="inline-link" to="/results/modules/M5">Abrir M5 →</Link>
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

export function ResultsLandingPage() {
  const { project, modules, loading, error } = useCanonicalData()
  const significantCount =
    modules?.modules.filter((row) => row.cultivar_stage_significant_fdr05).length ?? 0
  const reproducibleCount =
    modules?.modules.filter((row) => row.robustness_classification === 'reproducible').length ?? 0

  return (
    <div className="results-landing">
      <header className="results-landing-intro">
        <div>
          <p className="eyebrow">Resultados</p>
          <h1>Elige qué dimensión quieres explorar.</h1>
          <p>
            Compara módulos, revisa evidencia externa o busca genes sin tener que conocer
            de antemano cómo está organizado el pipeline.
          </p>
        </div>

        {project && (
          <dl className="results-landing-facts">
            <div><dt>Módulos</dt><dd>{modules?.modules.length ?? '—'}</dd></div>
            <div><dt>Cult×Stage FDR&lt;0,05</dt><dd>{significantCount}</dd></div>
            <div><dt>Reproducibles</dt><dd>{reproducibleCount}</dd></div>
          </dl>
        )}
      </header>

      <DataState loading={loading} error={error} />

      <section className="results-destination-grid" aria-label="Áreas de resultados">
        <Link to="/results/modules" className="results-destination-card results-destination-card--primary">
          <div>
            <span>01</span>
            <h2>Módulos</h2>
            <p>
              Compara M1–M10 por tamaño, interacción, robustez, enriquecimiento y evidencia externa.
            </p>
          </div>
          <strong>Comparar módulos →</strong>
        </Link>

        <Link to="/results/validation" className="results-destination-card">
          <div>
            <span>02</span>
            <h2>Validación</h2>
            <p>
              Revisa concordancia observacional en piel aislada sin mezclarla con el baseline.
            </p>
          </div>
          <strong>Abrir validación →</strong>
        </Link>

        <Link to="/results/genes" className="results-destination-card">
          <div>
            <span>03</span>
            <h2>Genes</h2>
            <p>
              Busca genes priorizados y abre fichas con centralidad, anotación y evidencia externa.
            </p>
          </div>
          <strong>Buscar genes →</strong>
        </Link>
      </section>

      <section className="results-secondary-path">
        <div>
          <p className="eyebrow">Función</p>
          <h2>Explorar enriquecimiento transversal</h2>
          <p>
            MapMan, GO y auditoría de anotaciones siguen disponibles como una vista funcional
            transversal, aunque su contexto natural sea cada módulo.
          </p>
        </div>
        <Link className="button button--secondary" to="/results/function">
          Abrir función
        </Link>
      </section>

      <section className="results-guidance">
        <article>
          <strong>¿No sabes por dónde empezar?</strong>
          <p>M5 es el caso más desarrollado del sitio y conecta trayectoria, hubs, red y validación.</p>
          <Link to="/results/modules/M5">Abrir M5 →</Link>
        </article>
        <article>
          <strong>¿Quieres verificar un resultado?</strong>
          <p>Reproducibilidad conecta claims con archivos, scripts, parámetros, commit y hashes.</p>
          <Link to="/reproducibility">Abrir reproducibilidad →</Link>
        </article>
      </section>
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
    <section className="not-found">
      <span className="not-found-code">404</span>
      <div>
        <p className="eyebrow">Página no encontrada</p>
        <h1>No encontramos esa ruta.</h1>
        <p>
          Puedes volver al overview o entrar directamente a los resultados del estudio.
        </p>
        <div className="not-found-actions">
          <Link className="button button--primary" to="/">Ir al resumen</Link>
          <Link className="button button--secondary" to="/results/modules">Ver resultados</Link>
        </div>
      </div>
    </section>
  )
}
