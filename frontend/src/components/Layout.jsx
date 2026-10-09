import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/availability', label: 'Availability' },
  { to: '/hospitals', label: 'Hospitals' },
  { to: '/admin', label: 'Admin' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="brand">
            <span aria-hidden="true">🩸</span> BloodFlow <b>India</b>
          </NavLink>
          <nav aria-label="Main">
            {LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
            {user ? (
              <button type="button" className="nav-btn" onClick={logout}>
                Log out
              </button>
            ) : (
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
                Log in
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <div className="demo-banner" role="note">
        Demo project: all data is <strong>synthetic</strong> and does not represent real hospitals or blood banks.
      </div>

      <main className="container">
        <Outlet />
      </main>

      <footer className="footer">
        BloodFlow India · Monitor blood availability. Identify shortage risks. Respond faster.
        <br />
        Risk levels come from a simple rule-based MVP/demo model, not a medical prediction.
      </footer>
    </div>
  );
}
