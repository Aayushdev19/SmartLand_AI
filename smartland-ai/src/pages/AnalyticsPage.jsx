import { memo, useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart2, MapPin, Activity, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { getAnalyticsSummary } from '../api/client';

const ease = [0.22, 1, 0.36, 1];
const PIE_COLORS = ['#0F172A', '#475569', '#94A3B8', '#CBD5E1'];
const fmt = v => `₹${Number(v).toLocaleString('en-IN')}`;

/* ── Tooltip ────────────────────────────────────── */
const SLTooltip = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sl-card" style={{ padding: '10px 14px', fontSize: 12 }}>
      <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: '#64748B' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#0F172A' }}>
            {typeof p.value === 'number' ? `₹${Number(p.value).toLocaleString('en-IN')}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
});

/* ── Chart card ─────────────────────────────────── */
const ChartCard = memo(({ title, subtitle, children }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-48px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease }}
      className="sl-card"
      style={{ padding: '24px', willChange: 'opacity, transform' }}
    >
      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: subtitle ? 2 : 18 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 18 }}>{subtitle}</p>}
      {children}
    </motion.div>
  );
});

/* ── Skeleton block ─────────────────────────────── */
function Skel({ h = 200 }) {
  return <div className="skeleton" style={{ height: h, borderRadius: 8 }} />;
}

/* ── Page ───────────────────────────────────────── */
export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getAnalyticsSummary()
      .then(d => setData(d))
      .catch(e => setError('Could not load analytics. Make sure the backend is running on port 8000.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Derived chart data ── */
  const yearlyTrend = data
    ? Object.entries(data.price_by_year).map(([year, price]) => ({ year, price: Number(price) }))
    : [];

  const jantriVsMarket = data
    ? (data.jantri_vs_market || []).map(r => ({
        year: String(r.Year),
        market: Number(r.Market_Price_sq_m),
        jantri: Number(r.Jantri_Price_sq_m),
      }))
    : [];

  const landTypePie = data
    ? Object.entries(data.by_land_type).map(([type, avg]) => ({ type, value: Number(avg) }))
    : [];

  const topAreas = data?.top_areas?.slice(0, 8) || [];

  const kpis = data ? [
    { label: 'Districts Tracked', value: data.total_districts, change: 'Live data', Icon: MapPin },
    { label: 'Model Accuracy (R²)', value: (data.model_r2 * 100).toFixed(2) + '%', change: 'GradientBoosting', Icon: TrendingUp },
    { label: 'Avg MAE (₹/sq m)', value: `₹${Math.round(data.model_mae).toLocaleString('en-IN')}`, change: 'Mean Abs. Error', Icon: BarChart2 },
    { label: 'Land Types', value: landTypePie.length, change: 'In dataset', Icon: Activity },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: '#F0F2F5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>
            Market Analytics
          </h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            Real data from our trained ML model — Gujarat land price intelligence.
          </p>
        </motion.div>

        {/* Error state */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 24, fontSize: 13, color: '#DC2626' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* KPI cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}
        >
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="sl-card" style={{ padding: '20px 22px' }}>
                  <Skel h={20} />
                  <div style={{ marginTop: 12 }}><Skel h={32} /></div>
                </div>
              ))
            : kpis.map(({ label, value, change, Icon }) => (
                <motion.div
                  key={label}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } }}
                  className="sl-card"
                  style={{ padding: '20px 22px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</p>
                    <Icon size={15} style={{ color: '#CBD5E1' }} />
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 4 }}>{value}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8' }}>{change}</p>
                </motion.div>
              ))
          }
        </motion.div>

        {/* Row 1 — Trend + Jantri vs Market */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>

          <ChartCard title="Market Price Trend" subtitle="Average ₹/sq m by year">
            {loading ? <Skel h={220} /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={yearlyTrend} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<SLTooltip />} />
                  <Line type="monotone" dataKey="price" name="Market Price" stroke="#0F172A" strokeWidth={2.5}
                    dot={{ fill: '#0F172A', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Market vs Jantri Rate" subtitle="Annual comparison (₹/sq m)">
            {loading ? <Skel h={220} /> : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={jantriVsMarket} margin={{ left: -10 }}>
                    <defs>
                      <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F172A" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#0F172A" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gJ" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<SLTooltip />} />
                    <Area type="monotone" dataKey="market" name="Market" stroke="#0F172A" fill="url(#gM)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="jantri" name="Jantri" stroke="#94A3B8" fill="url(#gJ)" strokeWidth={2} dot={false} strokeDasharray="4 3" />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                  {[['#0F172A', 'Market Price'], ['#94A3B8', 'Jantri Rate']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                      <span style={{ fontSize: 12, color: '#64748B' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
        </div>

        {/* Row 2 — Pie + Top Districts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>

          <ChartCard title="By Land Type" subtitle="Avg price ₹/sq m">
            {loading ? <Skel h={200} /> : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={landTypePie} cx="50%" cy="50%" innerRadius={56} outerRadius={80}
                      dataKey="value" nameKey="type" paddingAngle={3}>
                      {landTypePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      formatter={v => [fmt(v), 'Avg ₹/sq m']}
                      contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 8 }}>
                  {landTypePie.map((item, i) => (
                    <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#64748B' }}>{item.type}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>

          <ChartCard title="Top Districts by Market Price" subtitle="Average ₹/sq m">
            {loading ? <Skel h={280} /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {['#', 'District', 'Avg ₹/sq m', 'Min', 'Max', 'Transactions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94A3B8', paddingBottom: 10, paddingRight: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topAreas.map((area, i) => (
                    <tr key={area.District} style={{ borderBottom: i < topAreas.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                      <td style={{ padding: '10px 12px 10px 0' }}>
                        <span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: 6, background: i === 0 ? '#0F172A' : '#F1F5F9', color: i === 0 ? '#fff' : '#94A3B8', fontSize: 11, fontWeight: 700, alignItems: 'center', justifyContent: 'center' }}>
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px 10px 0', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{area.District}</td>
                      <td style={{ padding: '10px 12px 10px 0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>₹{Number(area.avg_price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 12px 10px 0', fontSize: 12, color: '#64748B' }}>₹{Number(area.min_price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 12px 10px 0', fontSize: 12, color: '#64748B' }}>₹{Number(area.max_price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 0 10px 0', fontSize: 12, color: '#94A3B8' }}>{area.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ChartCard>
        </div>

        {/* Row 3 — Bar by area category */}
        {data?.by_area_category && (
          <ChartCard title="Price by Area Category" subtitle="Urban vs Rural — avg ₹/sq m">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={Object.entries(data.by_area_category).map(([cat, val]) => ({ cat, price: Number(val) }))}
                barSize={56}
                margin={{ left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="cat" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<SLTooltip />} />
                <Bar dataKey="price" name="Avg Price" radius={[6, 6, 0, 0]}>
                  {Object.keys(data.by_area_category).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#0F172A' : '#E2E8F0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

      </div>
    </div>
  );
}
