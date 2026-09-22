import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const primaryNavigation = [
  { to: '/', label: 'Overview', end: true },
  { to: '/modules', label: 'Resultados' },
  { to: '/methods', label: 'Métodos' },
  { to: '/evidence', label: 'Reproducibilidad' },
]

const utilityNavigation = [
  { to: '/t008', label: 'T-008 Status' },
  { to: '/chat', label: 'Preguntar' },
]

export default function SiteShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  function primaryActive(to: string) {
    if (to === '/') return pathname === '/' || pathname.startsWith('/story')
    if (to === '/modules') {
      return ['/modules', '/enrichment', '/validation', '/genes'].some((prefix) =>
        pathname.startsWith(prefix),
      )
    }
    return pathname.startsWith(to)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
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
            </nav>
          </div>
        </div>
      </header>

      <main className="site-main" id="main-content">
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
