import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const primaryNavigation = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/results', label: 'Resultados' },
  { to: '/methods', label: 'Métodos' },
  { to: '/reproducibility', label: 'Reproducibilidad' },
]

const utilityNavigation = [
  { to: '/search', label: 'Buscar' },
  { to: '/ask', label: 'Preguntar' },
]

export default function SiteShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  function primaryActive(to: string) {
    if (to === '/') return pathname === '/' || pathname.startsWith('/story')
    if (to === '/results') {
      return ['/results', '/modules', '/enrichment', '/validation', '/genes'].some((prefix) =>
        pathname.startsWith(prefix),
      )
    }
    if (to === '/reproducibility') {
      return pathname.startsWith('/reproducibility') || pathname.startsWith('/evidence')
    }
    return pathname.startsWith(to)
  }

  const inResults = ['/results', '/modules', '/enrichment', '/validation', '/genes'].some((prefix) =>
    pathname.startsWith(prefix),
  )
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbItems: Array<{ label: string; to?: string }> = []

  const moduleId =
    pathname.startsWith('/results/modules/') ? segments[2] :
    pathname.startsWith('/modules/') ? segments[1] :
    null
  const geneId =
    pathname.startsWith('/results/genes/') ? segments[2] :
    pathname.startsWith('/genes/') ? segments[1] :
    null

  const showResultsContext =
    inResults &&
    pathname !== '/results' &&
    !moduleId &&
    !geneId

  if (moduleId) {
    breadcrumbItems.push({ label: 'Módulos', to: '/results/modules' })
    breadcrumbItems.push({ label: moduleId.toUpperCase() })
  } else if (geneId) {
    breadcrumbItems.push({ label: 'Genes', to: '/results/genes' })
    breadcrumbItems.push({ label: geneId })
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    setMenuOpen(false)
  }, [pathname])

  function skipToContent(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const main = document.getElementById('main-content')
    main?.focus({ preventScroll: true })
    main?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Saltar al contenido
      </a>

      <header className="site-header">
        <div className="header-inner">
          <NavLink
            className="brand"
            to="/"
            aria-label="Ir al inicio"
            onClick={() => setMenuOpen(false)}
          >
            <span className="brand-mark" aria-hidden="true">CP</span>
            <span className="brand-copy">
              <strong>CEMiTool Explorer</strong>
              <small>Cabernet Sauvignon × Pinot noir</small>
            </span>
          </NavLink>

          <button
            className="mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
            <span>Menú</span>
          </button>

          <div
            className={menuOpen ? 'header-navigation header-navigation--open' : 'header-navigation'}
            id="site-navigation"
          >
            <nav className="primary-nav" aria-label="Navegación principal">
              {primaryNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={primaryActive(item.to) ? 'nav-link nav-link--active' : 'nav-link'}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <nav className="utility-nav" aria-label="Utilidades">
              {utilityNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    item.to === '/ask'
                      ? (isActive ? 'utility-link utility-link--ask utility-link--active' : 'utility-link utility-link--ask')
                      : (isActive ? 'utility-link utility-link--active' : 'utility-link')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <a
                className="utility-link utility-link--external"
                href="https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="site-main" id="main-content" tabIndex={-1}>
        {breadcrumbItems.length > 0 && (
          <nav className="breadcrumb-bar" aria-label="Ruta actual">
            <Link to="/">Resumen</Link>
            {breadcrumbItems.map((item, index) => (
              <span className="breadcrumb-item" key={item.label + String(index)}>
                <span aria-hidden="true">/</span>
                {item.to && index < breadcrumbItems.length - 1 ? (
                  <Link to={item.to}>{item.label}</Link>
                ) : (
                  <strong>{item.label}</strong>
                )}
              </span>
            ))}
          </nav>
        )}

        {showResultsContext && (
          <div className="result-context-bar">
            <nav aria-label="Navegación de resultados">
              <NavLink
                to="/results/modules"
                className={pathname.startsWith('/results/modules') || pathname.startsWith('/modules') ? 'result-context-link result-context-link--active' : 'result-context-link'}
              >
                Módulos
              </NavLink>
              <NavLink
                to="/results/function"
                className={pathname.startsWith('/results/function') || pathname.startsWith('/enrichment') ? 'result-context-link result-context-link--active' : 'result-context-link'}
              >
                Función
              </NavLink>
              <NavLink
                to="/results/validation"
                className={pathname.startsWith('/results/validation') || pathname.startsWith('/validation') ? 'result-context-link result-context-link--active' : 'result-context-link'}
              >
                Validación
              </NavLink>
              <NavLink
                to="/results/genes"
                className={pathname.startsWith('/results/genes') || pathname.startsWith('/genes') ? 'result-context-link result-context-link--active' : 'result-context-link'}
              >
                Genes
              </NavLink>
            </nav>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <strong>CEMiTool Cabernet–Pinot Explorer</strong>
            <span>Visualización científica con datos canónicos y trazabilidad reproducible.</span>
          </div>
          <nav className="footer-links" aria-label="Enlaces del proyecto">
            <Link to="/status/t008">Estado T-008</Link>
            <Link to="/search">Buscar</Link>
            <a href="https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot" target="_blank" rel="noreferrer">GitHub ↗</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
