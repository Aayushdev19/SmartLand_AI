import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, BarChart2, Shield, ArrowRight, FileText, Sparkles, CheckCircle } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease },
});

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

const TRUSTED = ['Apex Partners', 'Global REIT', 'Prime Estates', 'Vanguard Build'];

const STATS = [
  { value: '99.91%', label: 'ML Accuracy (R² Score)' },
  { value: '45+', label: 'Gujarat Localities' },
  { value: 'Instant', label: 'Jantri Rate Comparison' },
  { value: '10-Yr', label: 'Growth Projections' },
];

const FEATURES = [
  { Icon: TrendingUp, label: 'Market Valuation', desc: 'Data-backed estimates from thousands of verified property transactions across Gujarat.' },
  { Icon: MapPin, label: 'Location Intelligence', desc: 'GIS overlays: Jantri zones, flood risk, town planning and infrastructure layers.' },
  { Icon: BarChart2, label: 'Market Analytics', desc: 'Live trend charts, heatmaps and area rankings across 45+ cities.' },
  { Icon: Shield, label: 'Risk Assessment', desc: 'Flood, legal and market-volatility scores to protect every investment.' },
  { Icon: FileText, label: 'Jantri Comparison', desc: 'Instantly compare government guideline rates with real market prices.' },
  { Icon: ArrowRight, label: 'Investment Forecast', desc: '1, 3, 5 and 10-year projections with ROI calculator and risk scoring.' },
];

const FeatureCard = memo(({ Icon, label, desc }) => (
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
    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65 }}>{desc}</p>
  </motion.div>
));

export default function LandingPage() {
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const goPredict = () => {
    if (address.trim()) {
      navigate('/predict', { state: { location: address.trim() } });
    } else {
      navigate('/predict');
    }
  };

  return (
    <div style={{ background: '#F0F2F5' }}>
      <section style={{ minHeight: 'calc(100vh - 56px)', paddingTop: 56, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1800&q=60')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            filter: 'grayscale(25%)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(180deg, rgba(240,242,245,0.88) 0%, rgba(240,242,245,0.78) 40%, rgba(240,242,245,0.96) 80%, #F0F2F5 100%)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            backgroundImage: `linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '40px 24px 60px', maxWidth: 840, width: '100%' }}>
          <motion.div {...fadeUp(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 99, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Sparkles size={13} style={{ color: '#16A34A' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>SmartLand-AI v2.0 Engine Live</span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.06)}
            style={{ fontSize: 'clamp(36px, 5.5vw, 62px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', lineHeight: 1.1, marginBottom: 22 }}
          >
            Precision Property Valuation.<br />
            <span style={{ color: '#475569' }}>Engineered for Clarity.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.12)}
            style={{ fontSize: 16, color: '#64748B', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 36px' }}
          >
            Access high-fidelity real estate data, official Gujarat Jantri comparison, and institutional-grade valuation models in a single refined interface.
          </motion.p>

          <motion.div {...fadeUp(0.18)} style={{ maxWidth: 560, margin: '0 auto 32px' }}>
            <div className="sl-hero-search" style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '6px 6px 6px 18px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
              <MapPin size={16} style={{ color: '#94A3B8', flexShrink: 0, marginRight: 12 }} aria-hidden="true" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && goPredict()}
                placeholder="Enter Vadodara locality or district..."
                aria-label="Property address"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#0F172A', background: 'transparent', minWidth: 0 }}
              />
              <button
                onClick={goPredict}
                className="sl-btn-dark"
                style={{ borderRadius: 8, padding: '10px 24px', fontSize: 15, flexShrink: 0 }}
              >
                Run Valuation <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.24)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, maxWidth: 720, margin: '0 auto 40px' }}>
            {STATS.map(s => (
              <div key={s.label} className="sl-card" style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: 2 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div {...fadeUp(0.3)}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.13em', color: '#94A3B8', marginBottom: 16, textTransform: 'uppercase' }}>
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

      <section style={{ padding: '88px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#64748B', textTransform: 'uppercase', marginBottom: 12 }}>
            Capabilities
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A' }}>
            Built for institutional rigour
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.label} {...f} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
