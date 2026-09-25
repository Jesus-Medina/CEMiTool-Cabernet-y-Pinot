import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncState, BackLink, Badge, Callout } from './components/ui'
import { loadT008Progress, type T008ProgressPayload } from './data/siteData'
import { useCanonicalData } from './hooks/useCanonicalData'
import { formatDecimal, formatScientific } from './utils/format'

const BASE = import.meta.env.BASE_URL

export default function SynthesisPage() {
  const { project, modules, loading, error } = useCanonicalData()
  const [modern, setModern] = useState<T008ProgressPayload | null>(null)
  const [modernError, setModernError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    loadT008Progress()
      .then((payload) => {
        if (active) setModern(payload)
      })
      .catch((reason: unknown) => {
        if (active) setModernError(reason instanceof Error ? reason.message : 'No se pudo cargar la preservación moderna')
      })
    return () => { active = false }
  }, [])

  const moduleMap = useMemo(
    () => new Map(modules?.modules.map((row) => [row.module, row]) ?? []),
    [modules],
  )
  const preservationMap = useMemo(
    () => new Map(modern?.analysis.module_results.map((row) => [row.module, row]) ?? []),
    [modern],
  )

  const m5 = moduleMap.get('M5')
  const m10 = moduleMap.get('M10')
  const m2 = moduleMap.get('M2')
  const m5Modern = preservationMap.get('M5')
  const m10Modern = preservationMap.get('M10')
  const m2Modern = preservationMap.get('M2')

  return (
    <div className="synthesis-page">
      <BackLink to="/results">Volver a Resultados</BackLink>

      <header className="synthesis-hero">
        <div>
          <p className="eyebrow">Síntesis científica integrada</p>
          <h1>Programas de coexpresión durante la maduración de Cabernet Sauvignon y Pinot noir</h1>
          <p>
            Una lectura conjunta de la red beta10, la robustez entre años, la función,
            los genes hub, la evidencia externa en piel y el reprocesamiento moderno.
          </p>
          <div className="synthesis-hero-badges" aria-label="Alcance del estudio">
            <Badge tone="brand">GSE98923</Badge>
            <Badge tone="neutral">{project?.design.sample_count ?? 54} muestras</Badge>
            <Badge tone="info">Pericarpio completo</Badge>
            <Badge tone="success">Reprocesamiento 54/54</Badge>
          </div>
        </div>
        <aside>
          <span>Conclusión central</span>
          <strong>M5 es el programa candidato con mayor convergencia de evidencia.</strong>
          <p>M10 aporta la señal modular más reproducible entre años y M2 exige interpretar únicamente su núcleo mapeable.</p>
        </aside>
      </header>

      {(loading || (!modern && !modernError)) && (
        <AsyncState state="loading">Cargando la evidencia canónica…</AsyncState>
      )}
      {(error || modernError) && (
        <AsyncState state="error" title="No se pudo completar la síntesis dinámica.">
          {error ?? modernError}
        </AsyncState>
      )}

      <section className="synthesis-section" aria-labelledby="synthesis-priorities-title">
        <div className="synthesis-section-heading">
          <p className="eyebrow">Jerarquía de resultados</p>
          <h2 id="synthesis-priorities-title">Tres señales prioritarias, con fortalezas distintas</h2>
          <p>No existe un score agregado: cada capa responde una pregunta científica diferente.</p>
        </div>

        <div className="synthesis-priority-grid">
          <article className="synthesis-priority-card synthesis-priority-card--lead">
            <div><Badge tone="brand">Candidato integrado principal</Badge><strong>M5</strong></div>
            <h3>Convergencia funcional, temporal y externa</h3>
            <p>
              Presenta la interacción Cultivar×Stage más fuerte, dirección Harvest repetida,
              enriquecimiento fenilpropanoide/estilbenoide y hubs con apoyo externo.
            </p>
            <dl>
              <div><dt>FDR interacción</dt><dd>{formatScientific(m5?.cultivar_stage_fdr)}</dd></div>
              <div><dt>Núcleo moderno</dt><dd>{m5Modern ? `${m5Modern.mapped_genes}/${m5Modern.total_beta10_genes}` : '76/108'}</dd></div>
              <div><dt>Zsummary</dt><dd>{formatDecimal(m5Modern?.zsummary, 2)}</dd></div>
            </dl>
            <Link to="/results/modules/M5">Explorar M5 →</Link>
          </article>

          <article className="synthesis-priority-card">
            <div><Badge tone="success">Reproducibilidad anual</Badge><strong>M10</strong></div>
            <h3>La señal modular más estable entre años</h3>
            <p>
              Cumple la regla preespecificada de reproducibilidad, aunque su apoyo funcional
              y la validación individual de hubs son más limitados que en M5.
            </p>
            <dl>
              <div><dt>Clasificación</dt><dd>{m10?.robustness_classification ?? 'reproducible'}</dd></div>
              <div><dt>Núcleo moderno</dt><dd>{m10Modern ? `${m10Modern.mapped_genes}/${m10Modern.total_beta10_genes}` : '21/39'}</dd></div>
              <div><dt>Zsummary</dt><dd>{formatDecimal(m10Modern?.zsummary, 2)}</dd></div>
            </dl>
            <Link to="/results/modules/M10">Explorar M10 →</Link>
          </article>

          <article className="synthesis-priority-card">
            <div><Badge tone="warning">Cobertura limitada</Badge><strong>M2</strong></div>
            <h3>Un núcleo preservado, no el módulo completo</h3>
            <p>
              Conserva contrastes Veraison/Harvest y estructura en el subconjunto comparable,
              pero paralogía, referencia y variación estructural siguen abiertas.
            </p>
            <dl>
              <div><dt>FDR interacción</dt><dd>{formatScientific(m2?.cultivar_stage_fdr)}</dd></div>
              <div><dt>Núcleo moderno</dt><dd>{m2Modern ? `${m2Modern.mapped_genes}/${m2Modern.total_beta10_genes}` : '81/214'}</dd></div>
              <div><dt>Cobertura</dt><dd>{m2Modern ? `${formatDecimal(100 * m2Modern.mapped_fraction, 1)}%` : '37,9%'}</dd></div>
            </dl>
            <Link to="/results/modules/M2">Explorar M2 →</Link>
          </article>
        </div>
      </section>

      <section className="synthesis-section synthesis-evidence" aria-labelledby="synthesis-evidence-title">
        <div className="synthesis-section-heading">
          <p className="eyebrow">Ruta de evidencia</p>
          <h2 id="synthesis-evidence-title">De la asociación a una prioridad experimental</h2>
        </div>
        <ol>
          <li><span>01</span><div><strong>Red y estadística</strong><p>Beta10 define los módulos; el modelo factorial identifica diferencias dependientes de cultivar y etapa manteniendo Year explícito.</p></div></li>
          <li><span>02</span><div><strong>Robustez entre añadas</strong><p>La interacción completa separa patrones reproducibles de señales dependientes de un año.</p></div></li>
          <li><span>03</span><div><strong>Función y hubs</strong><p>MapMan, GO auditado y kWithin priorizan procesos y genes sin convertir enriquecimiento o centralidad en mecanismo.</p></div></li>
          <li><span>04</span><div><strong>Evidencia en piel aislada</strong><p>Dos fuentes externas apoyan candidatos concretos, pero permanecen separadas de las 54 muestras del baseline.</p></div></li>
          <li><span>05</span><div><strong>Reprocesamiento moderno</strong><p>Las 54 corridas validan matrices y preservación únicamente dentro de 1.922 genes con equivalencia recíproca.</p></div></li>
        </ol>
      </section>

      <Callout tone="warning" eyebrow="Límite científico" title="La evidencia converge, pero no demuestra causalidad ni grosor de piel">
        <p>
          El tejido primario es pericarpio, no piel aislada; no existe una medición directa de
          grosor. Tampoco está resuelta la identidad CHS frente a STS del bloque familiar de M5.
          Los resultados priorizan programas y candidatos para validación experimental.
        </p>
      </Callout>

      <section className="synthesis-section synthesis-downloads" aria-labelledby="synthesis-downloads-title">
        <div className="synthesis-section-heading">
          <p className="eyebrow">Documentos del estudio</p>
          <h2 id="synthesis-downloads-title">Lee o descarga la versión completa</h2>
        </div>
        <div className="synthesis-download-grid">
          <article>
            <span>Lectura científica</span>
            <h3>Manuscrito integrado</h3>
            <p>Narrativa concisa de métodos, resultados, discusión y limitaciones.</p>
            <div><a className="button button--primary" href={`${BASE}reports/scientific-synthesis-manuscript.html`}>Leer en HTML</a><a href={`${BASE}reports/scientific-synthesis-manuscript.pdf`} target="_blank" rel="noreferrer">Descargar PDF ↗</a></div>
          </article>
          <article>
            <span>Registro analítico</span>
            <h3>Informe técnico completo</h3>
            <p>Diagnósticos, tablas, resultados acumulativos y detalles reproducibles.</p>
            <div><a className="button button--secondary" href={`${BASE}reports/complete-technical-analysis.pdf`} target="_blank" rel="noreferrer">Abrir informe PDF</a><Link to="/reproducibility">Auditar evidencia →</Link></div>
          </article>
        </div>
      </section>
    </div>
  )
}
