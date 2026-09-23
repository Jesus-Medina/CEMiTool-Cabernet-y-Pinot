import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadHubs, loadExternalValidation, type HubRow, type ExternalValidationRow } from './data/siteData'
import { formatDecimal, formatScientific } from './utils/format'

export function GeneSearchPage() {
  const [hubs, setHubs] = useState<HubRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    loadHubs()
      .then((payload) => {
        if (active) setHubs(payload.rows)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Error al cargar genes')
      })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return hubs.slice(0, 100) // solo los primeros si no hay filtro
    return hubs.filter(row => 
      row.Gene.toLowerCase().includes(q) || 
      (row.V3_gene && row.V3_gene.toLowerCase().includes(q)) ||
      (row.V5_gene && row.V5_gene.toLowerCase().includes(q))
    ).slice(0, 200)
  }, [hubs, query])

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Buscador de Genes</p>
          <h1>Explorar genes priorizados</h1>
          <p className="lede">
            Busca información detallada sobre los genes que fueron evaluados como hubs en los módulos priorizados (M5, M10, M2).
          </p>
        </div>
      </section>

      {error && <div className="data-state data-state--error">{error}</div>}
      {!error && hubs.length === 0 && <div className="data-state"><span className="data-state-dot"/>Cargando genes...</div>}

      {hubs.length > 0 && (
        <>
          <section className="validation-controls" style={{ marginBottom: '2rem' }}>
            <label className="validation-search" style={{ width: '100%', maxWidth: '600px' }}>
              <span>Buscar por ID (ej. VIT_12s...) o anotación</span>
              <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ej: VIT_12s0028g00860, CHS, NAC..." />
            </label>
          </section>

          <div className="scientific-table-wrap">
            <table className="scientific-table">
              <thead>
                <tr>
                  <th>Gen (V1)</th>
                  <th>Módulo</th>
                  <th>Rank kWithin</th>
                  <th>Anotación V3</th>
                  <th>Anotación V5</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.Gene}>
                    <td><code>{row.Gene}</code></td>
                    <td><Link to={`/results/modules/${row.Module}`}>{row.Module}</Link></td>
                    <td>{row.Rank_kWithin}</td>
                    <td>{row.V3_gene || '—'}</td>
                    <td>{row.V5_gene || '—'}</td>
                    <td>
                      <Link to={`/results/genes/${row.Gene}`} className="inline-link">Ver ficha →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {query.trim() === '' && <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Mostrando 100 genes (de {hubs.length}). Usa el buscador para encontrar genes específicos.</p>}
        </>
      )}
    </div>
  )
}

export function GeneDetailPage() {
  const { geneId } = useParams()
  const [hub, setHub] = useState<HubRow | null>(null)
  const [ext, setExt] = useState<ExternalValidationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!geneId) return
    let active = true
    Promise.all([loadHubs(), loadExternalValidation()])
      .then(([hubsPayload, extPayload]) => {
        if (!active) return
        const found = hubsPayload.rows.find(r => r.Gene === geneId)
        if (found) {
          setHub(found)
        } else {
          setError(`El gen ${geneId} no se encuentra en los módulos priorizados (M5, M10, M2).`)
        }
        setExt(extPayload.rows.filter(r => r.Gene === geneId))
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Error al cargar el gen')
        setLoading(false)
      })
    return () => { active = false }
  }, [geneId])

  if (loading) return <div className="data-state"><span className="data-state-dot"/>Cargando ficha del gen...</div>
  if (error) return (
    <div className="page-stack">
      <section className="page-intro">
        <div><p className="eyebrow">ERROR</p><h1>Gen no encontrado</h1><p className="lede">{error}</p></div>
      </section>
      <Link to="/results/genes" className="button button--secondary button--fit">Volver al buscador</Link>
    </div>
  )
  if (!hub) return null

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Ficha de Gen</p>
          <h1><code>{hub.Gene}</code></h1>
          <p className="lede">
            Pertenece al módulo <strong>{hub.Module}</strong>, ranking <strong>#{hub.Rank_kWithin}</strong> en centralidad (kWithin).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to={`/results/modules/${hub.Module}`} className="button button--secondary">Ver en módulo {hub.Module}</Link>
          <Link to="/results/genes" className="button button--secondary">Volver al buscador</Link>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <section className="boundary-card">
          <p className="eyebrow">Identidad y Anotaciones</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>V3 MapMan:</strong> {hub.V3_gene || '—'} {hub.V3_MapMan_annotated ? '✓' : ''}</li>
            <li><strong>V5 MapMan:</strong> {hub.V5_gene || '—'} {hub.V5_MapMan_annotated ? '✓' : ''}</li>
            {hub.V5_Chr && <li><strong>Locus (V5):</strong> Chr {hub.V5_Chr}:{hub.V5_GeneStart}-{hub.V5_GeneEnd}</li>}
          </ul>
          {hub.V3_V5_STS_CHS_label_conflict && (
            <div className="coverage-warning" style={{ padding: '0.5rem', borderRadius: '4px', marginTop: '1rem' }}>
              ⚠️ Conflicto de anotación (CHS vs STS) detectado entre versiones.
            </div>
          )}
        </section>

        <section className="boundary-card">
          <p className="eyebrow">Centralidad (Harvest Baseline)</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>kWithin:</strong> {formatDecimal(hub.kWithin, 2)} (Rank #{hub.Rank_kWithin})</li>
            <li><strong>kME (Module Membership):</strong> {formatDecimal(hub.kME_signed, 3)}</li>
            <li><strong>Top Decil kWithin:</strong> {hub.Top_decile_kWithin ? 'Sí' : 'No'}</li>
          </ul>
        </section>
      </div>

      <section className="validation-table-panel" style={{ marginTop: '3rem' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evidencia Externa</p>
            <h2>Comparación de efecto CS-PN en piel aislada</h2>
          </div>
        </div>
        {ext.length > 0 ? (
          <div className="scientific-table-wrap">
            <table className="scientific-table validation-table">
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Condición</th>
                  <th>Evaluable</th>
                  <th>Efecto externo (CS-PN)</th>
                  <th>BH37 (Preespecificado)</th>
                  <th>Concordancia de signo</th>
                </tr>
              </thead>
              <tbody>
                {ext.map(row => (
                  <tr key={`${row.Dataset}-${row.Condition}`}>
                    <td>{row.Dataset}</td>
                    <td>{row.Condition}</td>
                    <td>{row.Assayed && row.Complete_data ? 'Sí' : 'No'}</td>
                    <td>{row.Mean_CS_minus_PN !== null ? formatDecimal(row.Mean_CS_minus_PN, 2) : '—'}</td>
                    <td>{row.BH_prespecified_top37 !== null ? formatScientific(row.BH_prespecified_top37) : '—'}</td>
                    <td>{row.Direction_matches_stable_primary === true ? 'Sí' : row.Direction_matches_stable_primary === false ? 'No' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No se extrajo evidencia externa priorizada para este gen.</p>
        )}
      </section>

    </div>
  )
}
