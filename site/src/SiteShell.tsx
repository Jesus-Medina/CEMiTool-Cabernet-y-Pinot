import { NavLink, Outlet } from 'react-router-dom'

const primaryNavigation = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/results', label: 'Resultados' },
  { to: '/methods', label: 'Métodos' },
  { to: '/reproducibility', label: 'Reproducibilidad' },
]

const secondaryNavigation = [
  { to: '/t008', label: 'T-008' },
  { to: '/chat', label: 'Preguntar' },
]

export default function SiteShell() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <NavLink className="brand" to="/" aria-label="Ir al inicio">
              <span className="brand-mark" aria-hidden="true">CP</span>
              <span>
                <strong>CEMiTool Explorer</strong>
                <small>Cabernet Sauvignon × Pinot noir</small>
              </span>
            </NavLink>

            <nav className="primary-nav" aria-label="Navegación principal">
              {primaryNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link--active' : 'nav-link'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <nav className="secondary-nav" aria-label="Navegación utilitaria" style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
            {secondaryNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link-secondary nav-link--active' : 'nav-link-secondary'
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button type="button" className="nav-link-secondary" aria-label="Buscar">Buscar</button>
            <a href="https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot" target="_blank" rel="noopener noreferrer" className="nav-link-secondary">GitHub</a>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>CEMiTool Cabernet–Pinot Explorer</span>
          <span>Visualización científica · datos canónicos + provenance reproducible</span>
        </div>
      </footer>
    </div>
  )
}
