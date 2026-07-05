import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, MapPin } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

const ease = [0.22, 1, 0.36, 1];

export default function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '', remember: false });
  const [show,    setShow]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    // Slight delay for UX
    await new Promise(r => setTimeout(r, 400));
    const result = login(form.email.trim(), form.password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>

      {/* ── Left panel — dark with map mockup ── */}
      <div style={{ background: '#0F172A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Logo size="lg" dark />

        {/* Map mockup illustration */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
          <div style={{ width: '100%', maxWidth: 400, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            {/* Map area */}
            <div style={{ height: 300, background: 'linear-gradient(145deg, #1E293B 0%, #263348 50%, #1E293B 100%)', position: 'relative', overflow: 'hidden' }}>
              {/* Grid lines */}
              <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                {[0,1,2,3,4].map(i => <line key={`h${i}`} x1="0" y1={`${i*25}%`} x2="100%" y2={`${i*25+12}%`} stroke="#60A5FA" strokeWidth="0.6" />)}
                {[0,1,2,3,4,5].map(i => <line key={`v${i}`} x1={`${i*20}%`} y1="0" x2={`${i*20+8}%`} y2="100%" stroke="#60A5FA" strokeWidth="0.6" />)}
              </svg>
              {/* Price pins */}
              {[
                { x: '18%', y: '28%', label: '₹18k/sqm' },
                { x: '52%', y: '18%', label: '₹24k/sqm' },
                { x: '68%', y: '52%', label: '₹11k/sqm' },
                { x: '32%', y: '62%', label: '₹31k/sqm' },
              ].map(pin => (
                <div key={pin.label} style={{ position: 'absolute', left: pin.x, top: pin.y, transform: 'translate(-50%,-50%)' }}>
                  <div style={{ background: 'rgba(15,23,42,0.92)', border: '1.5px solid rgba(96,165,250,0.6)', borderRadius: 8, padding: '4px 10px', color: '#93C5FD', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 0 16px rgba(96,165,250,0.25)' }}>
                    {pin.label}
                  </div>
                </div>
              ))}
            </div>
            {/* Caption */}
            <div style={{ padding: '18px 22px', background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 5 }}>Institutional-grade property insights.</p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                Real-time ML valuations, Jantri comparison and investment analytics for Gujarat real estate.
              </p>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#F0F2F5' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="sl-card"
          style={{ width: '100%', maxWidth: 420, padding: '40px', borderRadius: 16 }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Sign in to your SmartLand account
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#DC2626' }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 7 }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handle}
                placeholder="you@example.com"
                className="sl-input"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Password</label>
                <button
                  type="button"
                  style={{ fontSize: 12, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => alert('Password reset — coming soon.')}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  className="sl-input"
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handle}
                style={{ width: 15, height: 15, accentColor: '#0F172A' }}
              />
              Keep me signed in
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ opacity: loading ? 0.7 : 0.88 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="sl-btn-dark"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 8, fontSize: 15 }}
            >
              {loading ? (
                <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
              ) : 'Sign In'}
            </motion.button>

            {/* Sign up link */}
            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 4 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#0F172A', fontWeight: 700, textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
