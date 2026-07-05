import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Map, BarChart2, Settings,
  Plus, Download, ArrowUpRight, TrendingUp, Clock,
  FileText, Trash2, Building2, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import {
  getPredictions, getSavedProperties,
  removeSavedProperty, savePrediction
} from '../utils/auth';

const ease = [0.22, 1, 0.36, 1];

const sideNav = [
  { label: 'Overview',   icon: LayoutDashboard, to: '/dashboard' },
  { label: 'History',    icon: Clock,           to: '/dashboard' },
  { label: 'Saved',      icon: Building2,       to: '/dashboard' },
  { label: 'Map',        icon: Map,             to: '/map'       },
  { label: 'Analytics',  icon: BarChart2,       to: '/analytics' },
  { label: 'Settings',   icon: Settings,        to: '/profile'   },
];

const rupee = n => `₹${Number(n).toLocaleString('en-IN')}`;

/* ── Tooltip ─────────────────────────────────── */
function SLTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="sl-card" style={{ padding: '8px 12px', fontSize: 12 }}>
      <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: '#64748B' }}>
          {p.name}: <strong style={{ color: '#0F172A' }}>₹{Number(p.value).toLocaleString('en-IN')}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────── */
function Skel({ h = 20, w = '100%' }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: 6 }} />;
}

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]             = useState('Overview');
  const [predictions, setPreds]   = useState([]);
  const [saved, setSaved]         = useState([]);

  /* Load real data from LocalStorage */
  useEffect(() => {
    if (isLoggedIn) {
      setPreds(getPredictions());
      setSaved(getSavedProperties());
    }
  }, [isLoggedIn, tab]);

  /* ── Trend chart from real prediction history ── */
  const trendData = predictions.slice(0, 10).reverse().map((p, i) => ({
    label: `#${i + 1}`,
    price: p.predicted_price_sqm || 0,
    jantri: p.jantri_price_sqm || 0,
  }));

  /* ── KPIs from real data ── */
  const totalPredictions = predictions.length;
  const avgScore = predictions.length
    ? (predictions.reduce((s, p) => s + (p.investment_score || 0), 0) / predictions.length).toFixed(1)
    : '—';
  const avgPrice = predictions.length
    ? Math.round(predictions.reduce((s, p) => s + (p.predicted_price_sqm || 0), 0) / predictions.length)
    : 0;

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: 56, background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <LayoutDashboard size={24} style={{ color: '#94A3B8' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Sign in to view your dashboard</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Access your prediction history, saved properties and reports.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/login" className="sl-btn-dark" style={{ textDecoration: 'none', borderRadius: 8, padding: '10px 24px' }}>Sign In</Link>
            <Link to="/signup" className="sl-btn-outline" style={{ textDecoration: 'none', borderRadius: 8 }}>Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 56, background: '#F0F2F5' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 200, background: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 56, bottom: 0, left: 0, zIndex: 10 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name?.split(' ').slice(0, 2).join(' ')}
              </p>
              <p style={{ fontSize: 11, color: '#94A3B8' }}>Free Plan</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {sideNav.map(item => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => item.to === '/dashboard' && setTab(item.label)}
              className={`sl-nav-item ${tab === item.label && item.to === '/dashboard' ? 'active' : ''}`}
              style={{ marginBottom: 2, textDecoration: 'none' }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 10px 20px' }}>
          <button onClick={() => navigate('/predict')} className="sl-btn-dark"
            style={{ width: '100%', justifyContent: 'center', borderRadius: 8, padding: '10px', fontSize: 13 }}>
            <Plus size={14} /> New Valuation
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 200, flex: 1, padding: '40px 36px', minHeight: '100vh' }}>

        {/* ══ OVERVIEW ══ */}
        {tab === 'Overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>
                  Welcome back, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ fontSize: 14, color: '#64748B' }}>Here's your valuation activity at a glance.</p>
              </div>
              <button onClick={() => navigate('/predict')} className="sl-btn-dark" style={{ borderRadius: 8 }}>
                <Plus size={14} /> New Valuation
              </button>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Valuations',    value: totalPredictions || '0',          sub: 'All time',            icon: TrendingUp },
                { label: 'Avg Investment Score',value: avgScore,                          sub: 'Across all predictions',icon: BarChart2 },
                { label: 'Avg Market Price',    value: avgPrice ? `₹${avgPrice.toLocaleString('en-IN')}` : '—', sub: 'Per sq metre', icon: Building2 },
              ].map(k => (
                <div key={k.label} className="sl-card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{k.label}</p>
                    <k.icon size={16} style={{ color: '#CBD5E1' }} />
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 4 }}>{k.value}</p>
                  <p style={{ fontSize: 12, color: '#94A3B8' }}>{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Trend chart — from real prediction history */}
            <div className="sl-card" style={{ padding: '24px 28px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Prediction History Trend</h2>
                <span style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #E2E8F0', borderRadius: 6, color: '#64748B' }}>
                  Last {Math.min(trendData.length, 10)} predictions
                </span>
              </div>

              {trendData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                  <TrendingUp size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontSize: 14 }}>No predictions yet.</p>
                  <button onClick={() => navigate('/predict')} style={{ marginTop: 12, fontSize: 13, color: '#0F172A', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Run your first valuation →
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData} margin={{ left: -10 }}>
                    <defs>
                      <linearGradient id="gPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F172A" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#0F172A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<SLTooltip />} />
                    <Area type="monotone" dataKey="price" name="Market Price" stroke="#0F172A" fill="url(#gPrice)" strokeWidth={2} dot={{ fill: '#0F172A', r: 3, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="jantri" name="Jantri Rate" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent predictions */}
            {predictions.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Recent Valuations</h2>
                  <button onClick={() => setTab('History')} style={{ fontSize: 13, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                    View all <ArrowUpRight size={13} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {predictions.slice(0, 3).map(p => (
                    <div key={p.id} className="sl-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                          {p.district || 'Unknown'} — {p.land_type || 'Property'}
                        </p>
                        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                          {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {p.area_sqm ? ` · ${p.area_sqm} sq m` : ''}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                          ₹{Number(p.predicted_price_sqm || 0).toLocaleString('en-IN')}<span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>/sq m</span>
                        </p>
                        <p style={{ fontSize: 11, color: p.risk_level === 'Low' ? '#16A34A' : p.risk_level === 'High' ? '#DC2626' : '#CA8A04', marginTop: 2, fontWeight: 600 }}>
                          {p.risk_level || '—'} Risk · Score {p.investment_score || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ HISTORY ══ */}
        {tab === 'History' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>Prediction History</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>All your past property valuations.</p>

            {predictions.length === 0 ? (
              <div className="sl-card" style={{ padding: '56px 32px', textAlign: 'center' }}>
                <Clock size={36} style={{ color: '#CBD5E1', margin: '0 auto 14px', display: 'block' }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No history yet</p>
                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>Your prediction history will appear here after you run your first valuation.</p>
                <button onClick={() => navigate('/predict')} className="sl-btn-dark" style={{ borderRadius: 8 }}>
                  Run Valuation
                </button>
              </div>
            ) : (
              <div className="sl-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#F8FAFC' }}>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {['District', 'Land Type', 'Market Price/sqm', 'Jantri/sqm', 'Score', 'Risk', 'Date'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < predictions.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{p.district || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>{p.land_type || '—'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>₹{Number(p.predicted_price_sqm || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>₹{Number(p.jantri_price_sqm || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#CA8A04' }}>{p.investment_score || '—'}/10</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                            background: p.risk_level === 'Low' ? '#F0FDF4' : p.risk_level === 'High' ? '#FEF2F2' : '#FEFCE8',
                            color: p.risk_level === 'Low' ? '#16A34A' : p.risk_level === 'High' ? '#DC2626' : '#CA8A04' }}>
                            {p.risk_level || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: 12 }}>
                          {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ SAVED ══ */}
        {tab === 'Saved' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>Saved Properties</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Properties you've bookmarked from valuations.</p>

            {saved.length === 0 ? (
              <div className="sl-card" style={{ padding: '56px 32px', textAlign: 'center' }}>
                <Building2 size={36} style={{ color: '#CBD5E1', margin: '0 auto 14px', display: 'block' }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No saved properties yet</p>
                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>After running a valuation, click "Save to Dashboard" to bookmark it here.</p>
                <button onClick={() => navigate('/predict')} className="sl-btn-dark" style={{ borderRadius: 8 }}>
                  Run Valuation
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {saved.map(p => (
                  <div key={p.id} className="sl-card" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{p.district}</p>
                        <p style={{ fontSize: 12, color: '#94A3B8' }}>{p.land_type} · {p.area_category}</p>
                      </div>
                      <button
                        onClick={() => { removeSavedProperty(p.id); setSaved(getSavedProperties()); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 4 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                        onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 4 }}>
                      ₹{Number(p.predicted_price_sqm || 0).toLocaleString('en-IN')}<span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>/sq m</span>
                    </p>
                    <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#94A3B8' }}>Investment Score</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#CA8A04' }}>{p.investment_score}/10</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: '#94A3B8' }}>Risk</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: p.risk_level === 'Low' ? '#16A34A' : p.risk_level === 'High' ? '#DC2626' : '#CA8A04' }}>
                          {p.risk_level}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: '#94A3B8' }}>Jantri</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>₹{Number(p.jantri_price_sqm || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: '#CBD5E1', marginTop: 10 }}>
                      Saved {new Date(p.savedAt || p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </main>
    </div>
  );
}
