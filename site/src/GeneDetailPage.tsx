import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  loadExternalValidation,
  loadHubs,
  type ExternalValidationPayload,
  type ExternalValidationRow,
  type HubRow,
} from './data/siteData'
import { formatDecimal, formatScientific } from './utils/format'

function annotationLabel(row: HubRow) {
  if (row.V3_V5_STS_CHS_label_conflict) return 'CHS/STS-like · conflicto de anotación'
  if (row.V3_NAC_label || row.V5_NAC_label) return 'NAC'
  if (row.V3_TF_label || row.V5_TF_label) return 'Factor de transcripción'
  if (row.V5_CHS_label) return 'CHS-like'
  return 'Anotación funcional no resumida'
}

function externalStatus(row: ExternalValidationRow) {
  if (!row.Assayed) return 'No evaluable'
  if (!row.Complete_data) return 'Datos incompletos'
  if (row.Direction_matches_stable_primary === true) return 'Dirección concordante'
  if (row.Direction_matches_stable_primary === false) return 'Dirección no concordante'
  return 'Evaluable'
}

export default function GeneDetailPage() {
  const { geneId } = useParams()
  const [hub, setHub] = useState<HubRow | null>(null)
  const [external, setExternal] = useState<ExternalValidationPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([loadHubs(), loadExternalValidation()])
      .then(([hubsPayload, externalPayload]) => {
        if (!active) return
        const found = hubsPayload.rows.find((row) => row.Gene === geneId) ?? null
        setHub(found)
        setExternal(externalPayload)
        setLoading(false)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'No se pudo cargar la ficha del gen')
        setLoading(false)
      })
    return () => { active = false }
  }, [geneId])

  const externalRows = external?.rows.filter((row) => row.Gene === geneId) ?? []
  const completeRows = externalRows.filter((row) => row.Assayed && row.Complete_data)
  const concordantRows = completeRows.filter((row) => row.Direction_matches_stable_primary === true)

  if (loading) {
    return <div className="data-state" role="status"><span className="data-state-dot" />Cargando ficha del gen…</div>
  }

  if (error) {
    return <div className="data-state data-state--error" role="alert"><strong>No se pudo cargar la ficha.</strong><span>{error}</span></div>
  }

  if (!hub) {
    return (
      <div className="gene-page">
        <header className="gene-intro">
          <p className="eyebrow">Gen</p>
          <h1>{geneId ?? 'Gen'}</h1>
          <p>Este ID no aparece en el ranking de hubs exportado por el sitio.</p>
        </header>
        <Link className="button button--secondary button--fit" to="/modules">Volver a resultados</Link>
      </div>
    )
  }

  const harvest = [
    ['2012', hub.Harvest_CS_minus_PN_2012],
    ['2013', hub.Harvest_CS_minus_PN_2013],
    ['2014', hub.Harvest_CS_minus_PN_2014],
  ] as const

  return (
    <div className="gene-page">
      <header className="gene-intro">
        <div>
          <p className="eyebrow">Resultados / Genes</p>
          <h1>{hub.Gene}</h1>
          <p>{annotationLabel(hub)}</p>
          <div className="gene-actions">
            <Link className="button button--primary" to={'/modules/' + hub.Module}>Ver en {hub.Module}</Link>
            <Link className="button button--secondary" to="/evidence?artifact=hubs">Evidence</Link>
          </div>
        </div>
        <div className="gene-identity-stats">
          <div><span>Módulo</span><strong>{hub.Module}</strong></div>
          <div><span>Rank kWithin</span><strong>#{hub.Rank_kWithin}</strong></div>
          <div><span>kWithin</span><strong>{formatDecimal(hub.kWithin, 3)}</strong></div>
          <div><span>kME</span><strong>{formatDecimal(hub.kME_signed, 3)}</strong></div>
        </div>
      </header>

      <section className="gene-summary-grid">
        <article>
          <p className="eyebrow">Por qué aparece</p>
          <h2>Centralidad intramodular</h2>
          <p>
            Este gen ocupa el rank <strong>#{hub.Rank_kWithin}</strong> por kWithin dentro de {hub.Module}.
            {' '}Esa centralidad lo prioriza para inspección, pero no demuestra que regule causalmente al módulo.
          </p>
        </article>
        <article>
          <p className="eyebrow">Evidencia externa</p>
          <h2>{concordantRows.length}/{completeRows.length || 0} comparaciones concordantes</h2>
          <p>
            El conteo considera solo filas externas evaluables con datos completos. Los datasets externos siguen separados del baseline.
          </p>
        </article>
      </section>

      <section className="gene-section">
        <div className="gene-section-heading">
          <div><p className="eyebrow">Baseline</p><h2>Harvest · Cabernet − Pinot</h2></div>
          <span>{hub.Harvest_same_direction_all_years ? 'misma dirección en 2012–2014' : 'dirección no estable o no disponible'}</span>
        </div>
        <div className="gene-harvest-grid">
          {harvest.map(([year, value]) => (
            <article key={year}>
              <span>{year}</span>
              <strong>{formatDecimal(value, 2)}</strong>
              <small>contraste del eigengene/señal exportada</small>
            </article>
          ))}
        </div>
      </section>

      <section className="gene-section">
        <div className="gene-section-heading">
          <div><p className="eyebrow">Anotación</p><h2>Identidad y contexto</h2></div>
        </div>
        <dl className="gene-annotation-grid">
          <div><dt>Gen legado</dt><dd>{hub.V3_gene ?? '—'}</dd></div>
          <div><dt>Gen v5.1</dt><dd>{hub.V5_gene ?? '—'}</dd></div>
          <div><dt>Locus v5.1</dt><dd>{hub.V5_Chr ?? '—'} {hub.V5_GeneStart ? Number(hub.V5_GeneStart).toLocaleString('es-CL') : ''}</dd></div>
          <div><dt>Top decile kWithin</dt><dd>{hub.Top_decile_kWithin ? 'Sí' : 'No'}</dd></div>
          <div><dt>MapMan v3</dt><dd>{hub.V3_MapMan_annotated ? 'Anotado' : 'No anotado / no disponible'}</dd></div>
          <div><dt>MapMan v5.1</dt><dd>{hub.V5_MapMan_annotated ? 'Anotado' : 'No anotado / no disponible'}</dd></div>
        </dl>
        {hub.V3_V5_STS_CHS_label_conflict && (
          <div className="gene-annotation-warning">
            <strong>Conflicto CHS/STS visible</strong>
            <p>Las fuentes v3 y v5.1 no usan la misma etiqueta funcional para este gen. La ficha conserva esa ambigüedad en vez de resolverla artificialmente.</p>
          </div>
        )}
      </section>

      <section className="gene-section">
        <div className="gene-section-heading">
          <div><p className="eyebrow">Piel externa</p><h2>Validación por dataset</h2></div>
          <Link className="inline-link" to="/validation">Abrir validación global →</Link>
        </div>
        {externalRows.length > 0 ? (
          <div className="gene-external-list">
            {externalRows.map((row) => (
              <article key={row.Dataset + '-' + row.Condition}>
                <div className="gene-external-head">
                  <div><strong>{row.Dataset}</strong><span>{row.Condition} · {row.Platform}</span></div>
                  <span className="gene-external-status">{externalStatus(row)}</span>
                </div>
                <dl>
                  <div><dt>CS − PN</dt><dd>{formatDecimal(row.Mean_CS_minus_PN, 2)}</dd></div>
                  <div><dt>BH top37</dt><dd>{formatScientific(row.BH_prespecified_top37)}</dd></div>
                  <div><dt>BH priority361</dt><dd>{formatScientific(row.BH_priority_361)}</dd></div>
                  <div><dt>Réplicas observadas</dt><dd>{row.CS_observed_replicates}/{row.PN_observed_replicates}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="gene-empty">No hay filas de validación externa exportadas para este gen.</p>
        )}
      </section>

      <section className="gene-boundary">
        <div><p className="eyebrow">Interpretation boundary</p><h2>Prioridad no es causalidad</h2></div>
        <p>
          kWithin, kME, concordancia externa y anotaciones ayudan a priorizar e interpretar este gen;
          {' '}ninguna de esas capas demuestra regulación directa, actividad enzimática o efecto causal sobre grosor de piel.
        </p>
      </section>
    </div>
  )
}