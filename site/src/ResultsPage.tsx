import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useModuleExplorerData } from './hooks/useModuleExplorerData'
import { formatScientific } from './utils/format'
import type { FunctionalEnrichmentPayload } from './data/enrichmentData'
import type { ExternalValidationPayload } from './data/siteData'

function significantV3Count(data: FunctionalEnrichmentPayload, module: string) {
  return data.terms.filter(
    (row) =>
      row.Source === 'v3_mapman' &&
      row.Module === module &&
      row.FDR_global_module_terms !== null &&
      row.FDR_global_module_terms < 0.05,
  ).length
}

function externalEvaluableCount(data: ExternalValidationPayload, module: string) {
  return data.module_summary
    .filter((row) => row.Module === module)
    .reduce((sum, row) => sum + row.Complete_data_genes, 0)
}

type YearFilter = 'all' | 'reproducible' | 'year-dependent'

export default function ResultsPage() {
  const { data, error } = useModuleExplorerData()
  const [filter, setFilter] = useState<YearFilter>('all')

  const orderedModules = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10']

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">RESULTADOS</p>
          <h1>Perfiles M1–M10</h1>
          <p className="lede">
            Composición de las salidas originales CEMiTool beta10 que identifican los programas transcripcionales.
          </p>
        </div>
      </section>

      {/* 2. Composición visual de perfiles M1–M10 */}
      <section className="m1-m10-composition">
        <div className="composition-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <h3>Perfiles M1–M10 — composición de las salidas originales CEMiTool beta10</h3>
          <a href="https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot/blob/main/results/beta10/figures/profile.pdf" target="_blank" rel="noopener noreferrer" className="inline-link">
            Ver PDF canónico de CEMiTool →
          </a>
        </div>
        <div className="composition-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '1rem',
          background: 'var(--surface-sunken)',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          {orderedModules.map(m => (
            <Link to={`/results/modules/${m}`} key={m} className="composition-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img 
                src={`/figures/profile_${m}.png`} 
                alt={`Perfil CEMiTool original para ${m}`} 
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
              />
              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontWeight: '500' }}>{m}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Resumen global */}
      <section className="global-summary" style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
        <article className="metric-card">
          <p>Total Módulos</p>
          <strong>10</strong>
          <span>Red beta=10</span>
        </article>
        <article className="metric-card">
          <p>Módulos Reproducibles</p>
          <strong>{data?.modules.modules.filter(m => m.robustness_classification === 'reproducible').length || 0}</strong>
          <span>Según regla preespecificada</span>
        </article>
      </section>

      {/* 5. Explicación "cómo leer" */}
      <section className="how-to-read" style={{ marginTop: '3rem', padding: '1.5rem', borderLeft: '4px solid var(--brand-primary)', background: 'var(--surface-sunken)' }}>
        <h3>Cómo interpretar la tabla comparativa</h3>
        <p>
          La tabla resume los atributos principales de cada módulo biológico. <strong>Robustez anual</strong> documenta 
          si el patrón se repite bajo criterios preespecificados (ej. M10 es reproducible, M5 es dependiente del año globalmente).
          <strong>Señal por etapa</strong> indica las diferencias principales, y la validación externa 
          se evalúa por separado usando GSE72421 / PRJNA260535 (piel aislada).
        </p>
      </section>

      {/* 6. Filtros secundarios */}
      <section className="module-filter-panel" style={{ marginTop: '2rem' }}>
        <div className="module-filter-buttons" aria-label="Filtros de robustez">
          <button className={filter === 'all' ? 'module-filter module-filter--active' : 'module-filter'} onClick={() => setFilter('all')}>Todos</button>
          <button className={filter === 'reproducible' ? 'module-filter module-filter--active' : 'module-filter'} onClick={() => setFilter('reproducible')}>Reproducibles</button>
          <button className={filter === 'year-dependent' ? 'module-filter module-filter--active' : 'module-filter'} onClick={() => setFilter('year-dependent')}>Dependientes del año</button>
        </div>
      </section>

      {/* 4. Tabla comparativa M1–M10 */}
      <section className="comparative-table-section" style={{ marginTop: '2rem' }}>
        {!data && !error && <div className="data-state"><span className="data-state-dot" />Cargando datos...</div>}
        {error && <div className="data-state data-state--error">{error}</div>}
        {data && (
          <div className="scientific-table-wrap">
            <table className="scientific-table">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Genes</th>
                  <th>Cultivar×Stage FDR</th>
                  <th>Robustez anual</th>
                  <th>ORA v3 hits</th>
                  <th>Piel externa</th>
                </tr>
              </thead>
              <tbody>
                {orderedModules.map(m => {
                  const row = data.modules.modules.find(mod => mod.module === m);
                  if (!row) return null;
                  
                  if (filter !== 'all' && row.robustness_classification !== filter) return null;

                  const v3Hits = significantV3Count(data.enrichment, m);
                  const extEval = externalEvaluableCount(data.external, m);
                  const isEvaluated = ['M5', 'M10', 'M2'].includes(m);

                  return (
                    <tr key={m}>
                      <td>
                        <Link to={`/results/modules/${m}`}><strong>{m}</strong></Link>
                      </td>
                      <td>{row.gene_count}</td>
                      <td>{formatScientific(row.cultivar_stage_fdr)}</td>
                      <td>{row.robustness_classification === 'reproducible' ? 'Reproducible' : 'Dependiente del año'}</td>
                      <td>{v3Hits > 0 ? `${v3Hits} términos` : '—'}</td>
                      <td>{isEvaluated ? `${extEval} evaluables` : 'No priorizado'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 7. Exploración transversal */}
      <section className="cross-module-exploration" style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
        <h3>Exploración Transversal</h3>
        <p>
          Además de revisar cada módulo en detalle, puedes consultar la evidencia de forma global:
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/validation" className="button button--secondary">Ver Validación Externa Global</Link>
          <Link to="/enrichment" className="button button--secondary">Ver Enriquecimiento Global (ORA)</Link>
          <Link to="/genes" className="button button--secondary">Buscador de Genes</Link>
        </div>
      </section>

    </div>
  )
}
