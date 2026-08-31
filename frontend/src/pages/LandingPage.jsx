import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, BarChart2, Shield, ArrowRight, FileText, Sparkles } from 'lucide-react';

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

const STATS = [
  { value: '99.91%', label: 'ML Accuracy (R² Score)' },
  { value: '45+', label: 'Gujarat Localities' },
  { value: 'Instant', label: 'Jantri Rate Comparison' },
  { value: '10-Yr', label: 'Growth Projections' },
];

const FEATURES = [
  {
    Icon: TrendingUp,
    label: 'ML Price Prediction',
    desc: 'Gradient Boosting model trained on verified Gujarat land transaction data. R² accuracy of 99.91%.',
  },
  {
    Icon: MapPin,
    label: 'Interactive Map',
    desc: 'Explore predicted prices across Vadodara localities with real-time Jantri rate overlays.',
  },
  {
    Icon: BarChart2,
    label: 'Market Analytics',
    desc: 'Year-over-year price trends, land type breakdowns, and district-level comparisons.',
  },
  {
    Icon: Shield,
    label: 'Risk Assessment',
    desc: 'Investment score and risk rating derived from market premium over government Jantri rates.',
  },
  {
    Icon: FileText,
    label: 'Jantri Comparison',
    desc: 'Instantly compare official Gujarat government guideline rates against predicted market prices.',
  },
  {
    Icon: ArrowRight,
    label: 'Investment Forecast',
    desc: '1, 3, 5 and 10-year compound growth projections with downloadable PDF valuation reports.',
  },
];

const FeatureCard = memo(function FeatureCard({ Icon, label, desc }) {
  return (
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
  );
});

export default function LandingPage() {
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const goPredict = () => {
    navigate('/predict', address.trim() ? { state: { location: address.trim() } } : undefined);
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
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Gujarat Land Valuation Engine · Powered by ML</span>
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
            Real estate intelligence for Gujarat — official Jantri rate comparison, ML-powered market price predictions, and investment forecasting in one platform.
          </motion.p>

          <motion.div {...fadeUp(0.18)} style={{ maxWidth: 560, margin: '0 auto 32px' }}>
            <div className="sl-hero-search" style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '6px 6px 6px 18px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
              <MapPin size={16} style={{ color: '#94A3B8', flexShrink: 0, marginRight: 12 }} aria-hidden="true" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && goPredict()}
                placeholder="Enter a Vadodara locality or district..."
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

          <motion.div
            {...fadeUp(0.24)}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, maxWidth: 720, margin: '0 auto' }}
          >
            {STATS.map(s => (
              <div key={s.label} className="sl-card" style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: 2 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section style={{ padding: '88px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#64748B', textTransform: 'uppercase', marginBottom: 12 }}>
            Platform Capabilities
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A' }}>
            Everything you need for property intelligence
          </h2>
        </div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-48px' }}
          transition={{ staggerChildren: 0.07 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}
        >
          {FEATURES.map(f => (
            <FeatureCard key={f.label} {...f} />
          ))}
        </motion.div>
      </section>

      <section style={{ background: '#0F172A', padding: '64px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: 12 }}>
            Start your free valuation
          </h2>
          <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.7, marginBottom: 28 }}>
            No account required. Select a district, enter the Jantri rate, and get an instant ML-powered market price estimate for any land parcel in Gujarat.
          </p>
          <button
            onClick={() => navigate('/predict')}
            className="sl-btn-dark"
            style={{ background: '#fff', color: '#0F172A', borderRadius: 8, padding: '12px 32px', fontSize: 15 }}
          >
            Open Valuation Engine <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
