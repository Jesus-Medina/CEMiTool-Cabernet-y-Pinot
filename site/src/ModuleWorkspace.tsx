import { useState, Suspense, lazy } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useModuleExplorerData } from './hooks/useModuleExplorerData'
import { useM5ExplorerData } from './hooks/useM5ExplorerData'
import { formatScientific } from './utils/format'
import {
  ContrastMatrix,
  ModuleExternalSummary,
  ModuleFunctionalSummary,
  ModuleHubs,
  statusLabel
} from './components/ModuleComponents'
import {
  TrajectorySvg,
  HarvestContrasts,
  CandidateCard,
  AnnotationConflictPanel,
  ProvenancePanel,
  downloadProfiles
} from './components/M5Components'

import type { M5Profile, HubRow } from './data/siteData'

const M5NetworkExplorer = lazy(() => import('./components/M5NetworkExplorer'))

type Tab = 'summary' | 'trajectory' | 'biology' | 'validation'

export default function ModuleWorkspace() {
  const { moduleId } = useParams()
  const module = moduleId?.toUpperCase() ?? ''
  const { data, error } = useModuleExplorerData()
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  if (!module.match(/^M(?:10|[1-9])$/)) {
    return (
      <div className="page-stack">
        <section className="page-intro">
          <div><p className="eyebrow">MODULE</p><h1>Módulo no reconocido</h1></div>
        </section>
        <Link className="button button--primary button--fit" to="/results">Volver a Resultados</Link>
      </div>
    )
  }

  const summary = data?.modules.modules.find((row) => row.module === module)

  const modNum = parseInt(module.replace('M', ''), 10)
  const prevMod = modNum > 1 ? `M${modNum - 1}` : null
  const nextMod = modNum < 10 ? `M${modNum + 1}` : null

  return (
    <div className="module-workspace page-stack">
      <nav className="module-sibling-nav" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
        {prevMod ? <Link to={`/modules/${prevMod}`}>← {prevMod}</Link> : <span style={{color: 'transparent'}}>← Prev</span>}
        <Link to="/results">Todos los módulos</Link>
        {nextMod ? <Link to={`/modules/${nextMod}`}>{nextMod} →</Link> : <span style={{color: 'transparent'}}>Next →</span>}
      </nav>

      <header className="module-header" style={{ marginTop: '2rem' }}>
        <p className="eyebrow">MODULE WORKSPACE</p>
        <h1 style={{ fontSize: '3rem', margin: '0' }}>{module}</h1>
        {summary && (
          <p className="lede">
            {summary.gene_count} genes · {statusLabel(summary)} · FDR {formatScientific(summary.cultivar_stage_fdr)}
          </p>
        )}
      </header>

      <div className="module-tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <button className={activeTab === 'summary' ? 'tab-active' : ''} onClick={() => setActiveTab('summary')} style={{ padding: '0.5rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'summary' ? '2px solid var(--brand-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'summary' ? '600' : '400' }}>Resumen</button>
        <button className={activeTab === 'trajectory' ? 'tab-active' : ''} onClick={() => setActiveTab('trajectory')} style={{ padding: '0.5rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'trajectory' ? '2px solid var(--brand-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'trajectory' ? '600' : '400' }}>Trayectoria</button>
        <button className={activeTab === 'biology' ? 'tab-active' : ''} onClick={() => setActiveTab('biology')} style={{ padding: '0.5rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'biology' ? '2px solid var(--brand-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'biology' ? '600' : '400' }}>Biología y red</button>
        <button className={activeTab === 'validation' ? 'tab-active' : ''} onClick={() => setActiveTab('validation')} style={{ padding: '0.5rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'validation' ? '2px solid var(--brand-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'validation' ? '600' : '400' }}>Validación</button>
      </div>

      {!data && !error && <div className="data-state"><span className="data-state-dot" />Cargando datos del módulo...</div>}
      {error && <div className="data-state data-state--error">{error}</div>}

      {data && summary && (
        <div className="module-content">
          {activeTab === 'summary' && (
            <div className="module-summary-view" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <section className="summary-left">
                <div style={{ marginBottom: '2rem' }}>
                  <img src={`${import.meta.env.BASE_URL}figures/profile_${module}.png`} alt={`Profile de ${module}`} style={{ width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid var(--border-subtle)' }} />
                </div>
                <ContrastMatrix rows={data.contrasts} module={module} />
              </section>
              <section className="summary-right">
                <ModuleFunctionalSummary enrichment={data.enrichment} module={module} />
                <ModuleHubs data={data.hubs} module={module} />
                <ModuleExternalSummary external={data.external} module={module} />
              </section>
            </div>
          )}
          {activeTab === 'trajectory' && (
            <section className="module-trajectory-view">
              {module === 'M5' ? (
                 <M5TrajectoryView />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                 <div style={{ maxWidth: '720px' }}>
                   <p className="eyebrow">Profile originario</p>
                   <h2>Comportamiento promedio</h2>
                   <img src={`${import.meta.env.BASE_URL}figures/profile_${module}.png`} alt={`Profile de ${module}`} style={{ width: '100%', display: 'block', borderRadius: '4px', border: '1px solid var(--border-subtle)', margin: '1rem 0' }} />
                 </div>
                 <ContrastMatrix rows={data.contrasts} module={module} />
                </div>
              )}
            </section>
          )}
          {activeTab === 'biology' && (
            <section className="module-biology-view">
              <ModuleFunctionalSummary enrichment={data.enrichment} module={module} />
              <ModuleHubs data={data.hubs} module={module} />
              {module === 'M5' && <M5BiologyView />}
            </section>
          )}
          {activeTab === 'validation' && (
            <section className="module-validation-view">
              <ModuleExternalSummary external={data.external} module={module} />
              <p style={{ marginTop: '2rem', padding: '1rem', background: 'var(--surface-sunken)', borderLeft: '4px solid var(--border-subtle)' }}>
                <strong>Límite interpretativo:</strong> La evidencia externa documenta si el programa transcripcional se replica en tejido aislado, pero no es una prueba mecanicista de que el módulo "cause" las diferencias fenotípicas de grosor.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function M5TrajectoryView() {
  const { trajectory, loading, error } = useM5ExplorerData()
  const [yearFilter, setYearFilter] = useState<'all' | 2012 | 2013 | 2014>('all')
  const [showReplicates, setShowReplicates] = useState(false)

  if (loading) return <div>Cargando trayectoria interactiva M5...</div>
  if (error || !trajectory) return <div>Error cargando trayectoria M5.</div>

  const filteredProfiles = trajectory.profiles.filter((row: M5Profile) => yearFilter === 'all' || row.Year === yearFilter)
  const yearsToRender = yearFilter === 'all' ? [2012, 2013, 2014] : [yearFilter]

  return (
    <>
      <div className="section-heading section-heading--controls">
        <div>
          <p className="eyebrow">Interactive Trajectory</p>
          <h2>Eigengene M5 por etapa y año</h2>
        </div>
        <div className="chart-controls">
          <fieldset>
            <legend>Año</legend>
            <div className="segmented-control">
              {(['all', 2012, 2013, 2014] as const).map((year) => (
                <button
                  type="button"
                  key={year}
                  className={yearFilter === year ? 'segment segment--active' : 'segment'}
                  onClick={() => setYearFilter(year)}
                  aria-pressed={yearFilter === year}
                >
                  {year === 'all' ? 'Todos' : year}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="check-control">
            <input type="checkbox" checked={showReplicates} onChange={(event) => setShowReplicates(event.target.checked)} />
            <span>Mostrar réplicas</span>
          </label>
        </div>
      </div>

      <div className={yearsToRender.length > 1 ? 'trajectory-grid trajectory-grid--multi' : 'trajectory-grid'}>
        {yearsToRender.map((year) => (
          <TrajectorySvg key={year} year={year} profiles={trajectory.profiles} samples={trajectory.samples} showReplicates={showReplicates} />
        ))}
      </div>

      <div className="chart-data-actions" style={{ marginTop: '1rem', marginBottom: '3rem' }}>
        <button type="button" className="button button--secondary" onClick={() => downloadProfiles(filteredProfiles, yearFilter)}>Descargar datos mostrados</button>
      </div>

      <HarvestContrasts contrasts={trajectory.contrasts} />
    </>
  )
}

function M5BiologyView() {
  const { hubs, external, provenance, loading } = useM5ExplorerData()
  
  if (loading) return null
  if (!hubs || !external || !provenance) return null

  const m5Hubs = hubs.rows.filter((row: HubRow) => row.Module === 'M5')
  const nacHub = m5Hubs.find((row: HubRow) => row.Gene === 'VIT_12s0028g00860')
  const cuaoHub = m5Hubs.find((row: HubRow) => row.Gene === 'VIT_05s0020g03280')

  return (
    <>
      <section className="m5-section" style={{ marginTop: '3rem' }}>
        <div className="section-heading">
          <div><p className="eyebrow">Candidate hubs</p><h2>Dos candidatos destacados fuera del bloque ambiguo</h2></div>
        </div>
        <div className="candidate-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <CandidateCard title="NAC" gene="VIT_12s0028g00860" hub={nacHub} externalRows={external.rows} />
          <CandidateCard title="CuAO" gene="VIT_05s0020g03280" hub={cuaoHub} externalRows={external.rows} />
        </div>
      </section>

      <div style={{ marginTop: '3rem' }}><AnnotationConflictPanel hubs={hubs.rows} /></div>
      
      <div style={{ marginTop: '3rem' }}>
        <Suspense fallback={<div>Cargando red...</div>}>
          <M5NetworkExplorer hubs={hubs.rows} provenance={provenance} />
        </Suspense>
      </div>
      
      <div style={{ marginTop: '3rem' }}><ProvenancePanel provenance={provenance} /></div>
    </>
  )
}
