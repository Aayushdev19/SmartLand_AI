import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import loginHero from '../assets/login_hero.png';

const ease = [0.22, 1, 0.36, 1];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError('');
    setInfo('');
  };

  const handleForgot = () => {
    if (!form.email.trim()) {
      setError('Please enter your email address to reset password.');
      return;
    }
    setInfo(`Password reset instructions sent to ${form.email.trim()}`);
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(form.email.trim(), form.password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate('/dashboard');
  };

  return (
    <div className="sl-auth-split" style={{ minHeight: '100vh', background: '#F0F2F5', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>
      <div className="sl-auth-panel" style={{ background: '#0F172A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Logo size="lg" dark />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
          <div style={{ width: '100%', maxWidth: 440, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', background: '#1E293B', position: 'relative' }}>
            <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
              <img
                src={loginHero}
                alt="SmartLand Valuation Architecture"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0F172A 0%, rgba(15,23,42,0.4) 60%, transparent 100%)' }} />

              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6, color: '#4ADE80', fontSize: 11, fontWeight: 700 }}>
                <ShieldCheck size={13} /> AI Verified (R² 0.9991)
              </div>

              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38BDF8', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                  <TrendingUp size={14} /> Vadodara Residential Valuation
                </div>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>
                  ₹18,500 <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>/ sq m</span>
                </p>
              </div>
            </div>

            <div style={{ padding: '20px 24px', background: '#0F172A' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                Institutional Property Intelligence
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
                Real-time ML land valuations, official Jantri rate mapping, and investment forecasting.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#F0F2F5' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="sl-card"
          style={{ width: '100%', maxWidth: 420, padding: '40px', borderRadius: 16 }}
        >
          <div style={{ marginBottom: 32 }}>
            <Logo size="sm" />
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginTop: 16, marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Sign in to your SmartLand account
            </p>
          </div>

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

          {info && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#16A34A' }}
            >
              <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
              {info}
            </motion.div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Password</label>
                <button
                  type="button"
                  style={{ fontSize: 12, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                  onClick={handleForgot}
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
