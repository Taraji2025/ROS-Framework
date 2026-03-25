// RoS v3.0 — Calculation engine

export const WEIGHTS = {
  standard:  { si:.25, sd:.20, sn:.15, so:.20, ci:.20 },
  banque:    { si:.30, sd:.20, sn:.15, so:.15, ci:.20 },
  industrie: { si:.20, sd:.20, sn:.15, so:.25, ci:.20 },
  tech:      { si:.25, sd:.15, sn:.20, so:.15, ci:.25 },
  energie:   { si:.20, sd:.25, sn:.10, so:.25, ci:.20 }
};

export const SECTORS = ['standard', 'banque', 'industrie', 'tech', 'energie'];

function norm(val, target, isReverse = false) {
  if (val === '' || val === null || val === undefined || isNaN(parseFloat(val))) return null;
  const v = parseFloat(val);
  if (isReverse) {
    if (v <= 0) return 100;
    return Math.max(0, Math.min(100, (target / v) * 100));
  }
  return Math.max(0, Math.min(100, (v / target) * 100));
}

function normQual(val) {
  if (val === '' || val === null || val === undefined || isNaN(parseFloat(val))) return null;
  const v = Math.max(1, Math.min(5, parseFloat(val)));
  return (v - 1) / 4 * 100;
}

function avg(arr) {
  const valid = arr.filter(v => v !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function computeScores(ind, sector = 'standard') {
  const g = k => ind[k] ?? '';

  const si = [
    norm(g('si1'), 80),
    norm(g('si2'), 70),
    norm(g('si3'), 40, true),
    norm(g('si4'), 24, true),
    norm(g('si5'), 100),
    normQual(g('si6'))
  ];
  const sd = [
    norm(g('sd1'), 75),
    norm(g('sd2'), 100),
    norm(g('sd3'), 60),
    norm(g('sd4'), 20, true),
    norm(g('sd5'), 80),
    normQual(g('sd6'))
  ];
  const sn = [
    norm(g('sn1'), 50),
    norm(g('sn2'), 30, true),
    norm(g('sn3'), 60),
    norm(g('sn4'), 70),
    (() => { const v = parseFloat(g('sn5')); return isNaN(v) ? null : Math.max(0, 100 - v * 20); })(),
    normQual(g('sn6'))
  ];
  const so = [
    norm(g('so1'), 70),
    norm(g('so2'), 75),
    norm(g('so3'), 4, true),
    norm(g('so4'), 72),
    norm(g('so5'), 60),
    normQual(g('so6'))
  ];
  const ci = [
    norm(g('ci1'), 50),
    norm(g('ci2'), 75),
    norm(g('ci3'), 3, true),
    norm(g('ci4'), 60),
    norm(g('ci5'), 25),
    normQual(g('ci6'))
  ];

  const SI = avg(si), SD = avg(sd), SN = avg(sn), SO = avg(so), CI = avg(ci);
  const w = WEIGHTS[sector] || WEIGHTS.standard;

  let ros = null;
  const pairs = [[SI, w.si], [SD, w.sd], [SN, w.sn], [SO, w.so], [CI, w.ci]];
  const validPairs = pairs.filter(([s]) => s !== null);
  if (validPairs.length > 0) {
    const total = validPairs.reduce((acc, [s, ww]) => acc + s * ww, 0);
    const wTotal = validPairs.reduce((acc, [, ww]) => acc + ww, 0);
    ros = wTotal > 0 ? total / wTotal : null;
  }

  return { si, sd, sn, so, ci, SI, SD, SN, SO, CI, ros };
}

export function rosLevel(v) {
  if (v === null || v === undefined) return { label: 'Aucune donnée', color: 'var(--text3)', cls: '' };
  if (v < 30) return { label: '⚠ Critique', color: 'var(--red)', cls: 'badge-red' };
  if (v < 50) return { label: '↓ Faible', color: 'var(--orange)', cls: 'badge-orange' };
  if (v < 65) return { label: '~ Moyen', color: 'var(--gold-light)', cls: 'badge-yellow' };
  if (v < 80) return { label: '↑ Élevé', color: 'var(--green)', cls: 'badge-green' };
  return { label: '★ Souverain', color: 'var(--teal)', cls: 'badge-teal' };
}

export function fmt(v) {
  return v !== null && v !== undefined ? Math.round(v) : '—';
}
