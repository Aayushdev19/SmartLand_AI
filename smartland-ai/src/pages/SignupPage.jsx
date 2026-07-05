import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import { saveUser } from '../utils/auth';
import { useAuth } from '../hooks/useAuth';

const ease = [0.22, 1, 0.36, 1];

const PW_RULES = [
  { test: p => p.length >= 8,       label: 'At least 8 characters'  },
  { test: p => /[A-Z]/.test(p),     label: 'One uppercase letter'    },
  { test: p => /[0-9]/.test(p),     label: 'One number'              },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', agree: false,
  });
  const [showPw,   setShowPw]   = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

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

    // Auto-login after signup
    login(email.trim(), password);
    navigate('/dashboard');
  };

  const pwStrength = PW_RULES.filter(r => r.test(form.password)).length;
  const strengthColor = ['#E2E8F0', '#DC2626', '#CA8A04', '#16A34A'][pwStrength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][pwStrength];

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>

      {/* ── Left panel — dark dashboard preview ── */}
      <div style={{ background: '#0F172A', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Logo top-left */}
        <div style={{ position: 'absolute', top: 40, left: 40 }}>
          <Logo size="md" dark />
        </div>

        {/* Dashboard mockup */}
        <div style={{ position: 'absolute', top: 100, left: 20, right: 20, bottom: 180, background: '#1E293B', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', opacity: 0.5 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, width: '35%' }} />
          </div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 60, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />)}
          </div>
          <div style={{ margin: '0 16px', height: 90, background: 'rgba(255,255,255,0.03)', borderRadius: 8, display: 'flex', alignItems: 'flex-end', padding: '0 12px 12px', gap: 5 }}>
            {[35,50,42,65,55,75,60,88].map((h,i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 7 ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)', borderRadius: '3px 3px 0 0' }} />
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 18 }}>
            📊
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em', lineHeight: 1.3, marginBottom: 10 }}>
            Smart property valuation for better investment decisions.
          </h2>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65 }}>
            ML-powered price predictions, Jantri rate comparison and market analytics — all in one platform.
          </p>
        </div>
      </div>

      {/* ── Right panel — signup form ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#F0F2F5', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Logo */}
          <div style={{ marginBottom: 28 }}>
            <Logo size="sm" />
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0F172A', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>

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

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Full Name */}
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

            {/* Email */}
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

            {/* Phone */}
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

            {/* Password */}
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

              {/* Strength bar + rules */}
              {form.password && (
                <div style={{ marginTop: 10 }}>
                  {/* Strength bar */}
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
                  {/* Rules */}
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

            {/* Confirm password */}
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

            {/* Terms */}
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
                <a href="#" style={{ color: '#0F172A', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#0F172A', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
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
