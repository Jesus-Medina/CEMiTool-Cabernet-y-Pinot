import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const primaryNavigation = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/results', label: 'Resultados' },
  { to: '/methods', label: 'Métodos' },
  { to: '/reproducibility', label: 'Reproducibilidad' },
]

const utilityNavigation = [
  { to: '/search', label: 'Buscar', icon: '⌕' },
  { to: '/ask', label: 'Preguntar', icon: '✦' },
]

export default function SiteShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navigationRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  function primaryActive(to: string) {
    if (to === '/') return pathname === '/'
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
  const isExternalValidation = pathname.startsWith('/results/validation') || pathname.startsWith('/validation')
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
    breadcrumbItems.push({ label: 'Resultados', to: '/results/modules' })
    breadcrumbItems.push({ label: 'Módulos', to: '/results/modules' })
    breadcrumbItems.push({ label: moduleId.toUpperCase() })
  } else if (geneId) {
    breadcrumbItems.push({ label: 'Resultados', to: '/results/modules' })
    breadcrumbItems.push({ label: 'Genes', to: '/results/genes' })
    breadcrumbItems.push({ label: geneId })
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    function closeAndRestoreFocus() {
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAndRestoreFocus()
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (!navigationRef.current?.contains(target) && !menuButtonRef.current?.contains(target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [menuOpen])

  function toggleMenu() {
    setMenuOpen((current) => {
      const next = !current
      if (next && window.matchMedia('(max-width: 980px)').matches) {
        window.requestAnimationFrame(() => {
          navigationRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
        })
      }
      return next
    })
  }

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
            <span className="brand-mark brand-mark--logo" aria-hidden="true">
              <img src={import.meta.env.BASE_URL + 'assets/brand/cemitool-logo.png'} alt="" />
            </span>
            <span className="brand-copy">
              <strong>CEMiTool Explorer</strong>
              <small>Cabernet Sauvignon × Pinot noir</small>
            </span>
          </NavLink>

          <button
            ref={menuButtonRef}
            className="mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            aria-label={menuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
            onClick={toggleMenu}
          >
            <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
            <span>Menú</span>
          </button>

          <div
            ref={navigationRef}
            className={menuOpen ? 'header-navigation header-navigation--open' : 'header-navigation'}
            id="site-navigation"
          >
            <nav className="primary-nav" aria-label="Navegación principal">
              <span className="nav-group-label">Navegación</span>
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
              <span className="nav-group-label">Herramientas</span>
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
                  <span className="utility-link-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
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

      {inResults && (
        <aside
          className={isExternalValidation ? 'research-context research-context--external' : 'research-context'}
          aria-label={isExternalValidation ? 'Contexto de evidencia externa' : 'Contexto científico activo'}
        >
          <div className="research-context-inner">
            <div className="research-context-source">
              <span className="research-context-label">
                {isExternalValidation ? 'EVIDENCIA EXTERNA' : 'BASELINE ACTIVO'}
              </span>
              <strong>{isExternalValidation ? 'Piel aislada' : 'GSE98923 · 54 muestras'}</strong>
              <span className="research-context-limit">
                {isExternalValidation
                  ? 'Observacional · no suma al N=54'
                  : 'Pericarpio completo · no mide grosor de piel'}
              </span>
            </div>

            {moduleId && !geneId && (
              <div className="research-context-workspace" aria-label={'Workspace activo ' + moduleId.toUpperCase()}>
                <strong>{moduleId.toUpperCase()}</strong>
                <span>
                  {moduleId.toUpperCase() === 'M5'
                    ? 'Trayectoria · contrastes · red · hubs · evidencia'
                    : 'Contrastes · función · hubs · validación'}
                </span>
              </div>
            )}

            {breadcrumbItems.length > 0 && (
              <nav className="research-context-route" aria-label="Ruta actual">
                {breadcrumbItems.map((item, index) => (
                  <span key={item.label + String(index)}>
                    {index > 0 && <span aria-hidden="true">/</span>}
                    {item.to && index < breadcrumbItems.length - 1 ? (
                      <Link to={item.to}>{item.label}</Link>
                    ) : (
                      <strong>{item.label}</strong>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        </aside>
      )}

      <main className="site-main" id="main-content" tabIndex={-1}>
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
