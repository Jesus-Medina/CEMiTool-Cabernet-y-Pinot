import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'

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

export function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Interactive scientific explorer</p>
          <h1>Cabernet Sauvignon <span>×</span> Pinot noir</h1>
          <p className="hero-lede">
            Una interfaz para recorrer la historia científica, explorar resultados y
            rastrear cada visualización hasta su evidencia reproducible.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/story">Entrar a la historia</Link>
            <Link className="button button--secondary" to="/evidence">Ver evidencia</Link>
          </div>
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

      <section className="scaffold-note" aria-labelledby="scaffold-title">
        <p className="eyebrow">WEB-001</p>
        <h2 id="scaffold-title">La estructura está lista para recibir datos</h2>
        <p>
          Esta primera capa solo define navegación, diseño base y páginas. En WEB-002
          los componentes comenzarán a leer resultados canónicos exportados desde el
          repositorio, sin duplicar cifras manualmente.
        </p>
      </section>

      <section className="portal-grid" aria-label="Áreas del explorador">
        <Link className="portal-card" to="/modules">
          <span>01</span><h2>Módulos</h2><p>Trayectorias, robustez y detalle por módulo.</p>
        </Link>
        <Link className="portal-card" to="/validation">
          <span>02</span><h2>Validación</h2><p>Evidencia externa y límites de plataforma.</p>
        </Link>
        <Link className="portal-card" to="/t008">
          <span>03</span><h2>T-008</h2><p>Estado del reprocesamiento moderno.</p>
        </Link>
        <Link className="portal-card" to="/methods">
          <span>04</span><h2>Métodos</h2><p>Decisiones analíticas y rutas hacia el código.</p>
        </Link>
      </section>
    </div>
  )
}

export function StoryPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="STORY"
        title="Historia científica"
        description="Aquí vivirá la narrativa visual del proyecto, desde la pregunta y el diseño hasta la interpretación integrada."
      />
      <PlaceholderPanel title="Narrativa pendiente de WEB-003">
        La historia se conectará a los resultados validados después de construir la capa de exportación canónica.
      </PlaceholderPanel>
    </div>
  )
}

export function ModulesPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="EXPLORE"
        title="Explorador de módulos"
        description="Vista comparativa de módulos, efectos, robustez, enriquecimiento y estado interpretativo."
      />
      <PlaceholderPanel title="Datos pendientes de WEB-002">
        Esta página no contiene todavía números científicos escritos a mano. La tabla se generará desde fuentes canónicas.
      </PlaceholderPanel>
    </div>
  )
}

export function ModuleDetailPage() {
  const { moduleId } = useParams()
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="MODULE DETAIL"
        title={moduleId?.toUpperCase() ?? 'Módulo'}
        description="Trayectoria, genes, enriquecimiento, red y evidencia externa se ensamblarán desde datos canónicos."
      />
      <PlaceholderPanel title="Vista de módulo preparada">
        El routing dinámico ya funciona. WEB-004 dará prioridad a M5 y WEB-007 ampliará la experiencia al resto de módulos.
      </PlaceholderPanel>
    </div>
  )
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
      <PlaceholderPanel title="Ficha preparada">
        El contenido aparecerá únicamente cuando WEB-002 exponga los campos verificados correspondientes.
      </PlaceholderPanel>
    </div>
  )
}

export function ValidationPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="EXTERNAL EVIDENCE"
        title="Validación externa"
        description="Espacio reservado para separar claramente el baseline de las fuentes externas de piel."
      />
      <PlaceholderPanel title="Validación pendiente de WEB-008">
        Los datasets y sus limitaciones se presentarán como evidencia externa, nunca como réplicas adicionales del baseline.
      </PlaceholderPanel>
    </div>
  )
}

export function T008Page() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="MODERN REPROCESSING"
        title="T-008"
        description="Dashboard destinado a reflejar el progreso real del reprocesamiento FASTQ sin convertir un proceso incompleto en una conclusión."
        status="En desarrollo"
      />
      <PlaceholderPanel title="Progreso dinámico pendiente de WEB-009">
        El estado se leerá automáticamente desde el ledger canónico de T-008 después de implementar el exportador.
      </PlaceholderPanel>
    </div>
  )
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
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="EVIDENCE"
        title="Evidencia y trazabilidad"
        description="El futuro visor de provenance conectará afirmaciones y gráficos con tablas, scripts, inputs y commits."
      />
      <PlaceholderPanel title="Provenance pendiente de WEB-002 / WEB-010">
        El esquema se generará de forma automática para evitar referencias manuales que puedan quedar obsoletas.
      </PlaceholderPanel>
    </div>
  )
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
