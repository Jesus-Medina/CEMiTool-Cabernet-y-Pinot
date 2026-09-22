import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/story', label: 'Story' },
  { to: '/modules', label: 'Módulos' },
  { to: '/enrichment', label: 'Enriquecimiento' },
  { to: '/validation', label: 'Validación' },
  { to: '/t008', label: 'T-008' },
  { to: '/methods', label: 'Métodos' },
  { to: '/evidence', label: 'Evidencia' },
  { to: '/chat', label: 'Chat' },
]

export default function SiteShell() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <NavLink className="brand" to="/" aria-label="Ir al inicio">
            <span className="brand-mark" aria-hidden="true">CP</span>
            <span>
              <strong>CEMiTool Explorer</strong>
              <small>Cabernet Sauvignon × Pinot noir</small>
            </span>
          </NavLink>

          <nav className="primary-nav" aria-label="Navegación principal">
            {navigation.map((item) => (
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
