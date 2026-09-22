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
  { to: '/status/t008', label: 'T-008' },
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
  const showResultsContext = inResults && pathname !== '/results'

  const segments = pathname.split('/').filter(Boolean)
  const canonicalResultsPath =
    pathname.startsWith('/modules') ||
    pathname.startsWith('/enrichment') ||
    pathname.startsWith('/validation') ||
    pathname.startsWith('/genes')
      ? true
      : pathname.startsWith('/results')

  const breadcrumbItems: Array<{ label: string; to?: string }> = []

  if (canonicalResultsPath) {
    breadcrumbItems.push({ label: 'Resultados', to: '/results/modules' })

    if (
      pathname.startsWith('/results/modules') ||
      pathname.startsWith('/modules')
    ) {
      breadcrumbItems.push({ label: 'Módulos', to: '/results/modules' })
      const moduleId =
        pathname.startsWith('/results/modules/')
          ? segments[2]
          : pathname.startsWith('/modules/')
            ? segments[1]
            : null
      if (moduleId) breadcrumbItems.push({ label: moduleId.toUpperCase() })
    } else if (
      pathname.startsWith('/results/function') ||
      pathname.startsWith('/enrichment')
    ) {
      breadcrumbItems.push({ label: 'Función' })
    } else if (
      pathname.startsWith('/results/validation') ||
      pathname.startsWith('/validation')
    ) {
      breadcrumbItems.push({ label: 'Validación' })
    } else if (
      pathname.startsWith('/results/genes') ||
      pathname.startsWith('/genes')
    ) {
      breadcrumbItems.push({ label: 'Genes', to: '/results/genes' })
      const geneId =
        pathname.startsWith('/results/genes/')
          ? segments[2]
          : pathname.startsWith('/genes/')
            ? segments[1]
            : null
      if (geneId) breadcrumbItems.push({ label: geneId })
    }
  } else if (pathname.startsWith('/methods')) {
    breadcrumbItems.push({ label: 'Métodos' })
  } else if (
    pathname.startsWith('/reproducibility') ||
    pathname.startsWith('/evidence')
  ) {
    breadcrumbItems.push({ label: 'Reproducibilidad' })
  } else if (
    pathname.startsWith('/status/t008') ||
    pathname.startsWith('/t008')
  ) {
    breadcrumbItems.push({ label: 'Status' })
    breadcrumbItems.push({ label: 'T-008' })
  } else if (pathname.startsWith('/search')) {
    breadcrumbItems.push({ label: 'Buscar' })
  } else if (pathname.startsWith('/ask') || pathname.startsWith('/chat')) {
    breadcrumbItems.push({ label: 'Preguntar' })
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
                    isActive ? 'utility-link utility-link--active' : 'utility-link'
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
            <div>
              <strong>Explorar resultados</strong>
              <span>Cambia de vista sin perder el contexto científico.</span>
            </div>
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
          <span className="footer-meta">Cabernet Sauvignon × Pinot noir</span>
        </div>
      </footer>
    </div>
  )
}
