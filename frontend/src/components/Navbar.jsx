import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const link = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-soft text-brand-dark' : 'text-muted hover:text-ink'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" onClick={close} className="font-serif text-2xl font-semibold tracking-tight text-ink">
          Inkwell
        </Link>

        <button
          className="rounded-md border border-line p-2 md:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-line bg-paper px-4 py-3 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
          <NavLink to="/" end className={link} onClick={close}>Explore</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={link} onClick={close}>Dashboard</NavLink>
              {user.role === 'admin' && <NavLink to="/admin" className={link} onClick={close}>Admin</NavLink>}
              <NavLink to="/profile" className={link} onClick={close}>{user.name.split(' ')[0]}</NavLink>
              <Link to="/editor" onClick={close} className="btn btn-primary btn-sm md:ml-2">Write a post</Link>
              <button
                className="rounded-md px-3 py-2 text-left text-sm text-muted hover:text-ink"
                onClick={() => { logout(); close(); nav('/'); }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={link} onClick={close}>Log in</NavLink>
              <Link to="/register" onClick={close} className="btn btn-primary btn-sm md:ml-2">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
