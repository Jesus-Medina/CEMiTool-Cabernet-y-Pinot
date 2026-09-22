import cytoscape, { type Core, type ElementDefinition } from 'cytoscape'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  loadM5Network,
  type HubRow,
  type M5NetworkEdge,
  type ProvenancePayload,
} from '../data/siteData'
import { formatDecimal } from '../utils/format'
import './m5-network.css'

const NAC_GENE = 'VIT_12s0028g00860'
const CUAO_GENE = 'VIT_05s0020g03280'
const TOP_OPTIONS = [15, 25, 40, 60, 108] as const

function nodeCategory(row: HubRow) {
  if (row.Gene === NAC_GENE) return 'nac'
  if (row.Gene === CUAO_GENE) return 'cuao'
  if (row.V3_V5_STS_CHS_label_conflict) return 'family'
  return 'other'
}

function categoryLabel(row: HubRow) {
  const category = nodeCategory(row)
  if (category === 'nac') return 'NAC'
  if (category === 'cuao') return 'CuAO'
  if (category === 'family') return 'CHS/STS-like'
  return 'Otro M5'
}

function shortLabel(row: HubRow) {
  const category = categoryLabel(row)
  if (row.Rank_kWithin <= 11) return '#' + String(row.Rank_kWithin) + ' ' + category
  return ''
}

function findTopOption(rank: number) {
  return TOP_OPTIONS.find((value) => value >= rank) ?? 108
}

function visibleEdgeCount(edges: M5NetworkEdge[], ids: Set<string>, threshold: number) {
  return edges.filter(
    (edge) =>
      ids.has(edge.Gene1) &&
      ids.has(edge.Gene2) &&
      edge.Beta10_unsigned_adjacency >= threshold,
  ).length
}

function Chr16Locus({ hubs }: { hubs: HubRow[] }) {
  const genes = useMemo(
    () =>
      hubs
        .filter(
          (row) =>
            row.Module === 'M5' &&
            row.V3_V5_STS_CHS_label_conflict === true &&
            row.V5_Chr === 'chr16' &&
            row.V5_GeneStart !== null &&
            row.V5_GeneStart !== undefined &&
            row.V5_GeneEnd !== null &&
            row.V5_GeneEnd !== undefined,
        )
        .sort((a, b) => Number(a.V5_GeneStart) - Number(b.V5_GeneStart)),
    [hubs],
  )

  if (genes.length === 0) {
    return null
  }

  const minStart = Math.min(...genes.map((row) => Number(row.V5_GeneStart)))
  const maxEnd = Math.max(...genes.map((row) => Number(row.V5_GeneEnd)))
  const intervalBp = maxEnd - minStart + 1
  const width = 980
  const height = 250
  const left = 76
  const right = 36
  const baselineY = 145
  const innerWidth = width - left - right
  const x = (position: number) =>
    left + ((position - minStart) / Math.max(maxEnd - minStart, 1)) * innerWidth

  return (
    <section className="network-locus">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PN40024 T2T · chr16</p>
          <h2>Bloque de referencia CHS/STS-like</h2>
        </div>
        <p>
          {genes.length} genes con conflicto v3 stilbenoid / v5.1 CHS y coordenadas v5.1 ocupan
          un intervalo de {intervalBp.toLocaleString('es-CL')} pb. Son coordenadas del genoma de referencia,
          no de Cabernet Sauvignon ni Pinot noir.
        </p>
      </div>

      <div className="locus-svg-wrap">
        <svg
          className="locus-svg"
          viewBox={'0 0 ' + width + ' ' + height}
          role="img"
          aria-labelledby="chr16-title chr16-desc"
        >
          <title id="chr16-title">Intervalo de genes CHS/STS-like de M5 en chr16</title>
          <desc id="chr16-desc">
            Posiciones PN40024 T2T v5.1 de genes M5 con conflicto de anotación CHS/STS.
            La proximidad no demuestra expansión ni pérdida específica de cultivar.
          </desc>
          <line x1={left} x2={width - right} y1={baselineY} y2={baselineY} className="locus-axis" />
          <text x={left} y={baselineY + 34} textAnchor="start" className="locus-coordinate">
            {minStart.toLocaleString('es-CL')}
          </text>
          <text x={width - right} y={baselineY + 34} textAnchor="end" className="locus-coordinate">
            {maxEnd.toLocaleString('es-CL')}
          </text>

          {genes.map((row, index) => {
            const center = (Number(row.V5_GeneStart) + Number(row.V5_GeneEnd)) / 2
            const px = x(center)
            const labelY = index % 2 === 0 ? 54 : 92
            const isTop = row.Rank_kWithin <= 11
            return (
              <g key={row.Gene}>
                <line x1={px} x2={px} y1={labelY + 12} y2={baselineY - 8} className="locus-stem" />
                <rect
                  x={px - (isTop ? 6 : 4)}
                  y={baselineY - (isTop ? 6 : 4)}
                  width={isTop ? 12 : 8}
                  height={isTop ? 12 : 8}
                  transform={'rotate(45 ' + px + ' ' + baselineY + ')'}
                  className={isTop ? 'locus-gene locus-gene--top' : 'locus-gene'}
                >
                  <title>
                    {row.Gene} · rank {row.Rank_kWithin} · {Number(row.V5_GeneStart).toLocaleString('es-CL')}–{Number(row.V5_GeneEnd).toLocaleString('es-CL')}
                  </title>
                </rect>
                {isTop && (
                  <text x={px} y={labelY} textAnchor="middle" className="locus-label">
                    #{row.Rank_kWithin}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="locus-legend">
        <span><i className="locus-key locus-key--top" />Top-11 hub</span>
        <span><i className="locus-key" />Otros genes del bloque anotado</span>
      </div>

      <details className="locus-table-details">
        <summary>Ver genes y coordenadas</summary>
        <div className="scientific-table-wrap">
          <table className="scientific-table scientific-table--compact">
            <thead>
              <tr><th>Rank</th><th>Gen legado</th><th>Gen v5.1</th><th>Inicio</th><th>Fin</th><th>kWithin</th></tr>
            </thead>
            <tbody>
              {genes.map((row) => (
                <tr key={row.Gene}>
                  <td>{row.Rank_kWithin}</td>
                  <td><Link to={'/results/genes/' + row.Gene}><code>{row.Gene}</code></Link></td>
                  <td><code>{row.V5_gene ?? '—'}</code></td>
                  <td>{Number(row.V5_GeneStart).toLocaleString('es-CL')}</td>
                  <td>{Number(row.V5_GeneEnd).toLocaleString('es-CL')}</td>
                  <td>{formatDecimal(row.kWithin, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="network-limit-note">
        La cercanía física en PN40024 T2T es compatible con un bloque de familia y justifica investigar duplicación,
        pero esta vista no demuestra expansión en Pinot noir, pérdida en Cabernet Sauvignon ni identidad enzimática exacta.
      </p>
    </section>
  )
}

export default function M5NetworkExplorer({
  hubs,
  provenance,
}: {
  hubs: HubRow[]
  provenance: ProvenancePayload
}) {
  const [edges, setEdges] = useState<M5NetworkEdge[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [topN, setTopN] = useState<(typeof TOP_OPTIONS)[number]>(15)
  const [threshold, setThreshold] = useState(0.4)
  const [selectedGene, setSelectedGene] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  const m5Hubs = useMemo(
    () =>
      hubs
        .filter((row) => row.Module === 'M5')
        .sort((a, b) => a.Rank_kWithin - b.Rank_kWithin),
    [hubs],
  )

  useEffect(() => {
    let active = true
    loadM5Network()
      .then((payload) => {
        if (!active) return
        setEdges(payload.edges)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Error al cargar la red M5')
      })
    return () => { active = false }
  }, [])

  const visibleNodes = useMemo(
    () => m5Hubs.filter((row) => row.Rank_kWithin <= topN),
    [m5Hubs, topN],
  )
  const visibleIds = useMemo(() => new Set(visibleNodes.map((row) => row.Gene)), [visibleNodes])
  const visibleEdges = useMemo(
    () =>
      (edges ?? []).filter(
        (edge) =>
          visibleIds.has(edge.Gene1) &&
          visibleIds.has(edge.Gene2) &&
          edge.Beta10_unsigned_adjacency >= threshold,
      ),
    [edges, visibleIds, threshold],
  )
  const selected = m5Hubs.find((row) => row.Gene === selectedGene) ?? null

  const elements = useMemo<ElementDefinition[]>(() => {
    const nodes: ElementDefinition[] = visibleNodes.map((row) => ({
      data: {
        id: row.Gene,
        gene: row.Gene,
        rank: row.Rank_kWithin,
        kWithin: row.kWithin,
        category: nodeCategory(row),
        label: shortLabel(row),
      },
    }))
    const edgeElements: ElementDefinition[] = visibleEdges.map((edge, index) => ({
      data: {
        id: edge.Gene1 + '__' + edge.Gene2 + '__' + String(index),
        source: edge.Gene1,
        target: edge.Gene2,
        weight: edge.Beta10_unsigned_adjacency,
        pearson: edge.Pearson_r,
      },
    }))
    return [...nodes, ...edgeElements]
  }, [visibleNodes, visibleEdges])

  useEffect(() => {
    if (!containerRef.current || !edges) return

    const maxK = Math.max(...visibleNodes.map((row) => row.kWithin), 1)
    const minK = Math.min(...visibleNodes.map((row) => row.kWithin), 0)

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      minZoom: 0.2,
      maxZoom: 3.5,
      wheelSensitivity: 0.12,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#8d4662',
            'border-color': '#ffffff',
            'border-width': 2,
            width: 'mapData(kWithin, ' + String(minK) + ', ' + String(maxK) + ', 20, 52)',
            height: 'mapData(kWithin, ' + String(minK) + ', ' + String(maxK) + ', 20, 52)',
            label: 'data(label)',
            color: '#3b2730',
            'font-size': 9,
            'font-weight': 700,
            'text-wrap': 'wrap',
            'text-max-width': '72px',
            'text-valign': 'bottom',
            'text-margin-y': 8,
          },
        },
        {
          selector: 'node[category = "family"]',
          style: { shape: 'diamond', 'background-color': '#6e2d48' },
        },
        {
          selector: 'node[category = "nac"]',
          style: { shape: 'triangle', 'background-color': '#2f6b57' },
        },
        {
          selector: 'node[category = "cuao"]',
          style: { shape: 'round-rectangle', 'background-color': '#8a5c16' },
        },
        {
          selector: 'edge',
          style: {
            width: 'mapData(weight, ' + String(threshold) + ', 1, 0.55, 2.6)',
            'line-color': '#b9aeb3',
            opacity: 0.28,
            'curve-style': 'haystack',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#20171b',
            'border-width': 4,
            label: 'data(gene)',
            'font-size': 11,
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.92,
            'text-background-padding': '4px',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        fit: true,
        padding: 72,
        nodeRepulsion: 18000,
        nodeOverlap: 30,
        idealEdgeLength: 120,
        edgeElasticity: 70,
        nestingFactor: 1.2,
        gravity: 0.35,
        numIter: 1400,
        randomize: true,
      },
    })

    cy.on('tap', 'node', (event) => {
      setSelectedGene(event.target.id())
    })

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => cy.resize())
        : null
    if (containerRef.current) resizeObserver?.observe(containerRef.current)

    requestAnimationFrame(() => {
      cy.resize()
      cy.fit(cy.elements(), 72)
    })

    cyRef.current = cy
    return () => {
      resizeObserver?.disconnect()
      cy.destroy()
      cyRef.current = null
    }
  }, [edges, elements, threshold, visibleNodes])

  useEffect(() => {
    if (!cyRef.current || !selectedGene) return
    const node = cyRef.current.getElementById(selectedGene)
    if (node.nonempty()) {
      cyRef.current.$(':selected').unselect()
      node.select()
      const targetZoom = Math.min(Math.max(cyRef.current.zoom(), 1.15), 1.7)
      cyRef.current.animate({ center: { eles: node }, zoom: targetZoom }, { duration: 250 })
    }
  }, [selectedGene, elements])

  function changeZoom(factor: number) {
    const cy = cyRef.current
    if (!cy) return
    const next = Math.max(cy.minZoom(), Math.min(cy.maxZoom(), cy.zoom() * factor))
    cy.animate({ zoom: next }, { duration: 160 })
  }

  function fitNetwork() {
    const cy = cyRef.current
    if (!cy) return
    cy.resize()
    cy.fit(cy.elements(), 72)
  }

  function relayoutNetwork() {
    const cy = cyRef.current
    if (!cy) return
    cy.layout({
      name: 'cose',
      animate: true,
      animationDuration: 420,
      fit: true,
      padding: 72,
      nodeRepulsion: 18000,
      nodeOverlap: 30,
      idealEdgeLength: 120,
      edgeElasticity: 70,
      nestingFactor: 1.2,
      gravity: 0.35,
      numIter: 1400,
      randomize: true,
    }).run()
  }

  function locateGene() {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return
    const match = m5Hubs.find(
      (row) =>
        row.Gene.toLowerCase() === normalized ||
        row.Gene.toLowerCase().includes(normalized) ||
        categoryLabel(row).toLowerCase() === normalized,
    )
    if (!match) return
    if (match.Rank_kWithin > topN) setTopN(findTopOption(match.Rank_kWithin))
    setSelectedGene(match.Gene)
  }

  const provenanceArtifact = provenance.artifacts.find((row) => row.artifact_id === 'm5_network')
  const commit = provenance.repository_commit ?? 'main'

  return (
    <>
      <section className="m5-section network-section" id="network">
        <div className="section-heading section-heading--controls">
          <div>
            <p className="eyebrow">Red de coexpresión</p>
            <h2>M5 · estructura de la red beta10</h2>
          </div>
          <p>
            Cada arista usa la adyacencia unsigned congelada de beta10. El tamaño del nodo representa kWithin.
            La forma distingue categorías funcionales; ninguna arista implica dirección reguladora.
          </p>
        </div>

        {error && <div className="data-state data-state--error"><strong>No se pudo cargar la red.</strong><span>{error}</span></div>}
        {!edges && !error && <div className="data-state"><span className="data-state-dot" />Cargando 5.778 aristas canónicas…</div>}

        {edges && (
          <>
            <div className="network-controls">
              <label>
                <span>Top N por kWithin</span>
                <select value={topN} onChange={(event) => setTopN(Number(event.target.value) as (typeof TOP_OPTIONS)[number])}>
                  {TOP_OPTIONS.map((value) => <option key={value} value={value}>Top {value}</option>)}
                </select>
              </label>
              <label className="edge-threshold-control">
                <span>Adjacency mínima: <strong>{formatDecimal(threshold, 2)}</strong></span>
                <input type="range" min="0.05" max="0.8" step="0.05" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
              </label>
              <label className="network-search">
                <span>Buscar gen</span>
                <div>
                  <input
                    list="m5-network-genes"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') locateGene() }}
                    placeholder="VIT_… / NAC / CuAO"
                  />
                  <button type="button" className="button button--secondary" onClick={locateGene}>Ir</button>
                </div>
                <datalist id="m5-network-genes">
                  {m5Hubs.map((row) => <option key={row.Gene} value={row.Gene}>{categoryLabel(row)}</option>)}
                </datalist>
              </label>
            </div>

            <div className="network-summary-strip">
              <span><strong>{visibleNodes.length}</strong> nodos visibles</span>
              <span><strong>{visibleEdgeCount(edges, visibleIds, threshold)}</strong> aristas visibles</span>
              <span><strong>{edges.length.toLocaleString('es-CL')}</strong> aristas canónicas totales</span>
            </div>
            <p className="network-view-note">
              La vista inicial prioriza legibilidad con Top 15 y adjacency ≥ 0,40. Puedes ampliar la red con los filtros sin recalcular los datos.
            </p>

            <div className="network-layout">
              <div>
                <div className="network-canvas-shell">
                  <div className="network-view-toolbar" aria-label="Controles de vista de la red">
                    <button type="button" onClick={() => changeZoom(0.82)} aria-label="Alejar red" title="Alejar">−</button>
                    <button type="button" onClick={() => changeZoom(1.22)} aria-label="Acercar red" title="Acercar">+</button>
                    <button type="button" onClick={fitNetwork}>Ajustar</button>
                    <button type="button" onClick={relayoutNetwork}>Reordenar</button>
                  </div>
                  <div ref={containerRef} className="cy-network" aria-label="Red interactiva M5 renderizada con Cytoscape.js" />
                </div>
                <div className="network-interaction-hint">
                  Rueda para zoom · arrastra el fondo para mover la vista · toca un nodo para inspeccionarlo.
                </div>
                <div className="network-legend">
                  <span><i className="network-shape network-shape--family" />CHS/STS-like</span>
                  <span><i className="network-shape network-shape--nac" />NAC</span>
                  <span><i className="network-shape network-shape--cuao" />CuAO</span>
                  <span><i className="network-shape" />Otros M5</span>
                </div>
              </div>

              <aside className="network-inspector">
                <p className="eyebrow">Inspector del nodo</p>
                {selected ? (
                  <>
                    <h3>{categoryLabel(selected)}</h3>
                    <code>{selected.Gene}</code>
                    <dl>
                      <div><dt>Rank kWithin</dt><dd>#{selected.Rank_kWithin}</dd></div>
                      <div><dt>kWithin</dt><dd>{formatDecimal(selected.kWithin, 3)}</dd></div>
                      <div><dt>kME</dt><dd>{formatDecimal(selected.kME_signed, 3)}</dd></div>
                      <div><dt>v5.1 locus</dt><dd>{selected.V5_Chr ?? '—'} {selected.V5_GeneStart ? Number(selected.V5_GeneStart).toLocaleString('es-CL') : ''}</dd></div>
                    </dl>
                    <Link className="inline-link" to={'/results/genes/' + selected.Gene}>Abrir ficha del gen →</Link>
                  </>
                ) : (
                  <p>Selecciona un nodo para ver su evidencia. También puedes buscar un gen por ID.</p>
                )}
              </aside>
            </div>

            <details className="network-data-details">
              <summary>Ver aristas mostradas</summary>
              <div className="scientific-table-wrap">
                <table className="scientific-table">
                  <thead><tr><th>Gen 1</th><th>Gen 2</th><th>Pearson r</th><th>Adjacency beta10</th><th>Grupo</th></tr></thead>
                  <tbody>
                    {visibleEdges.slice(0, 250).map((edge) => (
                      <tr key={edge.Gene1 + '-' + edge.Gene2}>
                        <td><code>{edge.Gene1}</code></td>
                        <td><code>{edge.Gene2}</code></td>
                        <td>{formatDecimal(edge.Pearson_r, 3)}</td>
                        <td>{formatDecimal(edge.Beta10_unsigned_adjacency, 3)}</td>
                        <td>{edge.Pair_group}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visibleEdges.length > 250 && <p className="table-note">La tabla muestra las primeras 250 aristas visibles; el canvas contiene {visibleEdges.length.toLocaleString('es-CL')}.</p>}
            </details>

            {provenanceArtifact && (
              <details className="network-provenance">
                <summary>ⓘ Provenance de la red</summary>
                <p>
                  <a
                    href={'https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot/blob/' + commit + '/' + provenanceArtifact.sources[0]?.path}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {provenanceArtifact.sources[0]?.path}
                  </a>
                </p>
                <p>Commit exportado: <code>{commit.slice(0, 12)}</code></p>
              </details>
            )}

            <p className="network-limit-note">
              La red es unsigned: un peso alto resume fuerza de coexpresión transformada, no activación/inhibición ni dirección causal.
              Los filtros cambian solamente qué nodos/aristas se dibujan; no recalculan la red ni kWithin.
            </p>
          </>
        )}
      </section>

      <Chr16Locus hubs={m5Hubs} />
    </>
  )
}
