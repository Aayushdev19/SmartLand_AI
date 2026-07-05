/**
 * SmartLand AI — PDF Report Generator
 * Uses jsPDF to produce a clean single-page valuation report.
 */
import { jsPDF } from 'jspdf';

const rupee = n => `Rs. ${Number(n).toLocaleString('en-IN')}`;
const pct   = n => `${Number(n).toFixed(1)}%`;

export function generatePDF(result, form) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W   = 210;
  const margin = 18;
  let y = 20;

  /* ── Helper fns ── */
  const line  = (text, x, cy, size = 10, style = 'normal', color = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    doc.text(String(text), x, cy);
  };
  const hline = (cy, lx = margin, rx = W - margin, col = [230, 232, 235]) => {
    doc.setDrawColor(...col);
    doc.line(lx, cy, rx, cy);
  };
  const rect  = (x, ry, w, h, fillColor) => {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, ry, w, h, 2, 2, 'F');
  };

  /* ── Header bar ── */
  rect(0, 0, W, 28, [15, 23, 42]);
  line('SmartLand AI', margin, 12, 18, 'bold', [255, 255, 255]);
  line('Property Valuation Report', margin, 21, 9, 'normal', [148, 163, 184]);
  const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  line(now, W - margin, 21, 8, 'normal', [148, 163, 184]);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(now, W - margin, 21, { align: 'right' });

  y = 36;

  /* ── Property info ── */
  line('Property Details', margin, y, 11, 'bold', [15, 23, 42]);
  y += 7;
  hline(y);
  y += 5;

  const details = [
    ['District',      form.district     || '—'],
    ['Locality',      form.locality     || form.district || '—'],
    ['Land Type',     form.land_type    || '—'],
    ['Area Category', form.area_category || '—'],
    ['Year',          form.year         || '—'],
    ['Area',          form.area_sqm ? `${form.area_sqm} sq m` : 'Not specified'],
  ];

  const col2 = 90;
  details.forEach(([k, v]) => {
    line(k, margin, y, 9, 'normal', [100, 116, 139]);
    line(v, col2, y, 9, 'bold',   [15, 23, 42]);
    y += 6;
  });

  y += 4;

  /* ── Key results ── */
  line('Valuation Results', margin, y, 11, 'bold', [15, 23, 42]);
  y += 7;
  hline(y);
  y += 6;

  // Big price
  rect(margin, y, W - margin * 2, 22, [241, 245, 249]);
  line('ESTIMATED MARKET VALUE', margin + 4, y + 6, 8, 'bold', [100, 116, 139]);
  line(`${rupee(result.predicted_price_sqm)} / sq m`, margin + 4, y + 15, 14, 'bold', [15, 23, 42]);
  if (result.total_value) {
    line(`Total: ${rupee(result.total_value)}`, W - margin - 4, y + 15, 10, 'bold', [15, 23, 42]);
    doc.text(`Total: ${rupee(result.total_value)}`, W - margin - 4, y + 15, { align: 'right' });
  }
  y += 28;

  // Score row
  const scores = [
    ['Jantri Rate',      `${rupee(result.jantri_price_sqm)}/sq m`],
    ['Market Premium',   `+${pct(result.market_premium_pct)}`],
    ['Investment Score', `${result.investment_score}/10`],
    ['Risk Level',       result.risk_level],
    ['Confidence',       `${result.confidence_score}%`],
  ];
  const boxW = (W - margin * 2) / scores.length;
  scores.forEach(([k, v], i) => {
    const bx = margin + i * boxW;
    rect(bx, y, boxW - 2, 18, [248, 250, 252]);
    line(k, bx + 2, y + 6, 7, 'normal', [100, 116, 139]);
    line(v, bx + 2, y + 13, 9, 'bold',   [15, 23, 42]);
  });
  y += 24;

  /* ── Forecast table ── */
  line('Investment Forecast', margin, y, 11, 'bold', [15, 23, 42]);
  y += 7;
  hline(y);
  y += 5;

  // Table header
  rect(margin, y, W - margin * 2, 8, [15, 23, 42]);
  const cols = ['Horizon', 'Est. Price / sq m', 'Growth'];
  const colX = [margin + 2, margin + 55, margin + 120];
  cols.forEach((h, i) => line(h, colX[i], y + 5.5, 8, 'bold', [255, 255, 255]));
  y += 10;

  Object.entries(result.forecast).forEach(([period, price], i) => {
    if (i % 2 === 0) rect(margin, y, W - margin * 2, 7, [248, 250, 252]);
    const growth = (((price - result.predicted_price_sqm) / result.predicted_price_sqm) * 100).toFixed(1);
    line(period.replace('yr', ' Year'), colX[0], y + 5, 9, 'normal', [55, 65, 81]);
    line(rupee(price),                  colX[1], y + 5, 9, 'bold',   [15, 23, 42]);
    line(`+${growth}%`,                 colX[2], y + 5, 9, 'bold',   [22, 163, 74]);
    y += 7;
  });

  y += 6;

  /* ── Model info ── */
  hline(y, margin, W - margin, [230, 232, 235]);
  y += 5;
  line(`Model: ${result.model_used}  |  R² = ${result.r2}  |  MAE = ${rupee(result.mae)}/sq m`, margin, y, 8, 'normal', [148, 163, 184]);
  y += 5;

  /* ── Footer ── */
  rect(0, 287, W, 10, [15, 23, 42]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('© 2026 SmartLand AI · This report is an AI-generated estimate, not an official government valuation.', W / 2, 293, { align: 'center' });

  /* ── Save ── */
  const filename = `SmartLand_${form.district || 'Property'}_${form.land_type || 'Report'}_${Date.now()}.pdf`;
  doc.save(filename);
}
