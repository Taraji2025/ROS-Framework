import { useState, useCallback, useEffect } from 'react';
import { api } from '../api.js';
import { computeScores, rosLevel, fmt, WEIGHTS } from '../ros-engine.js';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const DIMS = [
  { key: 'SI', label: 'Souveraineté Informationnelle', color: 'var(--dim1)', cls: 'dim-1', fill: 'fill-1',
    indicators: [
      { id: 'si1', code: 'SI-1', label: 'Taux de contrôle des données critiques', hint: '% données critiques hébergées en infrastructure souveraine · Cible: >80%', max: 100 },
      { id: 'si2', code: 'SI-2', label: 'Indice de réversibilité cloud', hint: '% services cloud avec plan de réversibilité documenté · Cible: >70%', max: 100 },
      { id: 'si3', code: 'SI-3', label: 'Dépendance fournisseurs tech étrangers', hint: '% dépenses tech vers fournisseurs étrangers critiques · Cible: <40% (inverse)', max: 100 },
      { id: 'si4', code: 'SI-4', label: 'Délai de détection des fuites (heures)', hint: 'Temps moyen entre fuite et détection · Cible: <24h (inverse)' },
      { id: 'si5', code: 'SI-5', label: 'Couverture chiffrement données sensibles', hint: '% données sensibles chiffrées · Cible: 100%', max: 100 },
      { id: 'si6', code: 'SI-Q1', label: 'Maturité politique classification info', hint: 'Score 1-5 : 1=inexistant · 3=partiel · 5=mature et testé', min: 1, max: 5, qual: true },
    ]
  },
  { key: 'SD', label: 'Souveraineté Décisionnelle', color: 'var(--dim2)', cls: 'dim-2', fill: 'fill-2',
    indicators: [
      { id: 'sd1', code: 'SD-1', label: 'Taux de décisions non contraintes', hint: '% décisions stratégiques prises sans contrainte externe · Cible: >75%', max: 100 },
      { id: 'sd2', code: 'SD-2', label: 'Diversification des options stratégiques', hint: 'Nb scénarios alternatifs documentés · Cible: >=3 (score 0-100)', max: 100 },
      { id: 'sd3', code: 'SD-3', label: "Indépendance du conseil d'administration", hint: "% administrateurs indépendants sans conflit · Cible: >60%", max: 100 },
      { id: 'sd4', code: 'SD-4', label: 'Exposition aux clauses extraterritoriales', hint: '% contrats avec clauses extraterritoriales · Cible: <20% (inverse)', max: 100 },
      { id: 'sd5', code: 'SD-5', label: 'Couverture cartographie des dépendances', hint: '% dépendances critiques formellement cartographiées · Cible: >80%', max: 100 },
      { id: 'sd6', code: 'SD-Q1', label: 'Maturité processus IE interne', hint: 'Score 1-5 : capacité de veille, analyse, anticipation stratégique', min: 1, max: 5, qual: true },
    ]
  },
  { key: 'SN', label: 'Souveraineté Normative', color: 'var(--dim3)', cls: 'dim-3', fill: 'fill-3',
    indicators: [
      { id: 'sn1', code: 'SN-1', label: 'Participation aux instances de normalisation', hint: '% comités normatifs sectoriels avec représentation active · Cible: >50%', max: 100 },
      { id: 'sn2', code: 'SN-2', label: 'Taux de normes subies vs influencées', hint: '% nouvelles normes sans influence préalable · Cible: <30% (inverse)', max: 100 },
      { id: 'sn3', code: 'SN-3', label: 'Capacité de lobbying réglementaire', hint: 'Budget dédié + taux de succès (score 0-100) · Cible: >60', max: 100 },
      { id: 'sn4', code: 'SN-4', label: 'Conformité proactive vs réactive', hint: '% exigences anticipées avant mise en vigueur · Cible: >70%', max: 100 },
      { id: 'sn5', code: 'SN-5', label: 'Exposition aux sanctions extraterritoriales', hint: 'Incidents avec amendes ou sanctions/an · Cible: 0 (score: 100-20xnb)' },
      { id: 'sn6', code: 'SN-Q1', label: 'Maturité veille réglementaire et normative', hint: 'Score 1-5 : couverture géographique, fréquence, alertes', min: 1, max: 5, qual: true },
    ]
  },
  { key: 'SO', label: 'Souveraineté Opérationnelle', color: 'var(--dim4)', cls: 'dim-4', fill: 'fill-4',
    indicators: [
      { id: 'so1', code: 'SO-1', label: 'Diversification des fournisseurs critiques', hint: '% fournisseurs critiques avec >=2 alternatives qualifiées · Cible: >70%', max: 100 },
      { id: 'so2', code: 'SO-2', label: 'Indice de résilience supply chain', hint: 'Score composite: géodiversification + stocks · Cible: >75', max: 100 },
      { id: 'so3', code: 'SO-3', label: 'MTTR des fonctions critiques (heures)', hint: 'Temps de récupération moyen testé en PCA · Cible: <4h (inverse)' },
      { id: 'so4', code: 'SO-4', label: 'Autonomie énergétique/ressources (heures)', hint: 'Capacité de fonctionnement autonome · Cible: >=72h' },
      { id: 'so5', code: 'SO-5', label: 'Localisation des actifs critiques', hint: '% actifs critiques localisés en zones souveraines · Cible: >60%', max: 100 },
      { id: 'so6', code: 'SO-Q1', label: "Maturité Plan de Continuité d'Activité", hint: "Score 1-5 : exhaustivité, fréquence tests, taux succès", min: 1, max: 5, qual: true },
    ]
  },
  { key: 'CI', label: "Capacité d'Influence", color: 'var(--dim5)', cls: 'dim-5', fill: 'fill-5',
    indicators: [
      { id: 'ci1', code: 'CI-1', label: 'Présence dans les instances de décision', hint: "% think tanks, fédérations, groupes d'influence avec siège actif · Cible: >50%", max: 100 },
      { id: 'ci2', code: 'CI-2', label: 'Couverture médiatique maîtrisée', hint: '% mentions presse/médias avec narratif favorable ou neutre · Cible: >75%', max: 100 },
      { id: 'ci3', code: 'CI-3', label: 'Capacité de contre-influence (jours)', hint: "Temps moyen de réponse à une attaque informationnelle · Cible: <3 jours (inverse)" },
      { id: 'ci4', code: 'CI-4', label: "Réseau d'alliés stratégiques activables", hint: 'Nb partenaires mobilisables en cas de crise (score 0-100) · Cible: >60', max: 100 },
      { id: 'ci5', code: 'CI-5', label: 'Ratio budget offensif IE / défensif', hint: 'Budget influence active vs défense · Cible: >25%', max: 100 },
      { id: 'ci6', code: 'CI-Q1', label: 'Maturité guerre cognitive', hint: "Score 1-5 : capacité à façonner le narratif sectoriel", min: 1, max: 5, qual: true },
    ]
  }
];

export default function Assessment({ showToast, onSaved }) {
  const defaultIndicators = Object.fromEntries(
    DIMS.flatMap(d => d.indicators.map(i => [i.id, 0]))
  );
  const [indicators, setIndicators] = useState(defaultIndicators);
  const PERIODS = (() => {
    const list = [];
    for (let y = 2024; y <= 2027; y++)
      for (let q = 1; q <= 4; q++) list.push(`T${q} ${y}`);
    return list;
  })();
  const [period, setPeriod] = useState('T1 2026');
  const [sector, setSector] = useState('standard');
  const [saving, setSaving] = useState(false);
  const [openTip, setOpenTip] = useState(null);

  const toggleTip = useCallback((id) => setOpenTip(prev => prev === id ? null : id), []);

  useEffect(() => {
    api.getCompany().then(c => { if (c.sector) setSector(c.sector); }).catch(() => {});
  }, []);

  const scores = computeScores(indicators, sector);
  const w = WEIGHTS[sector] || WEIGHTS.standard;

  const setVal = useCallback((id, val) => {
    setIndicators(prev => ({ ...prev, [id]: val }));
  }, []);

  const handleSave = async () => {
    if (scores.ros === null) { showToast('Erreur de calcul — vérifiez les valeurs saisies.'); return; }
    setSaving(true);
    try {
      await api.createAssessment({
        period,
        sector,
        scores: {
          SI: scores.SI !== null ? Math.round(scores.SI) : null,
          SD: scores.SD !== null ? Math.round(scores.SD) : null,
          SN: scores.SN !== null ? Math.round(scores.SN) : null,
          SO: scores.SO !== null ? Math.round(scores.SO) : null,
          CI: scores.CI !== null ? Math.round(scores.CI) : null,
          ros: Math.round(scores.ros)
        },
        indicators
      });
      showToast('Évaluation sauvegardée ✓');
      onSaved();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Période', 'Secteur', 'RoS', 'SI', 'SD', 'SN', 'SO', 'CI',
      ...DIMS.flatMap(d => d.indicators.map(i => i.code))];
    const vals = [
      period, sector,
      scores.ros !== null ? Math.round(scores.ros) : '',
      scores.SI !== null ? Math.round(scores.SI) : '',
      scores.SD !== null ? Math.round(scores.SD) : '',
      scores.SN !== null ? Math.round(scores.SN) : '',
      scores.SO !== null ? Math.round(scores.SO) : '',
      scores.CI !== null ? Math.round(scores.CI) : '',
      ...DIMS.flatMap(d => d.indicators.map(i => indicators[i.id] ?? ''))
    ];
    const csv = headers.join(',') + '\n' + vals.join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'RoS_' + period + '.csv';
    a.click();
  };

  const lvl = rosLevel(scores.ros);
  const radarData = {
    labels: ['Informationnelle', 'Décisionnelle', 'Normative', 'Opérationnelle', 'Influence'],
    datasets: [{
      data: [scores.SI ?? 0, scores.SD ?? 0, scores.SN ?? 0, scores.SO ?? 0, scores.CI ?? 0],
      backgroundColor: 'rgba(88,166,255,.15)',
      borderColor: 'rgba(88,166,255,.8)',
      borderWidth: 2,
      pointBackgroundColor: ['#58a6ff','#bc8cff','#f0883e','#3fb950','#f778ba'],
      pointBorderColor: '#0d1117',
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Nouvelle évaluation</div>
          <div className="page-sub">30 indicateurs — 5 dimensions</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={exportCSV}>Exporter CSV</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select className="form-select mono" style={{ width: 120 }} value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="form-select" style={{ width: 160 }} value={sector} onChange={e => setSector(e.target.value)}>
          {['standard', 'banque', 'industrie', 'tech', 'energie'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="ros-main">
          <div className="ros-label">Return on Sovereignty</div>
          <div className="ros-score" style={{ color: lvl.color }}>{scores.ros !== null ? Math.round(scores.ros) : '—'}</div>
          <div className="ros-interp" style={{ color: lvl.color }}>{lvl.label}</div>
          <div className="ros-bar">
            <div className="ros-bar-fill" style={{ width: (scores.ros ?? 0) + '%' }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Radar des 5 dimensions</div>
          <div className="chart-wrap">
            <Radar data={radarData} options={{
              responsive: true, maintainAspectRatio: false,
              scales: { r: { beginAtZero: true, max: 100,
                ticks: { stepSize: 25, color: '#484f58', backdropColor: 'transparent' },
                grid: { color: '#30363d' }, angleLines: { color: '#30363d' },
                pointLabels: { color: '#8b949e', font: { size: 11 } }
              }},
              plugins: { legend: { display: false } }
            }} />
          </div>
        </div>
      </div>

      <div className="grid5" style={{ marginBottom: 16 }}>
        {DIMS.map(d => {
          const s = scores[d.key];
          return (
            <div key={d.key} className="dim-card">
              <div className="dim-header">
                <div>
                  <div className={'dim-name ' + d.cls}>{d.key === 'CI' ? "Cap. Influence" : 'Souv. ' + d.key}</div>
                  <div className="dim-weight">Poids: {Math.round((w[d.key.toLowerCase()] || 0) * 100)}%</div>
                </div>
                <div className={'dim-score ' + d.cls}>{fmt(s)}</div>
              </div>
              <div className="dim-bar"><div className={'dim-bar-fill ' + d.fill} style={{ width: (s ?? 0) + '%' }} /></div>
            </div>
          );
        })}
      </div>

      {DIMS.map((dim) => {
        const dimScores = scores[dim.key.toLowerCase()];
        return (
          <div key={dim.key} className="card" style={{ marginBottom: 16 }}>
            <div className="ind-section-header">
              <div className="ind-section-dot" style={{ background: dim.color }} />
              <div className={'ind-section-title ' + dim.cls}>{dim.label}</div>
              <div className="ind-section-sub">Poids: {Math.round((w[dim.key.toLowerCase()] || 0) * 100)}% · 6 indicateurs</div>
            </div>
            {dim.indicators.map((ind, idx) => (
              <div key={ind.id} className="ind-row-wrap">
                <div className="ind-row">
                  <div className="ind-id">{ind.code}</div>
                  <div className="ind-label-block">
                    <div className="ind-label">{ind.label}</div>
                  </div>
                  <button
                    className={'ind-tip-btn' + (openTip === ind.id ? ' active' : '')}
                    onClick={() => toggleTip(ind.id)}
                    title="Aide sur cet indicateur"
                  >ⓘ</button>
                  <input
                    className={'ind-input' + (ind.qual ? ' qual' : '')}
                    type="number"
                    min={ind.min ?? 0}
                    max={ind.max}
                    value={indicators[ind.id] ?? 0}
                    onChange={e => setVal(ind.id, e.target.value === '' ? 0 : e.target.value)}
                  />
                  <div className={'ind-score-pill ' + dim.cls}>
                    {dimScores && dimScores[idx] !== null ? Math.round(dimScores[idx]) : '—'}
                  </div>
                </div>
                {openTip === ind.id && (
                  <div className="ind-tooltip">
                    <div className="ind-tooltip-code">{ind.code} — {ind.label}</div>
                    <div className="ind-tooltip-body">{ind.hint}</div>
                    {ind.qual && <div className="ind-tooltip-scale">
                      <span>1 — Inexistant</span><span>2 — Initial</span><span>3 — Partiel</span><span>4 — Avancé</span><span>5 — Mature</span>
                    </div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : "Sauvegarder l'évaluation"}
        </button>
        <button className="btn btn-ghost" onClick={exportCSV}>Exporter CSV</button>
      </div>
    </div>
  );
}
