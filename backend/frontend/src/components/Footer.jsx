import { Link } from 'react-router-dom';
import Logo from './Logo';

const LINKS = ['Privacy Policy', 'Terms of Service', 'Contact'];

export default function Footer() {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #E2E8F0', padding: '20px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Logo size="sm" />

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {LINKS.map(item => (
            <Link
              key={item}
              to="/"
              style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'none', transition: 'color 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#374151'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
            >
              {item}
            </Link>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#94A3B8' }}>
          © {new Date().getFullYear()} SmartLand AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
