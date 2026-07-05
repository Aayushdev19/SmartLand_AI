import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, MapPin, Loader2, TrendingUp,
  ArrowUpRight, AlertCircle, Bookmark, BookmarkCheck, FileDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { predictProperty, getOptions, getJantriRate } from '../api/client';
import { savePrediction, saveProperty, getSession } from '../utils/auth';
import { generatePDF } from '../utils/generatePDF';

const ease = [0.22, 1, 0.36, 1];

/* ── Tooltip ────────────────────────────────────── */
const BarTip = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sl-card" style={{ padding: '8px 12px', fontSize: 12 }}>
      <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#64748B' }}>₹{(payload[0].value).toLocaleString('en-IN')}/sq m</p>
    </div>
  );
});

/* ── Progress bar ───────────────────────────────── */
const ProgressBar = memo(({ val, max, color }) => (
  <div style={{ height: 4, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min((val / max) * 100, 100)}%` }}
      transition={{ duration: 1, ease, delay: 0.2 }}
      style={{ height: '100%', background: color, borderRadius: 99 }}
    />
  </div>
));

/* ── Page ───────────────────────────────────────── */
export default function PredictPage() {
  const routeState = useLocation().state;

  const [options, setOptions]     = useState(null);
  const [optErr,  setOptErr]      = useState(null);
  const [form,    setForm]        = useState({
    district:      '',
    locality:      '',
    area_category: 'Urban',
    land_type:     'Residential',
    jantri_price:  '',
    year:          new Date().getFullYear(),
    area_sqm:      '',
    advanced:      false,
  });
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [apiError, setApiError] = useState(null);
  const [jantriLoading, setJantriLoading] = useState(false);
  const [isSaved,  setIsSaved]  = useState(false);
  const [pdfBusy,  setPdfBusy]  = useState(false);

  /* Load dropdown options from API */
  useEffect(() => {
    getOptions()
      .then(data => {
        setOptions(data);
        // Pre-fill district from navigation state
        if (routeState?.location) {
          const match = data.districts.find(d =>
            routeState.location.toLowerCase().includes(d.toLowerCase())
          );
          if (match) setForm(p => ({ ...p, district: match }));
        }
      })
      .catch(e => setOptErr('Could not load options from API. Make sure the backend is running on port 8000.'));
  }, []);

  /* Auto-fetch Jantri rate when district OR land_type changes */
  const lastJantriKey = useRef('');
  useEffect(() => {
    if (!form.district) return;
    const key = `${form.district}__${form.land_type}`;
    // Prevent duplicate calls for the same district+landtype
    if (key === lastJantriKey.current) return;
    lastJantriKey.current = key;
    setJantriLoading(true);
    getJantriRate(form.district, form.land_type)
      .then(data => {
        setForm(p => ({ ...p, jantri_price: String(data.jantri_rate_sqm) }));
      })
      .catch(() => {})
      .finally(() => setJantriLoading(false));
  }, [form.district, form.land_type]); // eslint-disable-line

  const handle = useCallback(e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setApiError(null);
  }, []);

  const run = async () => {
    if (!form.district || !form.jantri_price) {
      setApiError('Please select a district — the Jantri rate will auto-fill.');
      return;
    }
    setLoading(true);
    setResult(null);
    setApiError(null);
    try {
      const payload = {
        district:      form.district,
        locality:      form.locality || form.district,
        area_category: form.area_category,
        land_type:     form.land_type,
        jantri_price:  parseFloat(form.jantri_price),
        year:          parseInt(form.year),
        area_sqm:      form.area_sqm ? parseFloat(form.area_sqm) : null,
      };
      const data = await predictProperty(payload);
      setResult(data);
      setIsSaved(false);
      // Auto-save to prediction history if logged in
      savePrediction(data, {
        district:      form.district,
        locality:      form.locality,
        land_type:     form.land_type,
        area_category: form.area_category,
        area_sqm:      form.area_sqm ? parseFloat(form.area_sqm) : null,
      });
    } catch (err) {
      setApiError(err.message || 'Prediction failed. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Save to dashboard ── */
  const handleSave = () => {
    if (!result) return;
    saveProperty({
      id:                  Date.now(),
      district:            form.district,
      locality:            form.locality || form.district,
      land_type:           form.land_type,
      area_category:       form.area_category,
      area_sqm:            form.area_sqm ? parseFloat(form.area_sqm) : null,
      predicted_price_sqm: result.predicted_price_sqm,
      jantri_price_sqm:    result.jantri_price_sqm,
      investment_score:    result.investment_score,
      risk_level:          result.risk_level,
      confidence_score:    result.confidence_score,
      forecast:            result.forecast,
    });
    setIsSaved(true);
  };

  /* ── Download PDF ── */
  const handlePDF = async () => {
    if (!result) return;
    setPdfBusy(true);
    try {
      generatePDF(result, form);
    } finally {
      setPdfBusy(false);
    }
  };

  /* Build 5-year bar chart from forecast */
  const barData = result ? [
    { y: 'Now',  v: result.predicted_price_sqm,  cur: true  },
    { y: '+1yr', v: result.forecast['1yr'],  cur: false },
    { y: '+3yr', v: result.forecast['3yr'],  cur: false },
    { y: '+5yr', v: result.forecast['5yr'],  cur: false },
    { y: '+10yr',v: result.forecast['10yr'], cur: false },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: '#F0F2F5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 8 }}>
            Property Valuation Engine
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', maxWidth: 540, lineHeight: 1.7 }}>
            Select district and land type — Jantri rate auto-fills from government data. Our ML model (R² = {result ? result.r2 : '0.9991'}) predicts the market price per sq metre.
          </p>
        </motion.div>

        {/* API connection error */}
        {optErr && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#DC2626' }}>
            <AlertCircle size={15} />
            {optErr}
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: Parameters ── */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease }}
            className="sl-card"
            style={{ padding: '24px', position: 'sticky', top: 72 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <SlidersHorizontal size={15} style={{ color: '#64748B' }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Parameters</span>
              {!options && !optErr && (
                <Loader2 size={13} className="spin" style={{ color: '#94A3B8', marginLeft: 4 }} />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* District */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                  District <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handle}
                  className="sl-input sl-select"
                  disabled={!options}
                >
                  <option value="">Select district…</option>
                  {(options?.districts || []).map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Locality */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Locality / Area</label>
                <select
                  name="locality"
                  value={form.locality}
                  onChange={handle}
                  className="sl-input sl-select"
                  disabled={!options}
                >
                  <option value="">Any locality</option>
                  {(options?.localities || []).map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              {/* Land type + Area category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Land Type</label>
                  <select name="land_type" value={form.land_type} onChange={handle} className="sl-input sl-select" disabled={!options}>
                    {(options?.land_types || ['Residential', 'Commercial']).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Area Category</label>
                  <select name="area_category" value={form.area_category} onChange={handle} className="sl-input sl-select" disabled={!options}>
                    {(options?.area_categories || ['Urban', 'Rural']).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Jantri rate (auto-filled) */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                  Jantri Rate (₹/sq m)
                  {jantriLoading && <Loader2 size={11} className="spin" style={{ marginLeft: 6, color: '#94A3B8' }} />}
                  {!jantriLoading && form.jantri_price && (
                    <span style={{ marginLeft: 6, color: '#16A34A', fontSize: 11 }}>auto-filled ✓</span>
                  )}
                </label>
                <input
                  type="number"
                  name="jantri_price"
                  value={form.jantri_price}
                  onChange={handle}
                  placeholder="e.g. 8500"
                  className="sl-input"
                  min={0}
                />
              </div>

              {/* Year + Area */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Year</label>
                  <input type="number" name="year" value={form.year} onChange={handle} min={2000} max={2025} className="sl-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>Area (sq m) <span style={{ color: '#94A3B8', fontWeight: 400 }}>optional</span></label>
                  <input type="number" name="area_sqm" value={form.area_sqm} onChange={handle} placeholder="e.g. 150" className="sl-input" min={1} />
                </div>
              </div>

              {/* Error */}
              {apiError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>
                  <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  {apiError}
                </div>
              )}

              {/* Submit */}
              <motion.button
                onClick={run}
                disabled={loading || !options}
                whileHover={{ opacity: loading ? 0.6 : 0.88 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="sl-btn-dark"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 8, fontSize: 14, marginTop: 4 }}
              >
                {loading
                  ? <><Loader2 size={15} className="spin" /> Analysing…</>
                  : <><TrendingUp size={15} /> Run Valuation Engine</>
                }
              </motion.button>
            </div>
          </motion.div>

          {/* ── RIGHT: Results ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className="sl-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <TrendingUp size={24} style={{ color: '#CBD5E1' }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No analysis yet</p>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.65, maxWidth: 280, margin: '0 auto' }}>
                    Select a district on the left — Jantri rate auto-fills — then click <strong>Run Valuation Engine</strong>.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className="sl-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
                  <Loader2 size={28} className="spin" style={{ color: '#0F172A', marginBottom: 14, display: 'block', margin: '0 auto 14px' }} />
                  <p style={{ fontSize: 14, color: '#64748B' }}>Running ML model…</p>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* ── Market Value Card ── */}
                  <div className="sl-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 10 }}>
                          Estimated Market Value
                        </p>
                        <p style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', lineHeight: 1, marginBottom: 10 }}>
                          ₹{result.predicted_price_sqm.toLocaleString('en-IN')}<span style={{ fontSize: 18, color: '#94A3B8' }}>/sq m</span>
                        </p>
                        {result.total_value && (
                          <p style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                            Total: ₹{result.total_value.toLocaleString('en-IN')}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: result.market_premium_pct >= 0 ? '#16A34A' : '#DC2626' }}>
                            <ArrowUpRight size={14} /> {result.market_premium_pct > 0 ? '+' : ''}{result.market_premium_pct.toFixed(1)}% above Jantri
                          </span>
                          <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 999, background: '#F0FDF4', color: '#16A34A', fontWeight: 600, border: '1px solid #BBF7D0' }}>
                            {result.confidence_score}% Confidence
                          </span>
                          <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 999, background: '#F1F5F9', color: '#374151', fontWeight: 500, border: '1px solid #E2E8F0' }}>
                            {result.model_used}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>Investment Score</p>
                          <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A' }}>{result.investment_score}<span style={{ fontSize: 14, color: '#94A3B8' }}>/10</span></p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>Risk Level</p>
                          <span style={{ fontSize: 14, fontWeight: 700, color: result.risk_level === 'Low' ? '#16A34A' : result.risk_level === 'Medium' ? '#CA8A04' : '#DC2626' }}>
                            {result.risk_level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Chart + Risk ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Value Trajectory */}
                    <div className="sl-card" style={{ padding: '20px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 14 }}>Value Trajectory</p>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={barData} barSize={28} margin={{ left: -10 }}>
                          <XAxis dataKey="y" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                          <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                            {barData.map((d, i) => (
                              <Cell key={i} fill={d.cur ? '#0F172A' : '#E2E8F0'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>
                        Annual growth: ~{result.growth_rate_pct}%
                      </p>
                    </div>

                    {/* Risk & Viability */}
                    <div className="sl-card" style={{ padding: '20px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Risk &amp; Viability</p>
                      {[
                        { label: 'Market vs Jantri',  val: Math.min(result.market_premium_pct + 50, 100), max: 100, color: '#0F172A' },
                        { label: 'Investment Score',  val: result.investment_score * 10, max: 100, color: '#0F172A' },
                        { label: 'Model Confidence',  val: result.confidence_score, max: 100, color: '#16A34A' },
                      ].map(m => (
                        <div key={m.label} style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: '#374151' }}>{m.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{Math.round(m.val)}/100</span>
                          </div>
                          <ProgressBar val={m.val} max={m.max} color={m.color} />
                        </div>
                      ))}
                      <div style={{ marginTop: 16, padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                        <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Overall Verdict</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                          {result.investment_score >= 7.5 ? 'Prime Acquisition Target' :
                           result.investment_score >= 5   ? 'Hold / Monitor' : 'Proceed with Caution'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Forecast Table ── */}
                  <div className="sl-card" style={{ padding: '20px 24px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Investment Forecast (₹/sq m)</p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                            {['Horizon', 'Est. Price/sq m', 'Total (if area given)', 'Growth'].map(h => (
                              <th key={h} style={{ textAlign: 'left', paddingBottom: 10, paddingRight: 16, fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(result.forecast).map(([period, price]) => {
                            const growth = (((price - result.predicted_price_sqm) / result.predicted_price_sqm) * 100).toFixed(1);
                            const label = period.replace('yr', ' Year').replace('1 Year', '1 Year');
                            return (
                              <tr key={period} style={{ borderBottom: '1px solid #F9FAFB' }}>
                                <td style={{ padding: '11px 16px 11px 0', fontWeight: 600, color: '#374151' }}>{label}</td>
                                <td style={{ padding: '11px 16px 11px 0', fontWeight: 700, color: '#0F172A' }}>₹{price.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '11px 16px 11px 0', color: '#64748B' }}>
                                  {result.total_value && form.area_sqm ? `₹${(price * parseFloat(form.area_sqm)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
                                </td>
                                <td style={{ padding: '11px 0 11px 0' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: '#16A34A' }}>
                                    <ArrowUpRight size={11} />+{growth}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Action buttons + Model info ── */}
                  <div className="sl-card" style={{ padding: '16px 20px' }}>
                    {/* Action row */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                      <motion.button
                        onClick={handleSave}
                        whileTap={{ scale: 0.97 }}
                        className={isSaved ? 'sl-btn-outline' : 'sl-btn-dark'}
                        style={{
                          borderRadius: 8,
                          background: isSaved ? '#F0FDF4' : '#0F172A',
                          color: isSaved ? '#16A34A' : '#fff',
                          borderColor: isSaved ? '#BBF7D0' : undefined,
                        }}
                        disabled={!getSession()}
                        title={!getSession() ? 'Sign in to save' : ''}
                      >
                        {isSaved
                          ? <><BookmarkCheck size={14} /> Saved to Dashboard</>
                          : <><Bookmark size={14} /> Save to Dashboard</>
                        }
                      </motion.button>

                      <motion.button
                        onClick={handlePDF}
                        whileTap={{ scale: 0.97 }}
                        className="sl-btn-outline"
                        disabled={pdfBusy}
                        style={{ borderRadius: 8 }}
                      >
                        {pdfBusy
                          ? <><Loader2 size={14} className="spin" /> Generating…</>
                          : <><FileDown size={14} /> Download PDF</>
                        }
                      </motion.button>
                    </div>

                    {/* Model metadata */}
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                      {[
                        { label: 'Model',       value: result.model_used },
                        { label: 'R² Score',    value: result.r2 },
                        { label: 'MAE',         value: `₹${result.mae.toLocaleString('en-IN')}/sq m` },
                        { label: 'Jantri Rate', value: `₹${result.jantri_price_sqm.toLocaleString('en-IN')}/sq m` },
                      ].map(item => (
                        <div key={item.label}>
                          <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>{item.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
