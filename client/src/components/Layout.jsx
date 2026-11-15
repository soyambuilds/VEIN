import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Droplet, LogOut } from 'lucide-react';
import { useAuth, homeFor } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const link = ({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-rose text-blood' : 'text-ink hover:bg-mist'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-1.5 font-display text-2xl font-extrabold tracking-tight text-blood">
            <Droplet fill="currentColor" size={22} /> VEIN
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/reviews" className={link}>Reviews</NavLink>
            {user ? (
              <>
                <NavLink to={homeFor(user.role)} className={link}>Dashboard</NavLink>
                <button className="btn-ghost btn-sm btn ml-2" onClick={() => { logout(); nav('/'); }}>
                  <LogOut size={14} /> Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={link}>Sign in</NavLink>
                <Link to="/register" className="btn-primary btn btn-sm ml-2">Join VEIN</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8"><Outlet /></main>
      <footer className="border-t border-line bg-white py-5 text-center text-xs text-slate-500">
        VEIN – Blood Donation Management and Inventory Control System · CSE project, GIET(AUTONOMUS)
      </footer>
    </div>
  );
}
