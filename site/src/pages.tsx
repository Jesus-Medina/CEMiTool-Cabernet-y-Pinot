import { Link, useParams } from 'react-router-dom'
import M5Explorer from './components/M5Explorer'
import { ModuleExplorerDetailPage, ModulesExplorerPage } from './ModuleExplorerPage'
import ExternalValidationPage from './ExternalValidationPage'
import T008DashboardPage from './T008DashboardPage'
import EvidenceBrowserPage from './EvidenceBrowserPage'
import MethodsPageView from './MethodsPage'
import GeneDetailPageView from './GeneDetailPage'
import { useCanonicalData } from './hooks/useCanonicalData'
import { ActionCard, ActionLink, AsyncState, BackLink, ButtonLink } from './components/ui'
import type { M5Profile } from './data/siteData'
import { formatScientific } from './utils/format'

function DataState({
  loading,
  error,
}: {
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return <AsyncState state="loading">Cargando resultados canónicos…</AsyncState>
  }

  if (error) {
    return <AsyncState state="error" title="No se pudieron cargar los datos generados.">{error}</AsyncState>
  }

  return null
}

function M5MiniTrajectory({ profiles }: { profiles: M5Profile[] }) {
  const preferredStages = ['FruitSet', 'Veraison', 'Harvest']
  const stages = preferredStages.filter((stage) => profiles.some((row) => row.Stage === stage))
  const years = [...new Set(profiles.map((row) => row.Year))].sort((a, b) => a - b)
  const cultivars = [...new Set(profiles.map((row) => row.Cultivar))]
  const values = profiles.map((row) => row.Mean)
  const rawMin = Math.min(0, ...values)
  const rawMax = Math.max(0, ...values)
  const padding = Math.max(2, (rawMax - rawMin) * 0.08)
  const yMin = rawMin - padding
  const yMax = rawMax + padding
  const xAt = (index: number) => 20 + index * 80
  const yAt = (value: number) => 112 - ((value - yMin) / (yMax - yMin || 1)) * 92

  return (
    <div className="home-v2-m5-mini-chart">
      <div className="home-v2-m5-legend" aria-label="Leyenda de cultivares">
        {cultivars.map((cultivar, index) => (
          <span key={cultivar} className={index === 0 ? 'is-cabernet' : 'is-pinot'}>
            <i aria-hidden="true" />{cultivar}
          </span>
        ))}
      </div>
      <div className="home-v2-m5-panels">
        {years.map((year) => (
          <figure key={year}>
            <figcaption>{year}</figcaption>
            <svg viewBox="0 0 200 145" role="img" aria-label={`Trayectoria media M5 en ${year}`}>
              <line className="home-v2-m5-zero" x1="16" x2="184" y1={yAt(0)} y2={yAt(0)} />
              {cultivars.map((cultivar, cultivarIndex) => {
                const rows = stages
                  .map((stage) => profiles.find((row) => row.Year === year && row.Cultivar === cultivar && row.Stage === stage))
                  .filter((row): row is M5Profile => Boolean(row))
                const points = rows.map((row) => `${xAt(stages.indexOf(row.Stage))},${yAt(row.Mean)}`).join(' ')
                const cultivarClass = cultivarIndex === 0 ? 'is-cabernet' : 'is-pinot'
                return (
                  <g key={cultivar} className={cultivarClass}>
                    <polyline points={points} />
                    {rows.map((row) => (
                      <circle key={`${cultivar}-${row.Stage}`} cx={xAt(stages.indexOf(row.Stage))} cy={yAt(row.Mean)} r="4">
                        <title>{cultivar}, {row.Stage}: media {row.Mean.toFixed(2)}</title>
                      </circle>
                    ))}
                  </g>
                )
              })}
              {stages.map((stage, index) => (
                <text key={stage} x={xAt(index)} y="137" textAnchor="middle">
                  {stage === 'FruitSet' ? 'FruitSet' : stage === 'Veraison' ? 'Veraison' : 'Harvest'}
                </text>
              ))}
            </svg>
          </figure>
        ))}
      </div>
      <p>Media del eigengene M5 por cultivar, etapa y año; la línea discontinua marca cero.</p>
    </div>
  )
}

export function HomePage() {
  const { project, modules, m5: m5Trajectory, loading, error } = useCanonicalData()
  const m5 = modules?.modules.find((row) => row.module === 'M5') ?? null
  const m10 = modules?.modules.find((row) => row.module === 'M10') ?? null
  const moduleCount = modules?.modules.length ?? 10
  const significantModuleCount = modules?.modules.filter((row) => row.cultivar_stage_significant_fdr05).length ?? 5
  const replicates = project?.design.replicates_per_cell_values[0] ?? 3
  const samplesPerCultivarStage = project
    ? project.design.years.length * replicates
    : 9
  const m5HarvestContrasts = m5Trajectory?.contrasts.filter((row) => row.Stage === 'Harvest') ?? []
  const m5HarvestNegativeAllYears =
    m5HarvestContrasts.length > 0 && m5HarvestContrasts.every((row) => row.estimate < 0)

  return (
    <div className="home-v2">
      <section className="home-v2-hero">
        <div className="home-v2-hero-copy">
          <p className="home-v2-kicker">Pregunta científica</p>
          <h1>
            ¿Cómo difieren los programas de coexpresión entre{' '}
            <span>Cabernet Sauvignon</span> y <span>Pinot noir</span> durante la maduración?
          </h1>
          <p className="home-v2-lede">
            El estudio parte de 54 muestras de pericarpio, compara cultivares y etapas,
            evalúa la robustez entre años y después busca apoyo observacional independiente
            en piel de uva.
          </p>
          <div className="home-v2-actions">
            <ButtonLink variant="primary" to="/results">
              Explorar resultados <span aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink variant="secondary" to="/methods">
              Ver métodos
            </ButtonLink>
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

      {project && (
        <section className="home-v2-section home-v2-design" aria-labelledby="home-v2-design-title">
          <div className="home-v2-section-heading">
            <p>Diseño del estudio</p>
            <h2 id="home-v2-design-title">Un diseño balanceado de {project.design.sample_count} muestras</h2>
          </div>
          <div className="home-v2-design-equation" aria-label={`${project.design.cultivars.length} cultivares por ${project.design.stages.length} etapas por ${project.design.years.length} años por ${replicates} réplicas equivalen a ${project.design.sample_count} muestras`}>
            <span><strong>{project.design.cultivars.length}</strong> cultivares</span>
            <b aria-hidden="true">×</b>
            <span><strong>{project.design.stages.length}</strong> etapas</span>
            <b aria-hidden="true">×</b>
            <span><strong>{project.design.years.length}</strong> años</span>
            <b aria-hidden="true">×</b>
            <span><strong>{replicates}</strong> réplicas</span>
            <b aria-hidden="true">=</b>
            <span className="home-v2-design-total"><strong>{project.design.sample_count}</strong> muestras</span>
          </div>

          <div className="home-v2-design-layout">
            <div className="home-v2-design-table-wrap">
              <table className="home-v2-design-matrix">
                <caption>
                  Distribución de muestras por cultivar y etapa; cada celda reúne los tres años.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Cultivar</th>
                    {project.design.stages.map((stage) => <th scope="col" key={stage}>{stage}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {project.design.cultivars.map((cultivar) => (
                    <tr key={cultivar}>
                      <th scope="row">{cultivar}</th>
                      {project.design.stages.map((stage) => (
                        <td key={`${cultivar}-${stage}`} data-stage={stage}>
                          <strong>{samplesPerCultivarStage} muestras</strong>
                          <span>{project.design.years.length} años × {replicates} réplicas</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="home-v2-design-note" aria-label="Cómo leer el diseño">
              <p>Cómo leerlo</p>
              <strong>{project.design.balanced ? 'Todas las combinaciones están balanceadas.' : 'El exportador no marca este diseño como balanceado.'}</strong>
              <ul>
                <li>Cada cruce cultivar × etapa contiene {samplesPerCultivarStage} muestras.</li>
                <li>Los años {project.design.years.join(', ')} permanecen explícitos en los modelos.</li>
                <li>El tejido del baseline es pericarpio completo, no piel aislada.</li>
              </ul>
              <ActionLink to="/methods">Ver selección y modelo</ActionLink>
            </aside>
          </div>
        </section>
      )}

      <section className="home-v2-section home-v2-findings" aria-labelledby="home-v2-findings-title">
        <div className="home-v2-section-heading">
          <p>Hallazgos principales</p>
          <h2 id="home-v2-findings-title">Qué encontró el análisis</h2>
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
        <section className="home-v2-section home-v2-evidence-path" aria-labelledby="home-v2-evidence-title">
          <div className="home-v2-section-heading">
            <p>Ruta de evidencia</p>
            <h2 id="home-v2-evidence-title">Cómo se acumula la evidencia</h2>
          </div>
          <ol className="home-v2-evidence-ladder">
            <li>
              <span>01</span>
              <div>
                <h3>Red principal y sensibilidad</h3>
                <p>
                  β{project.network.primary_beta} es la red principal
                  {project.network.scale_free_r2 != null
                    ? ` (R² ${project.network.scale_free_r2.toFixed(3)})`
                    : ''}; β7 conserva el papel de análisis de sensibilidad.
                </p>
                <ActionLink to="/methods">Revisar método</ActionLink>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Robustez entre años</h3>
                <p>
                  M10 cumple la regla de reproducibilidad. M5 depende del año a nivel global,
                  aunque Harvest mantiene dirección negativa en 2012, 2013 y 2014.
                </p>
                <ActionLink to="/results/modules">Comparar módulos</ActionLink>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Función e identidad</h3>
                <p>
                  El enriquecimiento interpreta módulos completos. La identidad CHS frente a
                  STS continúa ambigua y se muestra como límite, no como etiqueta resuelta.
                </p>
                <ActionLink to="/results/function">Explorar función</ActionLink>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Validación y reprocesamiento</h3>
                <p>
                  La evidencia en piel aislada permanece separada. T-008 lleva{' '}
                  {project.t008.validated_runs}/{project.t008.total_runs} corridas validadas;
                  el núcleo mapeable de M5, M10 y M2 muestra preservación moderada, con cobertura explícita.
                </p>
                <ActionLink to="/status/t008">Ver estado T-008</ActionLink>
              </div>
            </li>
          </ol>
        </section>
      )}

      <section className="home-v2-section home-v2-m5" aria-labelledby="home-v2-m5-title">
        <div className="home-v2-m5-copy">
          <p className="home-v2-section-kicker">Resultado destacado</p>
          <h2 id="home-v2-m5-title"><span>M5</span> concentra la interacción más fuerte</h2>
          <p>
            Su trayectoria cambia de forma distinta entre cultivares durante la maduración.
            {m5HarvestNegativeAllYears
              ? ' En Harvest, el contraste Cabernet − Pinot conserva dirección negativa en los tres años.'
              : ' La dirección de Harvest debe revisarse por año.'}
          </p>
          <dl className="home-v2-m5-metrics">
            <div><dt>Genes</dt><dd>{m5?.gene_count ?? 108}</dd></div>
            <div><dt>FDR Cultivar×Stage</dt><dd>{formatScientific(m5?.cultivar_stage_fdr)}</dd></div>
            <div><dt>Años con Harvest</dt><dd>{m5HarvestContrasts.length}/3</dd></div>
          </dl>
          <ActionLink to="/results/modules/M5">Ver detalle de M5</ActionLink>
        </div>

        <figure className="home-v2-m5-chart">
          <figcaption>
            <span>Trayectoria observada</span>
            <strong>M5 por etapa y año</strong>
          </figcaption>
          {m5Trajectory?.profiles.length
            ? <M5MiniTrajectory profiles={m5Trajectory.profiles} />
            : <AsyncState state="loading">Cargando trayectoria M5…</AsyncState>}
        </figure>

        <aside className="home-v2-m5-caveat">
          <p>Límite de interpretación</p>
          <h3>Fuerte no significa estable en todo el desarrollo</h3>
          <p>
            M5 es <strong>dependiente del año a nivel global</strong>. La consistencia de
            Harvest no autoriza a generalizar todas las etapas ni demuestra causalidad,
            grosor de piel o identidad funcional CHS/STS.
          </p>
          <ActionLink to="/results/modules/M5">Revisar robustez</ActionLink>
        </aside>
      </section>

      <section className="home-v2-section home-v2-limits" aria-labelledby="home-v2-limits-title">
        <div className="home-v2-section-heading">
          <p>Frontera de la evidencia</p>
          <h2 id="home-v2-limits-title">Qué sabemos y qué todavía no sabemos</h2>
        </div>
        <div className="home-v2-knowledge-grid">
          <article className="home-v2-knowledge-panel home-v2-knowledge-panel--known">
            <header>
              <span aria-hidden="true">✓</span>
              <div><p>Respaldado</p><h3>Qué sabemos</h3></div>
            </header>
            <ul>
              <li><strong>Diseño verificable.</strong> Hay {project?.design.sample_count ?? 54} muestras balanceadas de pericarpio completo.</li>
              <li><strong>Diferencias de programa.</strong> {significantModuleCount} módulos muestran interacción Cultivar×Stage con FDR&lt;0,05.</li>
              <li><strong>Robustez diferenciada.</strong> M10 cumple la regla anual; M5 conserva la dirección de Harvest en los tres años.</li>
              <li><strong>Apoyo externo separado.</strong> Algunos hubs encuentran concordancia observacional en datasets de piel aislada.</li>
            </ul>
          </article>

          <article className="home-v2-knowledge-panel home-v2-knowledge-panel--unknown">
            <header>
              <span aria-hidden="true">?</span>
              <div><p>No demostrado</p><h3>Qué todavía no sabemos</h3></div>
            </header>
            <ul>
              <li><strong>Grosor de piel y causalidad.</strong> GSE98923 no mide grosor ni permite atribuirlo a un módulo o hub.</li>
              <li><strong>Especificidad de tejido.</strong> La señal del baseline no puede considerarse exclusiva de piel.</li>
              <li><strong>Identidad CHS/STS.</strong> La anotación disponible no resuelve con certeza esta familia en M5.</li>
              <li><strong>Preservación fuera del núcleo mapeable.</strong> T-008 completó 54/54 corridas, pero no puede evaluar genes sin equivalencia recíproca ni declarar preservado un módulo completo cuando la cobertura es parcial.</li>
            </ul>
          </article>
        </div>
      </section>
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

        <div className="results-landing-visual" aria-hidden={!project}>
          {project && (
            <dl className="results-landing-facts">
              <div><dt>Módulos</dt><dd>{modules?.modules.length ?? '—'}</dd></div>
              <div><dt>Cult×Stage FDR&lt;0,05</dt><dd>{significantCount}</dd></div>
              <div><dt>Reproducibles</dt><dd>{reproducibleCount}</dd></div>
            </dl>
          )}
          <img
            src={`${import.meta.env.BASE_URL}assets/results/results-grape-cluster.png`}
            alt=""
          />
        </div>
      </header>

      <DataState loading={loading} error={error} />

      <section className="results-secondary-path">
        <div>
          <p className="eyebrow">Lectura integrada</p>
          <h2>Síntesis científica del estudio</h2>
          <p>
            Conecta robustez anual, función, hubs, validación externa y reprocesamiento moderno
            en una conclusión calibrada y lista para lectura.
          </p>
        </div>
        <ButtonLink variant="primary" to="/results/synthesis">
          Leer síntesis
        </ButtonLink>
      </section>

      <section className="results-destination-grid" aria-label="Áreas de resultados">
        <ActionCard to="/results/modules" featured className="results-destination-card results-destination-card--primary">
          <div>
            <span>01</span>
            <h2>Módulos</h2>
            <p>
              Compara M1–M10 por tamaño, interacción, robustez, enriquecimiento y evidencia externa.
            </p>
          </div>
          <strong>Comparar módulos →</strong>
        </ActionCard>

        <ActionCard to="/results/validation" className="results-destination-card">
          <div>
            <span>02</span>
            <h2>Validación</h2>
            <p>
              Revisa concordancia observacional en piel aislada sin mezclarla con el baseline.
            </p>
          </div>
          <strong>Abrir validación →</strong>
        </ActionCard>

        <ActionCard to="/results/genes" className="results-destination-card">
          <div>
            <span>03</span>
            <h2>Genes</h2>
            <p>
              Busca genes priorizados y abre fichas con centralidad, anotación y evidencia externa.
            </p>
          </div>
          <strong>Buscar genes →</strong>
        </ActionCard>
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
        <ButtonLink to="/results/function">
          Abrir función
        </ButtonLink>
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
  return (
    <div className="result-child-page">
      <BackLink to="/results">Volver a Resultados</BackLink>
      <ModulesExplorerPage />
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
  return <GeneDetailPageView />
}

export function ValidationPage() {
  return (
    <div className="result-child-page">
      <BackLink to="/results">Volver a Resultados</BackLink>
      <ExternalValidationPage />
    </div>
  )
}

export function T008Page() {
  return (
    <div className="result-child-page">
      <BackLink to="/reproducibility">Volver a Reproducibilidad</BackLink>
      <T008DashboardPage />
    </div>
  )
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
          <ButtonLink variant="primary" to="/">Ir al resumen</ButtonLink>
          <ButtonLink to="/results/modules">Ver resultados</ButtonLink>
        </div>
      </div>
    </section>
  )
}
