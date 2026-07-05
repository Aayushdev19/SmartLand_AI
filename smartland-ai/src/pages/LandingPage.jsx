import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, BarChart2, Shield, ArrowRight, FileText } from 'lucide-react';

/* ── Animation helpers ───────────────────────────── */
const ease = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease },
});

const staggerParent = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerChild = {
  initial: { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

/* ── Static data (outside component = no re-create) ─ */
const TRUSTED = ['Apex Partners', 'Global REIT', 'Prime Estates', 'Vanguard Build'];

const FEATURES = [
  { Icon: TrendingUp, label: 'Market Valuation',       desc: 'Data-backed estimates from thousands of verified property transactions across Gujarat.' },
  { Icon: MapPin,     label: 'Location Intelligence',  desc: 'GIS overlays: Jantri zones, flood risk, town planning and infrastructure layers.' },
  { Icon: BarChart2,  label: 'Market Analytics',        desc: 'Live trend charts, heatmaps and area rankings across 45+ cities.' },
  { Icon: Shield,     label: 'Risk Assessment',         desc: 'Flood, legal and market-volatility scores to protect every investment.' },
  { Icon: FileText,   label: 'Jantri Comparison',       desc: 'Instantly compare government guideline rates with real market prices.' },
  { Icon: ArrowRight, label: 'Investment Forecast',     desc: '1, 3, 5 and 10-year projections with ROI calculator and risk scoring.' },
];

/* ── Sub-components (memoised) ─────────────────────── */
const FeatureCard = memo(({ Icon, label, desc, index }) => (
  <motion.div
    variants={staggerChild}
    whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
    className="sl-card"
    style={{ padding: '28px 24px', transition: 'box-shadow 0.2s, transform 0.2s', willChange: 'transform' }}
  >
    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
      <Icon size={18} style={{ color: '#0F172A' }} />
    </div>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{label}</h3>
    <p  style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65 }}>{desc}</p>
  </motion.div>
));

/* ── Page ─────────────────────────────────────────── */
export default function LandingPage() {
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const goPredict = () => {
    if (address.trim()) navigate('/predict', { state: { location: address.trim() } });
  };

  return (
    <div style={{ background: '#F0F2F5' }}>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ minHeight: 'calc(100vh - 56px)', paddingTop: 56, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Background: real building photo, transparent overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1800&q=60')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            filter: 'grayscale(30%)',
          }}
        />
        {/* Multi-stop gradient overlay – keeps text readable */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(180deg, rgba(240,242,245,0.82) 0%, rgba(240,242,245,0.72) 40%, rgba(240,242,245,0.94) 80%, #F0F2F5 100%)',
          }}
        />
        {/* Subtle grid */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            backgroundImage: `linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '40px 24px 60px', maxWidth: 760, width: '100%' }}>

          <motion.p {...fadeUp(0)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#64748B', textTransform: 'uppercase', marginBottom: 20 }}>
            Property Intelligence Platform · Gujarat
          </motion.p>

          <motion.h1
            {...fadeUp(0.06)}
            style={{ fontSize: 'clamp(34px, 5.5vw, 58px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', lineHeight: 1.1, marginBottom: 22 }}
          >
            Precision Property Valuation.<br />
            <span style={{ color: '#475569' }}>Engineered for Clarity.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.12)}
            style={{ fontSize: 16, color: '#64748B', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 40px' }}
          >
            Access high-fidelity real estate data, uncompromising analytics, and institutional-grade valuation models in a single, refined interface.
          </motion.p>

          {/* Search bar */}
          <motion.div {...fadeUp(0.18)} style={{ maxWidth: 540, margin: '0 auto 48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '6px 6px 6px 18px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
              <MapPin size={16} style={{ color: '#94A3B8', flexShrink: 0, marginRight: 12 }} aria-hidden="true" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && goPredict()}
                placeholder="Enter a property address to begin..."
                aria-label="Property address"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#0F172A', background: 'transparent', minWidth: 0 }}
              />
              <button
                onClick={goPredict}
                className="sl-btn-dark"
                style={{ borderRadius: 8, padding: '10px 24px', fontSize: 15, flexShrink: 0 }}
              >
                Get Value
              </button>
            </div>
          </motion.div>

          {/* Trusted by */}
          <motion.div {...fadeUp(0.26)}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.13em', color: '#94A3B8', marginBottom: 18, textTransform: 'uppercase' }}>
              Trusted by Industry Leaders
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px 40px', flexWrap: 'wrap' }}>
              {TRUSTED.map(name => (
                <span key={name} style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', letterSpacing: '-0.01em' }}>{name}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section style={{ padding: '88px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, ease }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 14 }}>Platform Capabilities</p>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', marginBottom: 14 }}>
            Everything you need to value property right
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
            One platform combining live market data, government Jantri rates and location intelligence.
          </p>
        </motion.div>

        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-40px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}
        >
          {FEATURES.map((f, i) => <FeatureCard key={f.label} {...f} index={i} />)}
        </motion.div>
      </section>

      {/* ══════════════ STATS BAND ══════════════ */}
      <div style={{ background: '#fff', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '40px 24px' }}>
        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, textAlign: 'center' }}
        >
          {[
            { v: '50,000+', l: 'Properties Analysed' },
            { v: '94.2%',   l: 'Prediction Accuracy' },
            { v: '45+',     l: 'Cities Covered' },
            { v: '12,000+', l: 'Active Users' },
          ].map(({ v, l }) => (
            <motion.div key={l} variants={staggerChild}>
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>{v}</p>
              <p style={{ fontSize: 13, color: '#64748B' }}>{l}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════ CTA ══════════════ */}
      <section style={{ padding: '80px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease }}
          className="sl-card"
          style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(36px, 5vw, 64px) clamp(24px, 5vw, 56px)', textAlign: 'center', borderRadius: 16 }}
        >
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.035em', color: '#0F172A', marginBottom: 14 }}>
            Start your first property valuation
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Join thousands of buyers, investors and brokers making smarter decisions with data.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="sl-btn-dark" style={{ textDecoration: 'none', borderRadius: 999, padding: '12px 30px', fontSize: 15 }}>
              Create Free Account <ArrowRight size={15} />
            </Link>
            <Link to="/predict" className="sl-btn-outline" style={{ textDecoration: 'none', borderRadius: 999, padding: '12px 30px', fontSize: 15 }}>
              Try Valuation Engine
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
