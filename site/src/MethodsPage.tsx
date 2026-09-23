import { Link } from 'react-router-dom'
import { PageIntro } from './pages'

export function MethodsPage() {
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="METODOLOGÍA"
        title="Diseño y Métodos"
        description="Detalle del procesamiento de datos, parámetros de CEMiTool, estadística y validación."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <section className="boundary-card" id="design">
          <p className="eyebrow">A. Diseño del Estudio</p>
          <h2>Selección de 54 muestras (GSE98923)</h2>
          <p>
            El análisis se centró en muestras de baya completa, comparando dos cultivares (Cabernet Sauvignon vs. Pinot noir)
            a lo largo de tres etapas de desarrollo (FruitSet, Veraison, Harvest) durante tres años consecutivos (2012, 2013, 2014).
            Se utilizaron 3 réplicas biológicas por combinación, logrando un diseño factorial simétrico y completamente balanceado.
          </p>
          <div className="coverage-warning" style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px' }}>
            <strong>Invariante Científico:</strong> El tejido secuenciado es pericarpio completo (con semillas removidas post-veraison), no piel aislada. El fenotipo de grosor de piel no está medido directamente en este dataset.
          </div>
        </section>

        <section className="boundary-card" id="preprocessing">
          <p className="eyebrow">B. Preprocesamiento Base</p>
          <h2>Transformación y filtrado</h2>
          <p>
            Se partió de la matriz RPKM del GSE98923. La transformación de base aplicada fue <code>log2(RPKM + 1)</code>.
          </p>
          <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
            <li><code>filter = TRUE</code> con <code>filter_pval = 0.1</code></li>
            <li><code>apply_vst = FALSE</code> (se operó directamente sobre valores transformados)</li>
          </ul>
        </section>

        <section className="boundary-card" id="network">
          <p className="eyebrow">C. Inferencia de Redes de Coexpresión</p>
          <h2>CEMiTool y selección del umbral Soft-Threshold (Beta)</h2>
          <p>
            Se evaluó la estructura de red (Scale-Free Topology vs. Mean Connectivity). Para este estudio, 
            <strong>beta = 10</strong> se estableció como la red principal (R² = 0.706) para garantizar un decaimiento 
            apropiado en la topología libre de escala, obteniendo 10 módulos biológicos (M1-M10).
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Se corrió una red de sensibilidad a <strong>beta = 7</strong> (R² = 0.549) que arrojó 8 módulos, demostrando alta 
            conservación gen-a-gen (Jaccard) con los módulos principales, lo que valida la robustez arquitectural.
          </p>
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginTop: '1rem', fontSize: '0.9rem', fontFamily: 'monospace' }}>
            cor_method = "pearson"<br/>
            network_type = "unsigned"<br/>
            tom_type = "signed"<br/>
            merge_similar = TRUE
          </div>
        </section>

        <section className="boundary-card" id="statistics">
          <p className="eyebrow">D. Modelado Factorial</p>
          <h2>Interacción Cultivar × Etapa</h2>
          <p>
            El análisis estadístico no reconstruye la red. Para cada módulo (M1-M10 de beta 10) se calcula un 
            eigengene (PC1) por muestra. Sobre ese eigengene se ajustó el siguiente modelo factorial:
          </p>
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', margin: '1rem 0', fontFamily: 'monospace' }}>
            Eigengene ~ Cultivar * Stage + Year
          </div>
          <p>
            Los p-valores para la interacción fueron corregidos utilizando Benjamini-Hochberg (FDR).
            A posteriori, se evaluó la robustez interanual agregando la interacción con <code>Year</code>.
          </p>
        </section>

        <section className="boundary-card" id="validation">
          <p className="eyebrow">E. Validación Externa (Piel Aislada)</p>
          <h2>Comprobación de direccionalidad en transcriptomas independientes</h2>
          <p>
            Para mitigar la limitación del tejido mixto (pericarpio), los hubs de los módulos priorizados (M5, M10, M2)
            fueron cruzados con datasets independientes de piel aislada (GSE72421 y PRJNA260535).
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            La validación se considera exitosa si el signo del contraste Cabernet - Pinot observado en el 
            dataset externo coincide con el promedio de Harvest 2012-2014 del estudio principal. Esto confirma la 
            persistencia de las señales transcriptómicas observadas, aunque <strong>no demuestra causalidad fisiológica</strong>.
          </p>
        </section>

        <section className="boundary-card" id="annotation">
          <p className="eyebrow">F. Reprocesamiento y Anotaciones</p>
          <h2>Anotación V3 vs V5</h2>
          <p>
            El estudio original utiliza coordenadas del genoma V3 y descriptores funcionales V3_MapMan. Durante 
            el enriquecimiento y anotación, algunos genes críticos (ej. Chalcone Synthase vs Stilbene Synthase) mostraron 
            conflictos de clasificación en V5. La plataforma no resuelve estos conflictos en favor de una versión, 
            sino que los expone transparentemente (ej. red M5).
          </p>
        </section>
      </div>

      <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
        <Link to="/reproducibility" className="button button--primary">Explorar Provenance Reproducible →</Link>
      </div>
    </div>
  )
}
