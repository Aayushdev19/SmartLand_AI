import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Navigation, Plus,
  LayoutDashboard, BookOpen, Map, BarChart2, Settings,
  ChevronDown, X, Loader2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getLocalitiesGeo } from '../api/client';

/* ── Leaflet icon fix ─────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── Price bubble icon ────────────────────────── */
const priceBubble = (price, isSelected) =>
  L.divIcon({
    html: `<div style="
      background:${isSelected ? '#0F172A' : '#fff'};
      color:${isSelected ? '#fff' : '#0F172A'};
      border:1.5px solid ${isSelected ? '#0F172A' : '#CBD5E1'};
      border-radius:8px;
      padding:4px 10px;
      font-size:12px;
      font-weight:700;
      white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,0.12);
      font-family:'Inter',sans-serif;
      letter-spacing:-0.02em;
      cursor:pointer;
    ">${price}</div>`,
    iconSize: [null, null],
    iconAnchor: [0, 0],
    className: '',
  });

/* ── Map click handler ────────────────────────── */
function ClickPin({ onPin }) {
  useMapEvents({ click: e => onPin(e.latlng) });
  return null;
}

/* ── Recenter button (inside MapContainer) ────── */
function RecenterBtn({ center }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(center, 13, { animate: true })}
      style={{ position: 'absolute', bottom: 80, right: 12, zIndex: 1000, width: 40, height: 40, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      aria-label="Recenter map"
    >
      <Navigation size={16} style={{ color: '#374151' }} />
    </button>
  );
}

const sidebarNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard', icon: BookOpen,        label: 'Portfolio' },
  { to: '/map',       icon: Map,             label: 'Map'       },
  { to: '/analytics', icon: BarChart2,       label: 'Reports'   },
  { to: '/profile',   icon: Settings,        label: 'Settings'  },
];

const FILTERS   = ['All', 'Residential', 'Commercial'];
const MAP_CENTER = [22.3119, 73.1723]; // Vadodara

const fmtPrice = n => `₹${(n / 1000).toFixed(0)}k`;

export default function MapPage() {
  const { user }                    = useAuth();
  const [localities, setLocalities] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [search,  setSearch]        = useState('');
  const [filter,  setFilter]        = useState('All');
  const [typeOpen, setTypeOpen]     = useState(false);
  const [pin,     setPin]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const fetchedRef = useRef(false);  // prevent double-fetch in React StrictMode

  /* Fetch geo data ONCE on mount */
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    getLocalitiesGeo()
      .then(data => setLocalities(data.localities || []))
      .catch(() => setLocalities([]))
      .finally(() => setLoadingGeo(false));
  }, []);

  /* Filtered list */
  const filtered = localities.filter(p =>
    (filter === 'All' || p.land_type === filter) &&
    (search === '' || p.locality.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: 56 }}>

      {/* ── Left sidebar ── */}
      <aside style={{ width: 200, background: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        {/* User */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'G'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Guest'}
              </p>
              <p style={{ fontSize: 11, color: '#94A3B8' }}>Vadodara Map</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {sidebarNav.map(item => (
            <Link
              key={item.label}
              to={item.to}
              className={`sl-nav-item ${item.label === 'Map' ? 'active' : ''}`}
              style={{ marginBottom: 2 }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Locality list */}
        <div style={{ padding: '0 10px 16px', flex: '0 0 auto', maxHeight: 240, overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, padding: '0 2px' }}>
            {loadingGeo ? 'Loading…' : `${filtered.length} localities`}
          </p>
          {loadingGeo
            ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 28, borderRadius: 6, marginBottom: 4 }} />)
            : filtered.map(p => (
              <button
                key={p.locality}
                onClick={() => setSelected(p)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '6px 8px', borderRadius: 6, border: 'none',
                  background: selected?.locality === p.locality ? '#F1F5F9' : 'transparent',
                  cursor: 'pointer', marginBottom: 2, transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (selected?.locality !== p.locality) e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => { if (selected?.locality !== p.locality) e.currentTarget.style.background = 'transparent'; }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: selected?.locality === p.locality ? '#0F172A' : '#374151' }}>{p.locality}</p>
                <p style={{ fontSize: 11, color: '#94A3B8' }}>₹{p.predicted_price_sqm.toLocaleString('en-IN')}/sq m</p>
              </button>
            ))
          }
        </div>

        <div style={{ padding: '0 10px 16px' }}>
          <Link to="/predict" className="sl-btn-dark"
            style={{ width: '100%', justifyContent: 'center', borderRadius: 8, padding: '10px', textDecoration: 'none', fontSize: 13 }}>
            <Plus size={14} /> Add Property
          </Link>
        </div>
      </aside>

      {/* ── Map area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* Filter bar */}
        <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10, zIndex: 5, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 12px', flex: '1 1 260px', maxWidth: 360 }}>
            <Search size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search locality…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#0F172A' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Type filter */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setTypeOpen(!typeOpen)} className="sl-btn-outline" style={{ fontSize: 13, padding: '7px 12px', gap: 5 }}>
              {filter} <ChevronDown size={12} style={{ color: '#94A3B8', transform: typeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            <AnimatePresence>
              {typeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                  style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 150, padding: 4 }}
                >
                  {FILTERS.map(f => (
                    <button key={f} onClick={() => { setFilter(f); setTypeOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', fontSize: 13, background: filter === f ? '#F1F5F9' : 'transparent', color: filter === f ? '#0F172A' : '#374151', fontWeight: filter === f ? 600 : 400, border: 'none', cursor: 'pointer', borderRadius: 7 }}>
                      {f}
                      {filter === f && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F172A' }} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="sl-btn-outline" style={{ fontSize: 13, padding: '7px 12px', gap: 5 }}>
            <SlidersHorizontal size={13} /> Filters
          </button>

          {loadingGeo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
              <Loader2 size={13} className="spin" /> Loading map data…
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer center={MAP_CENTER} zoom={12} style={{ width: '100%', height: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="© CartoDB" />
            <ClickPin onPin={p => { setPin(p); setSelected(null); }} />
            <RecenterBtn center={MAP_CENTER} />

            {/* Custom zoom controls */}
            <div style={{ position: 'absolute', right: 12, bottom: 130, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['+', '−'].map(s => (
                <button key={s} style={{ width: 40, height: 40, background: '#fff', border: '1px solid #E2E8F0', borderRadius: s === '+' ? '8px 8px 0 0' : '0 0 8px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, fontWeight: 300, color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Real locality markers */}
            {filtered.map(p => (
              <Marker
                key={p.locality}
                position={[p.lat, p.lng]}
                icon={priceBubble(fmtPrice(p.predicted_price_sqm), selected?.locality === p.locality)}
                eventHandlers={{ click: () => setSelected(p) }}
              >
                <Popup>
                  <div style={{ padding: '14px 16px', minWidth: 210 }}>
                    <p style={{ fontWeight: 700, color: '#0F172A', marginBottom: 3, fontSize: 14 }}>{p.locality}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>{p.district} · {p.land_type}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: '#64748B' }}>Market Price</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>₹{p.predicted_price_sqm.toLocaleString('en-IN')}/sq m</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: '#64748B' }}>Jantri Rate</span>
                      <span style={{ fontSize: 13, color: '#64748B' }}>₹{p.jantri_rate.toLocaleString('en-IN')}/sq m</span>
                    </div>
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                      <Link
                        to="/predict"
                        state={{ location: p.locality }}
                        style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', textDecoration: 'none' }}
                      >
                        Get full valuation →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Dropped pin */}
            {pin && (
              <Marker position={pin} icon={priceBubble('📍 Pin', false)}>
                <Popup>
                  <div style={{ padding: '10px 14px', fontSize: 12 }}>
                    <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Dropped Pin</p>
                    <p style={{ color: '#64748B' }}>Lat: {pin.lat.toFixed(5)}</p>
                    <p style={{ color: '#64748B' }}>Lng: {pin.lng.toFixed(5)}</p>
                    <Link to="/predict" style={{ display: 'block', marginTop: 8, fontSize: 12, fontWeight: 600, color: '#0F172A', textDecoration: 'none' }}>
                      Predict this location →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Property detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.22 }}
                style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000, width: 280, background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{selected.locality}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{selected.district} · {selected.land_type}</p>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 6 }}>
                    ₹{selected.predicted_price_sqm.toLocaleString('en-IN')}
                    <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 400 }}>/sq m</span>
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Jantri Rate</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>₹{selected.jantri_rate.toLocaleString('en-IN')}/sq m</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Premium</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>
                        +{(((selected.predicted_price_sqm - selected.jantri_rate) / selected.jantri_rate) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/predict"
                    state={{ location: selected.locality }}
                    className="sl-btn-dark"
                    style={{ width: '100%', justifyContent: 'center', borderRadius: 8, padding: '9px', fontSize: 13, textDecoration: 'none' }}
                  >
                    Full Valuation →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
