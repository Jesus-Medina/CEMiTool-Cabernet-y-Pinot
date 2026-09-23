import { Link } from 'react-router-dom'
import type { ExternalValidationPayload, HubsPayload, ModuleContrast, ModuleSummary } from '../data/siteData'
import type { FunctionalEnrichmentPayload } from '../data/enrichmentData'
import { formatDecimal, formatScientific } from '../utils/format'

export function statusLabel(row: ModuleSummary) {
  if (row.robustness_classification === 'reproducible') return 'Reproducible'
  if (row.robustness_classification === 'year-dependent') return 'Dependiente del año'
  return 'Sin clasificación prioritaria'
}

export function ContrastMatrix({ rows, module }: { rows: ModuleContrast[]; module: string }) {
  const moduleRows = rows.filter((row) => row.Module === module)
  const stages = ['FruitSet', 'Veraison', 'Harvest']
  const years = [2012, 2013, 2014]

  return (
    <section className="module-detail-section">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Robustez anual</p>
          <h2>Contraste Cabernet − Pinot por etapa y año</h2>
        </div>
        <div>
          <p>La dirección y la magnitud se muestran por celda. El FDR global corresponde a la familia de 90 contrastes.</p>
          <Link className="inline-link" to="/evidence?artifact=module_contrasts">ⓘ Ver provenance →</Link>
        </div>
      </div>

      <div className="contrast-matrix" role="table" aria-label={`Contrastes de ${module}`}>
        <div className="contrast-cell contrast-cell--header" />
        {years.map((year) => (
          <div key={year} className="contrast-cell contrast-cell--header" role="columnheader">{year}</div>
        ))}
        {stages.map((stage) => (
          <div className="contrast-matrix-row" key={stage}>
            <div className="contrast-cell contrast-cell--stage" role="rowheader">{stage}</div>
            {years.map((year) => {
              const row = moduleRows.find((item) => item.Stage === stage && item.Year === year)
              const significant = row?.FDR_global_90 !== null && row?.FDR_global_90 !== undefined && row.FDR_global_90 < 0.05
              const direction = row ? (row.estimate < 0 ? 'negative' : 'positive') : 'missing'
              return (
                <div key={year} className={`contrast-cell contrast-cell--value contrast-cell--${direction} ${significant ? 'contrast-cell--significant' : ''}`} role="cell">
                  <strong>{formatDecimal(row?.estimate, 2)}</strong>
                  <span>FDR {formatScientific(row?.FDR_global_90)}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="module-footnote">Valores negativos = eigengene menor en Cabernet Sauvignon que en Pinot noir. La matriz no implica causalidad.</p>
    </section>
  )
}

export function ModuleHubs({ data, module }: { data: HubsPayload; module: string }) {
  const rows = data.rows.filter((row) => row.Module === module).sort((a, b) => a.Rank_kWithin - b.Rank_kWithin).slice(0, 12)
  if (rows.length === 0) return null
  return (
    <section className="module-detail-section">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Hub ranking</p>
          <h2>Top 12 por kWithin</h2>
        </div>
        <p>Centralidad intramodular, no jerarquía causal.</p>
      </div>
      <div className="scientific-table-wrap">
        <table className="scientific-table">
          <thead>
            <tr><th>Rank</th><th>Gen</th><th>kWithin</th><th>kME</th><th>Top decile</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.Gene}>
                <td>{row.Rank_kWithin}</td>
                <td><Link to={`/genes/${row.Gene}`}><code>{row.Gene}</code></Link></td>
                <td>{formatDecimal(row.kWithin, 3)}</td>
                <td>{formatDecimal(row.kME_signed, 3)}</td>
                <td>{row.Top_decile_kWithin ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function ModuleFunctionalSummary({ enrichment, module }: { enrichment: FunctionalEnrichmentPayload; module: string }) {
  const terms = enrichment.terms.filter((row) => row.Source === 'v3_mapman' && row.Module === module && row.FDR_global_module_terms !== null && row.FDR_global_module_terms < 0.05).sort((a, b) => (a.FDR_global_module_terms ?? 1) - (b.FDR_global_module_terms ?? 1)).slice(0, 5)
  return (
    <section className="module-detail-section">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Functional enrichment</p>
          <h2>MapMan v3 · hits globales</h2>
        </div>
        <Link className="inline-link" to="/enrichment">Abrir explorador de enriquecimiento →</Link>
      </div>
      {terms.length === 0 ? (
        <div className="module-empty">No hay términos MapMan v3 con FDR global &lt; 0,05 para {module}. Esto no equivale a “sin función”.</div>
      ) : (
        <div className="module-term-list">
          {terms.map((row) => (
            <article key={row.TermID}>
              <span>{row.TermID}</span>
              <strong>{row.TermName}</strong>
              <small>fold {formatDecimal(row.Fold_enrichment, 2)} · FDR {formatScientific(row.FDR_global_module_terms)}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function ModuleExternalSummary({ external, module }: { external: ExternalValidationPayload; module: string }) {
  const rows = external.module_summary.filter((row) => row.Module === module)
  if (rows.length === 0) {
    return (
      <section className="module-detail-section">
        <div className="module-empty">
          <p>Este módulo no formó parte del conjunto prioritario preespecificado (M5/M10/M2) para validación externa estricta.</p>
          <Link className="inline-link" to="/results">Ver comparación global →</Link>
        </div>
      </section>
    )
  }
  return (
    <section className="module-detail-section">
      <div className="module-section-heading">
        <div>
          <p className="eyebrow">Skin-only externa</p>
          <h2>Cobertura y concordancia</h2>
        </div>
        <Link className="inline-link" to="/validation">Abrir validación externa →</Link>
      </div>
      <div className="external-module-grid">
        {rows.map((row) => (
          <article key={`${row.Dataset}-${row.Condition}`}>
            <span>{row.Dataset} · {row.Condition}</span>
            <strong>{row.Complete_data_genes}/{row.Module_genes}</strong>
            <p>genes con datos completos</p>
            <small>{row.Direction_matched_stable_genes} concordantes entre los estables evaluables</small>
          </article>
        ))}
      </div>
    </section>
  )
}
