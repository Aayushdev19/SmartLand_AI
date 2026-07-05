import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Valuation' },
  { to: '/map', label: 'Map' },
  { to: '/compare', label: 'Compare' },
  { to: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search, setSearch] = useState('');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate('/predict', { state: { location: search } }); setSearch(''); }
  };

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Logo size="md" />
        </Link>

        {/* Search bar — center */}
        <form
          onSubmit={handleSearch}
          style={{ flex: 1, maxWidth: 360, display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 999, padding: '7px 14px' }}
          className="hidden md:flex"
        >
          <Search size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties or addresses..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#0F172A' }}
            aria-label="Search"
          />
        </form>

        {/* Nav links */}
        <nav className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#0F172A' : '#64748B',
                  textDecoration: active ? 'none' : 'none',
                  borderBottom: active ? '2px solid #0F172A' : '2px solid transparent',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.background = '#F8FAFC'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; } }}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            to="/#contact"
            style={{ padding: '6px 12px', borderRadius: 6, fontSize: 14, color: '#64748B', textDecoration: 'none', transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
          >
            Contact
          </Link>
        </nav>

        {/* Right — auth */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} className="hidden md:flex">
          {isLoggedIn ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenu(!userMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#0F172A' }}
              >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={12} style={{ color: '#94A3B8', transform: userMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 200, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 9999 }}
                  >
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{user?.name}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{user?.email}</p>
                    </div>
                    {[
                      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                      { to: '/profile', icon: User, label: 'Profile' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: '#374151', textDecoration: 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <item.icon size={14} style={{ color: '#94A3B8' }} />
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid #F1F5F9' }}>
                      <button
                        onClick={() => { logout(); setUserMenu(false); navigate('/'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="sl-btn-dark" style={{ borderRadius: 999, padding: '8px 20px', fontSize: 14, textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ marginLeft: 'auto', padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A' }}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: '#fff', borderTop: '1px solid #F1F5F9', overflow: 'hidden' }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: pathname === l.to ? 600 : 400, color: pathname === l.to ? '#0F172A' : '#64748B', background: pathname === l.to ? '#F1F5F9' : 'transparent', textDecoration: 'none' }}
                >
                  {l.label}
                </Link>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8 }}>
                {isLoggedIn ? (
                  <Link to="/dashboard" style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#0F172A', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/login" style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#0F172A', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
