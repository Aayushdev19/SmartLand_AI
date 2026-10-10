import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Plus, X, TrendingUp, Check, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import { compareProperties, getOptions, getJantriRate } from '../api/client';

const ease = [0.22, 1, 0.36, 1];
const COLORS = ['#0F172A', '#475569', '#94A3B8'];
const rupee = n => `₹${Number(n).toLocaleString('en-IN')}`;

const METRICS = [
  { key: 'market_price_sqm', label: 'Market Price/sq m', fmt: rupee, best: 'max' },
  { key: 'jantri_price_sqm', label: 'Jantri Rate/sq m', fmt: rupee },
  { key: 'total_value', label: 'Total Value (100 sq m)', fmt: rupee, best: 'max' },
  { key: 'premium_pct', label: 'Market Premium', fmt: v => `+${Number(v).toFixed(1)}%` },
  { key: 'investment_score', label: 'Investment Score', fmt: v => `${v}/10`, best: 'max' },
  { key: 'risk_level', label: 'Risk Level', fmt: v => v },
];

const SLTooltip = memo(function SLTooltip({ active, payload, label }) {
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

function PropertySelector({ options, loading, onAdd, onClose, existing }) {
  const [district, setDistrict] = useState('');
  const [landType, setLandType] = useState('Residential');
  const [jantri, setJantri] = useState('');
  const [fetching, setFetching] = useState(false);

  const handleDistrictChange = async (e) => {
    const d = e.target.value;
    setDistrict(d);
    if (!d) return;
    setFetching(true);
    try {
      const data = await getJantriRate(d, landType);
      setJantri(String(data.jantri_rate_sqm));
    } catch {
      setJantri('');
    } finally {
      setFetching(false);
    }
  };

  const handleLandTypeChange = async (e) => {
    const lt = e.target.value;
    setLandType(lt);
    if (!district) return;
    setFetching(true);
    try {
      const data = await getJantriRate(district, lt);
      setJantri(String(data.jantri_rate_sqm));
    } catch {
      setJantri('');
    } finally {
      setFetching(false);
    }
  };

  const handleAdd = () => {
    if (!district || !jantri) return;
    onAdd({ district, landType, jantri: parseFloat(jantri) });
  };

  return (
    <div className="sl-card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Add a property to compare</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, borderRadius: 6 }} aria-label="Cancel">
          <X size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 5 }}>District</label>
          <select
            value={district}
            onChange={handleDistrictChange}
            className="sl-input sl-select"
            disabled={!options}
          >
            <option value="">Select district…</option>
            {(options?.districts || [])
              .filter(d => !existing.includes(d))
              .map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 5 }}>Land Type</label>
          <select value={landType} onChange={handleLandTypeChange} className="sl-input sl-select" disabled={!options}>
            {(options?.land_types || ['Residential', 'Commercial']).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 5 }}>
            Jantri Rate
            {fetching && <Loader2 size={10} className="spin" style={{ marginLeft: 5, color: '#94A3B8' }} />}
          </label>
          <input
            type="number"
            value={jantri}
            onChange={e => setJantri(e.target.value)}
            placeholder="₹/sq m"
            className="sl-input"
            min={0}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!district || !jantri}
          className="sl-btn-dark"
          style={{ borderRadius: 8, padding: '10px 16px', fontSize: 13, flexShrink: 0 }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [slots, setSlots] = useState([]);
  const [results, setResults] = useState(null);
  const [picking, setPicking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState(null);

  useState(() => {
    import('../api/client').then(({ getOptions }) =>
      getOptions().then(setOptions).catch(() => {})
    );
  });

  const addSlot = (slot) => {
    setSlots(prev => [...prev, slot]);
    setPicking(false);
    setResults(null);
    setError(null);
  };

  const removeSlot = (index) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
    setResults(null);
    setError(null);
  };

  const runCompare = async () => {
    if (slots.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const [a, b] = slots;
      const data = await compareProperties({
        district1: a.district,
        land_type1: a.landType,
        jantri1: a.jantri,
        district2: b.district,
        land_type2: b.landType,
        jantri2: b.jantri,
      });
      setResults(data);
    } catch (err) {
      setError(err.message || 'Comparison failed. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const properties = results
    ? [results.property_1, results.property_2]
    : [];

  const getBestVal = (key) => {
    if (!results || properties.length < 2) return null;
    const m = METRICS.find(m => m.key === key);
    if (!m?.best) return null;
    const vals = properties.map(p => parseFloat(p[key]));
    return m.best === 'max' ? Math.max(...vals) : Math.min(...vals);
  };

  const radarData = properties.length >= 2
    ? ['Value', 'Score', 'Confidence', 'Premium', 'Risk'].map((subject, i) => {
        const obj = { subject };
        properties.forEach((p, pi) => {
          const vals = [
            Math.min((p.market_price_sqm / 30000) * 100, 100),
            p.investment_score * 10,
            Math.min(p.premium_pct + 50, 100),
            Math.max(0, 100 - (p.risk_level === 'Low' ? 0 : p.risk_level === 'Medium' ? 30 : 60)),
            (p.jantri_price_sqm / p.market_price_sqm) * 100,
          ];
          obj[`p${pi}`] = Math.round(Math.max(0, vals[i]));
        });
        return obj;
      })
    : [];

  const barData = properties.map(p => ({
    name: p.district,
    price: p.market_price_sqm,
    jantri: p.jantri_price_sqm,
  }));

  const best = results
    ? (results.property_1.investment_score >= results.property_2.investment_score
        ? results.property_1
        : results.property_2)
    : null;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: '#F0F2F5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 64px' }}>
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
            Side-by-side ML-powered comparison of two districts.
          </p>
        </motion.div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <AnimatePresence>
          {picking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease }}
              style={{ overflow: 'hidden', marginBottom: 16 }}
            >
              <PropertySelector
                options={options}
                onAdd={addSlot}
                onClose={() => setPicking(false)}
                existing={slots.map(s => s.district)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sl-compare-grid sl-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
          <div className="sl-compare-grid-inner" style={{
            display: 'grid',
            gridTemplateColumns: `180px repeat(${Math.min(slots.length + 1, 3)}, 1fr)`,
            borderBottom: '1px solid #F1F5F9',
          }}>
            <div style={{ padding: '16px 20px', background: '#F8FAFC', borderRight: '1px solid #F1F5F9' }} />

            {slots.map((s, i) => (
              <div
                key={i}
                style={{ padding: '16px 20px', position: 'relative', background: '#fff', borderRight: i < slots.length - 1 ? '1px solid #F1F5F9' : 'none' }}
              >
                <button
                  onClick={() => removeSlot(i)}
                  style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 4, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
                  aria-label={`Remove ${s.district}`}
                >
                  <X size={12} />
                </button>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', paddingRight: 24, lineHeight: 1.35, marginBottom: 3 }}>{s.district}</p>
                <p style={{ fontSize: 11, color: '#94A3B8' }}>{s.landType}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: COLORS[i] }}>P{i + 1}</span>
                </div>
              </div>
            ))}

            {slots.length < 2 && (
              <button
                onClick={() => setPicking(true)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', background: '#FAFAFA', border: 'none', borderLeft: slots.length > 0 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.background = '#FAFAFA'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} style={{ color: '#94A3B8' }} />
                </div>
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{slots.length === 0 ? 'Add Property 1' : 'Add Property 2'}</span>
              </button>
            )}
          </div>

          {results && METRICS.map((metric, idx) => {
            const bestVal = getBestVal(metric.key);
            return (
              <div
                key={metric.key}
                className="sl-compare-grid-inner"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `180px repeat(2, 1fr)`,
                  borderBottom: idx < METRICS.length - 1 ? '1px solid #F9FAFB' : 'none',
                  background: idx % 2 === 0 ? '#fff' : '#FAFAFA',
                }}
              >
                <div style={{ padding: '11px 20px', display: 'flex', alignItems: 'center', borderRight: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{metric.label}</span>
                </div>
                {properties.map((p, i) => {
                  const raw = p[metric.key];
                  const isTop = bestVal !== null && parseFloat(raw) === bestVal;
                  return (
                    <div key={i} style={{ padding: '11px 20px', display: 'flex', alignItems: 'center', borderRight: i === 0 ? '1px solid #F1F5F9' : 'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isTop ? '#16A34A' : '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {metric.fmt(raw)}
                        {isTop && <Check size={11} style={{ color: '#16A34A' }} strokeWidth={3} />}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {!results && slots.length === 0 && (
            <div style={{ padding: '48px 32px', textAlign: 'center', color: '#94A3B8' }}>
              <TrendingUp size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>Add two properties above to begin comparison.</p>
            </div>
          )}
        </div>

        {slots.length === 2 && !results && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <motion.button
              onClick={runCompare}
              disabled={loading}
              whileHover={{ opacity: loading ? 0.6 : 0.88 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="sl-btn-dark"
              style={{ borderRadius: 8, padding: '12px 32px', fontSize: 15 }}
            >
              {loading
                ? <><Loader2 size={15} className="spin" /> Comparing…</>
                : <><TrendingUp size={15} /> Run Comparison</>
              }
            </motion.button>
          </div>
        )}

        {results && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div className="sl-card" style={{ padding: '24px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 18 }}>Comparison Radar</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#F1F5F9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  {properties.map((p, i) => (
                    <Radar
                      key={i}
                      name={p.district}
                      dataKey={`p${i}`}
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
                {properties.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                    <span style={{ fontSize: 12, color: '#64748B' }}>{p.district}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sl-card" style={{ padding: '24px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 18 }}>Price Comparison</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barSize={24} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<SLTooltip />} />
                  <Bar dataKey="price" name="Market" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                  <Bar dataKey="jantri" name="Jantri" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.3} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

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
                <Trophy size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Recommended: {best.district} ({best.land_type})
              </p>
              <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                Higher investment score ({best.investment_score}/10) with {best.risk_level.toLowerCase()} risk and
                {' '}+{Number(best.premium_pct).toFixed(1)}% market premium above Jantri rate.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
