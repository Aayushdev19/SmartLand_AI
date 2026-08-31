import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check, ArrowRight, BarChart3, Globe } from 'lucide-react';
import Logo from '../components/Logo';
import { saveUser } from '../utils/auth';
import { useAuth } from '../hooks/useAuth';
import signupHero from '../assets/signup_hero.png';

const ease = [0.22, 1, 0.36, 1];

const PW_RULES = [
  { test: p => p.length >= 8, label: 'At least 8 characters' },
  { test: p => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: p => /[0-9]/.test(p), label: 'One number' },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', agree: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const submit = async e => {
    e.preventDefault();
    const { name, email, phone, password, confirm, agree } = form;

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!agree) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const result = saveUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
    if (result.error) { setError(result.error); setLoading(false); return; }

    login(email.trim(), password);
    navigate('/dashboard');
  };

  const pwStrength = PW_RULES.filter(r => r.test(form.password)).length;
  const strengthColor = ['#E2E8F0', '#DC2626', '#CA8A04', '#16A34A'][pwStrength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][pwStrength];

  return (
    <div className="sl-auth-split" style={{ minHeight: '100vh', background: '#F0F2F5', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>
      <div className="sl-auth-panel" style={{ background: '#0F172A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Logo size="lg" dark />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
          <div style={{ width: '100%', maxWidth: 440, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', background: '#1E293B', position: 'relative' }}>
            <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
              <img
                src={signupHero}
                alt="Smart City Real Estate Analytics"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0F172A 0%, rgba(15,23,42,0.4) 60%, transparent 100%)' }} />

              <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6, color: '#60A5FA', fontSize: 11, fontWeight: 700 }}>
                <Globe size={13} /> Gujarat Real Estate Intelligence
              </div>

              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F59E0B', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                  <BarChart3 size={14} /> 10-Year Growth Forecast
                </div>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>
                  +68.4% <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>Capital Appreciation</span>
                </p>
              </div>
            </div>

            <div style={{ padding: '20px 24px', background: '#0F172A' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                Join Gujarat's Premier Valuation Platform
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
                Track portfolio performance, compare localities, and export verified PDF reports.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>

      <div className="sl-auth-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#F0F2F5', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ marginBottom: 20 }}>
            <Logo size="sm" />
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0F172A', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>

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

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 7 }}>
                Full Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="Arjun Mehta"
                className="sl-input"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 7 }}>
                Email Address <span style={{ color: '#DC2626' }}>*</span>
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
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 7 }}>
                Phone Number <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handle}
                placeholder="+91 98765 43210"
                className="sl-input"
                autoComplete="tel"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 7 }}>
                Password <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="Create a strong password"
                  className="sl-input"
                  style={{ paddingRight: 44 }}
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                  aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {form.password && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 3, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        animate={{ width: `${(pwStrength / 3) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%', background: strengthColor, borderRadius: 99 }}
                      />
                    </div>
                    {strengthLabel && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: strengthColor }}>{strengthLabel}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {PW_RULES.map(r => (
                      <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: r.test(form.password) ? '#16A34A' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                          {r.test(form.password) && <Check size={8} style={{ color: '#fff', strokeWidth: 3 }} />}
                        </div>
                        <span style={{ fontSize: 12, color: r.test(form.password) ? '#16A34A' : '#94A3B8' }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 7 }}>
                Confirm Password <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCon ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handle}
                  placeholder="Repeat your password"
                  className="sl-input"
                  style={{
                    paddingRight: 44,
                    borderColor: form.confirm && form.confirm !== form.password ? '#DC2626' : undefined,
                  }}
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowCon(s => !s)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                  {showCon ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }}>Passwords do not match</p>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 13, color: '#374151', lineHeight: 1.55 }}>
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handle}
                style={{ width: 15, height: 15, marginTop: 1, accentColor: '#0F172A', flexShrink: 0 }}
              />
              <span>
                I agree to the{' '}
                <Link to="/" style={{ color: '#0F172A', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/" style={{ color: '#0F172A', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
              </span>
            </label>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ opacity: loading ? 0.7 : 0.88 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="sl-btn-dark"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 8, fontSize: 15, marginTop: 4 }}
            >
              {loading ? (
                <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
