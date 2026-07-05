import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Plus, X, TrendingUp, ArrowUpRight, Check, Trophy } from 'lucide-react';
import { mockProperties } from '../data/mockData';

/* ── Constants ──────────────────────────────────── */
const ease   = [0.22, 1, 0.36, 1];
const COLORS = ['#0F172A', '#475569', '#94A3B8'];
const rupee  = n => `₹${n.toLocaleString('en-IN')}`;

const METRICS = [
  { key: 'predictedPrice', label: 'Predicted Price',   fmt: rupee,                          best: 'max' },
  { key: 'jantriRate',     label: 'Jantri Rate',        fmt: rupee                                       },
  { key: 'area',           label: 'Area (sq ft)',        fmt: v => v.toLocaleString('en-IN'), best: 'max' },
  { key: 'pricePerSqFt',  label: 'Price / sq ft',       fmt: v => `₹${v.toLocaleString('en-IN')}`, best: 'min' },
  { key: 'investmentScore',label: 'Investment Score',   fmt: v => `${v}/10`,                 best: 'max' },
  { key: 'growth',         label: '1-Year Growth',       fmt: v => v                                     },
  { key: 'jantriDiff',     label: 'Market Premium',      fmt: v => `+${v}%`                             },
];

function enrich(p) {
  return {
    ...p,
    pricePerSqFt: Math.round(p.predictedPrice / p.area),
    jantriDiff:   (((p.predictedPrice - p.jantriRate) / p.jantriRate) * 100).toFixed(1),
  };
}

/* ── Tooltip ────────────────────────────────────── */
const SLTooltip = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sl-card" style={{ padding: '10px 14px', fontSize: 12 }}>
      <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#64748B' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#0F172A' }}>{rupee(p.value)}</span>
        </div>
      ))}
    </div>
  );
});

/* ── Page ───────────────────────────────────────── */
export default function ComparePage() {
  const [selected, setSelected] = useState(mockProperties.slice(0, 2).map(enrich));
  const [picking,  setPicking]  = useState(false);

  const available = mockProperties
    .filter(p => !selected.find(s => s.id === p.id))
    .map(enrich);

  const remove = id => setSelected(prev => prev.filter(p => p.id !== id));
  const add    = p  => { setSelected(prev => [...prev, p]); setPicking(false); };

  const best = selected.length >= 2
    ? [...selected].sort((a, b) => b.investmentScore - a.investmentScore)[0]
    : null;

  const getBestVal = key => {
    const m = METRICS.find(m => m.key === key);
    if (!m?.best || selected.length < 2) return null;
    const vals = selected.map(p => parseFloat(p[key]));
    return m.best === 'max' ? Math.max(...vals) : Math.min(...vals);
  };

  const radarData = ['Value', 'Growth', 'Area', 'Price', 'Jantri'].map((subject, i) => {
    const obj = { subject };
    selected.forEach(p => {
      const v = [
        p.investmentScore * 10,
        parseInt(p.growth) * 7,
        Math.min((p.area / 2000) * 100, 100),
        Math.max(0, 100 - p.pricePerSqFt / 80),
        (p.jantriRate / p.predictedPrice) * 100,
      ];
      obj[p.id] = Math.round(v[i]);
    });
    return obj;
  });

  const barData = selected.map(p => ({
    name:   p.name.split(',')[0],
    price:  p.predictedPrice,
    jantri: p.jantriRate,
  }));

  const colCount = Math.min(selected.length + 1, 4);

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: '#F0F2F5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          style={{ marginBottom: 28 }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>
            Compare Properties
          </h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            Side-by-side comparison of up to 3 properties.
          </p>
        </motion.div>

        {/* Picker */}
        <AnimatePresence>
          {picking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease }}
              style={{ overflow: 'hidden', marginBottom: 16 }}
            >
              <div className="sl-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Select a property to add</p>
                  <button onClick={() => setPicking(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, borderRadius: 6 }} aria-label="Cancel">
                    <X size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {available.length ? available.map(p => (
                    <button
                      key={p.id}
                      onClick={() => add(p)}
                      className="sl-btn-outline"
                      style={{ fontSize: 13 }}
                    >
                      {p.name}
                    </button>
                  )) : (
                    <p style={{ fontSize: 13, color: '#94A3B8' }}>No more demo properties available.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison table */}
        <div className="sl-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `180px repeat(${colCount - 1}, 1fr)`,
            borderBottom: '1px solid #F1F5F9',
          }}>
            {/* Label column */}
            <div style={{ padding: '16px 20px', background: '#F8FAFC', borderRight: '1px solid #F1F5F9' }} />

            {/* Property columns */}
            {selected.map((p, i) => (
              <div
                key={p.id}
                style={{ padding: '16px 20px', position: 'relative', background: best?.id === p.id ? '#F8FAF9' : '#fff', borderRight: i < selected.length - 1 ? '1px solid #F1F5F9' : 'none' }}
              >
                {best?.id === p.id && (
                  <span style={{ position: 'absolute', top: 12, right: 36, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: 99, border: '1px solid #BBF7D0' }}>
                    <Trophy size={9} /> Best
                  </span>
                )}
                <button
                  onClick={() => remove(p.id)}
                  style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 4, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
                  aria-label={`Remove ${p.name}`}
                >
                  <X size={12} />
                </button>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', paddingRight: 48, lineHeight: 1.35, marginBottom: 3 }}>{p.name}</p>
                <p style={{ fontSize: 11, color: '#94A3B8' }}>{p.type}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: COLORS[i] }}>P{i + 1}</span>
                </div>
              </div>
            ))}

            {/* Add column */}
            {selected.length < 3 && (
              <button
                onClick={() => setPicking(true)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', background: '#FAFAFA', border: 'none', borderLeft: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.background = '#FAFAFA'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} style={{ color: '#94A3B8' }} />
                </div>
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Add Property</span>
              </button>
            )}
          </div>

          {/* Metric rows */}
          {METRICS.map((metric, idx) => {
            const bestVal = getBestVal(metric.key);
            return (
              <div
                key={metric.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `180px repeat(${colCount - 1}, 1fr)`,
                  borderBottom: idx < METRICS.length - 1 ? '1px solid #F9FAFB' : 'none',
                  background: idx % 2 === 0 ? '#fff' : '#FAFAFA',
                }}
              >
                <div style={{ padding: '11px 20px', display: 'flex', alignItems: 'center', borderRight: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{metric.label}</span>
                </div>
                {selected.map((p, i) => {
                  const raw = p[metric.key];
                  const isTop = bestVal !== null && parseFloat(raw) === bestVal;
                  return (
                    <div key={p.id} style={{ padding: '11px 20px', display: 'flex', alignItems: 'center', borderRight: i < selected.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isTop ? '#16A34A' : '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {metric.fmt(raw)}
                        {isTop && <Check size={11} style={{ color: '#16A34A' }} strokeWidth={3} />}
                      </span>
                    </div>
                  );
                })}
                {selected.length < 3 && <div style={{ borderLeft: '1px solid #F1F5F9' }} />}
              </div>
            );
          })}
        </div>

        {/* Charts */}
        {selected.length >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
            {/* Radar */}
            <div className="sl-card" style={{ padding: '24px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 18 }}>Comparison Radar</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#F1F5F9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  {selected.map((p, i) => (
                    <Radar
                      key={p.id}
                      name={p.name.split(',')[0]}
                      dataKey={p.id}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.07}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', marginTop: 8 }}>
                {selected.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                    <span style={{ fontSize: 12, color: '#64748B' }}>{p.name.split(',')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price bar */}
            <div className="sl-card" style={{ padding: '24px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 18 }}>Price Comparison</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barSize={24} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<SLTooltip />} />
                  <Bar dataKey="price"  name="Market" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                  <Bar dataKey="jantri" name="Jantri"  radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.3} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recommendation */}
        {best && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="sl-card"
            style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, background: '#F0FDF4', borderColor: '#BBF7D0' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={16} style={{ color: '#16A34A' }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>
                Recommendation: {best.name}
              </p>
              <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                Highest investment score ({best.investmentScore}/10) with {best.growth} projected annual growth. Best choice for long-term capital appreciation.
              </p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
