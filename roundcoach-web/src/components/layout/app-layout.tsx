import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/matches', label: 'Partidas' },
  { to: '/profile', label: 'Perfil' },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/50 bg-white/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/dashboard" className="text-lg font-bold uppercase tracking-[0.22em] text-pine">
            RoundCoach
          </Link>
          <nav className="flex items-center gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm ${
                    isActive ? 'bg-ink text-sand' : 'text-ink/70 hover:bg-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="text-xs text-ink/60">{user?.email}</p>
              {user?.currentRank || user?.mainRole ? (
                <p className="text-xs text-ink/50">
                  {[user?.currentRank, user?.mainRole].filter(Boolean).join(' · ')}
                </p>
              ) : null}
            </div>
            <button
              onClick={clearSession}
              className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink hover:bg-white"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
