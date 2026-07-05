export default function Logo({ size = 'md', dark = false }) {
  const textSize = size === 'lg' ? 22 : size === 'sm' ? 15 : 18;
  const color = dark ? '#fff' : '#0F172A';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none', textDecoration: 'none' }}>
      {/* Grid icon — matches the screenshot's grid icon */}
      <svg width={textSize + 2} height={textSize + 2} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="7.5" height="7.5" rx="1.5" fill={color} />
        <rect x="11.5" y="1" width="7.5" height="7.5" rx="1.5" fill={color} opacity="0.4" />
        <rect x="1" y="11.5" width="7.5" height="7.5" rx="1.5" fill={color} opacity="0.4" />
        <rect x="11.5" y="11.5" width="7.5" height="7.5" rx="1.5" fill={color} />
      </svg>
      <span style={{
        fontSize: textSize,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color,
        fontFamily: "'Inter', sans-serif",
      }}>
        SmartLand
      </span>
    </div>
  );
}
