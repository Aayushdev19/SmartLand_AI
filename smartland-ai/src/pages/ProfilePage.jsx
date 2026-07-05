import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, LogOut, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ease = [0.22, 1, 0.36, 1];

const FIELDS = [
  { name: 'name',  label: 'Full Name',      Icon: User,    type: 'text'  },
  { name: 'email', label: 'Email Address',   Icon: Mail,    type: 'email' },
  { name: 'phone', label: 'Phone Number',    Icon: Phone,   type: 'tel'   },
  { name: 'city',  label: 'City',            Icon: MapPin,  type: 'text'  },
];

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city:  'Ahmedabad, Gujarat',
  });
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!isLoggedIn) navigate('/login'); }, [isLoggedIn]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!isLoggedIn) return null;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: '#F0F2F5' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 64px' }}>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 28 }}>
            Profile
          </h1>

          {/* Avatar card */}
          <div className="sl-card" style={{ padding: '24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{user?.name}</p>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>{user?.email}</p>
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#0F172A', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 999, padding: '2px 10px' }}>
                Free Plan
              </span>
            </div>
          </div>

          {/* Edit form */}
          <div className="sl-card" style={{ padding: '24px', marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 20 }}>Personal Information</p>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {FIELDS.map(({ name, label, Icon, type }) => (
                  <div key={name}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                      {label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Icon size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} aria-hidden="true" />
                      <input
                        type={type}
                        name={name}
                        value={form[name]}
                        onChange={handle}
                        className="sl-input"
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.97 }}
                className="sl-btn-dark"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px',
                  borderRadius: 8,
                  background: saved ? '#16A34A' : '#0F172A',
                  transition: 'background 0.25s ease',
                }}
              >
                {saving ? (
                  <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                ) : saved ? (
                  <><Check size={15} strokeWidth={2.5} /> Saved</>
                ) : 'Save Changes'}
              </motion.button>
            </form>
          </div>

          {/* Account */}
          <div className="sl-card" style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 14 }}>Account</p>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="sl-btn-outline"
              style={{ borderColor: '#FECACA', color: '#DC2626' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
