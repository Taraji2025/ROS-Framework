import { useState, useCallback, useEffect } from 'react';
import { api } from '../api.js';
import { computeAssessment, computeReadings, computeCompleteness, voieScores, rosLevel, fmt, SECTORS } from '../ros-engine.js';
import { VOIES, MATURITE, INFLUENCE, DIMENSIONS } from '../ros-model.js';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const DIM_META = {
  SI: { label: 'Souveraineté Informationnelle', color: 'var(--dim1)', cls: 'dim-1', fill: 'fill-1' },
  SD: { label: 'Souveraineté Décisionnelle', color: 'var(--dim2)', cls: 'dim-2', fill: 'fill-2' },
  SN: { label: 'Souveraineté Normative', color: 'var(--dim3)', cls: 'dim-3', fill: 'fill-3' },
  SO: { label: 'Souveraineté Opérationnelle', color: 'var(--dim4)', cls: 'dim-4', fill: 'fill-4' },
};

const VOIES_BY_DIM = DIMENSIONS.reduce((acc, d) => {
  acc[d] = VOIES.filter(v => v.dim === d);
  return acc;
}, {});

export default function Assessment({ showToast, onSaved }) {
  const PERIODS = (() => {
    const list = [];
    for (let y = 2024; y <= 2027; y++)
      for (let q = 1; q <= 4; q++) list.push(`T${q} ${y}`);
    return list;
  })();

  const [cells, setCells] = useState({});
  const [governance, setGovernance] = useState({ croReporting: false, vetoFormalized: false, vetoExercised: false });
  const [period, setPeriod] = useState('T1 2026');
  const [sector, setSector] = useState('standard');
  const [saving, setSaving] = useState(false);
  const [openTip, setOpenTip] = useState(null);

  const toggleTip = useCallback((id) => setOpenTip(prev => prev === id ? null : id), []);

  useEffect(() => {
    api.getCompany().then(c => { if (c.sector) setSector(c.sector); }).catch(() => {});
  }, []);

  const setCell = useCallback((id, patch) => {
    setCells(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch, date: new Date().toISOString() } }));
  }, []);

  // Step 2: calcul live
  const assess = computeAssessment({ sector, governance, cells });
  const readings = computeReadings(cells);
  const completeness = computeCompleteness(cells, sector);
  const lvl = rosLevel(assess.headline);
  const dimScore = d => assess.matrix.penalized[1].dims[d].score;
  const voieScoreMap = Object.fromEntries(voieScores(cells, sector).map(r => [r.id, r.score]));

  const handleSave = async () => {
    if (assess.headline === null) { showToast('Renseignez au moins une voie par dimension.'); return; }
    setSaving(true);
    try {
      const round = s => s !== null && s !== undefined ? Math.round(s) : null;
      await api.createAssessment({
        period, sector, cells, governance, readings,
        scores: {
          SI: round(dimScore('SI')), SD: round(dimScore('SD')),
          SN: round(dimScore('SN')), SO: round(dimScore('SO')),
          ros: round(assess.headline),
        },
      });
      showToast('Évaluation V4 sauvegardée ✓');
      onSaved();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const radarData = {
    labels: ['Informationnelle', 'Décisionnelle', 'Normative', 'Opérationnelle'],
    datasets: [{
      data: DIMENSIONS.map(d => dimScore(d) ?? 0),
      backgroundColor: 'rgba(88,166,255,.15)',
      borderColor: 'rgba(88,166,255,.8)',
      borderWidth: 2,
      pointBackgroundColor: ['#58a6ff', '#bc8cff', '#f0883e', '#3fb950'],
      pointBorderColor: '#0d1117',
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };

  const ProofRow = ({ id }) => (
    <div style={{ display: 'flex', gap: 8, marginLeft: 67, marginBottom: 10 }}>
      <input
        className="form-input"
        placeholder="Source (URL, doc, page)"
        value={cells[id]?.source ?? ''}
        onChange={e => setCell(id, { source: e.target.value })}
      />
      <input
        className="form-input"
        placeholder="Commentaire"
        value={cells[id]?.note ?? ''}
        onChange={e => setCell(id, { note: e.target.value })}
      />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Nouvelle évaluation</div>
          <div className="page-sub">11 voies — 4 dimensions · lectures Maturité/Influence hors score</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
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
          {SECTORS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="ros-main">
          <div className="ros-label">Return on Sovereignty</div>
          <div className="ros-score" style={{ color: lvl.color }}>{fmt(assess.headline)}</div>
          <div className="ros-interp" style={{ color: lvl.color }}>{lvl.label}</div>
          <div className="ros-bar">
            <div className="ros-bar-fill" style={{ width: (assess.headline ?? 0) + '%' }} />
          </div>
          {completeness.isPublishable ? (
            <div className="badge badge-teal" style={{ marginTop: 14 }}>
              Publiable — {completeness.required}/{completeness.required} voies · sourçage {Math.round(completeness.tauxSourcage * 100)}%
            </div>
          ) : (
            <div className="badge badge-orange" style={{ marginTop: 14 }}>
              Partiel — {completeness.filled}/{completeness.required} voies renseignées (non publiable)
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">Radar des 4 dimensions</div>
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

      <div className="grid4" style={{ marginBottom: 16 }}>
        {DIMENSIONS.map(d => {
          const s = dimScore(d);
          const meta = DIM_META[d];
          return (
            <div key={d} className="dim-card">
              <div className="dim-header">
                <div>
                  <div className={'dim-name ' + meta.cls}>Souv. {d}</div>
                  <div className="dim-weight">Couverture: {Math.round((assess.coverageByDim[d] ?? 0) * 100)}%</div>
                </div>
                <div className={'dim-score ' + meta.cls}>{fmt(s)}</div>
              </div>
              <div className="dim-bar"><div className={'dim-bar-fill ' + meta.fill} style={{ width: (s ?? 0) + '%' }} /></div>
            </div>
          );
        })}
      </div>

      {DIMENSIONS.map(d => {
        const meta = DIM_META[d];
        const voies = VOIES_BY_DIM[d];
        return (
          <div key={d} className="card" style={{ marginBottom: 16 }}>
            <div className="ind-section-header">
              <div className="ind-section-dot" style={{ background: meta.color }} />
              <div className={'ind-section-title ' + meta.cls}>{meta.label}</div>
              <div className="ind-section-sub">{voies.length} voie{voies.length > 1 ? 's' : ''}</div>
            </div>
            {voies.map(voie => (
              <div key={voie.id} className="ind-row-wrap">
                <div className="ind-row">
                  <div className="ind-id">{voie.code}</div>
                  <div className="ind-label-block">
                    <div className="ind-label">{voie.label}</div>
                  </div>
                  <button
                    className={'ind-tip-btn' + (openTip === voie.id ? ' active' : '')}
                    onClick={() => toggleTip(voie.id)}
                    title="Aide sur cette voie"
                  >ⓘ</button>
                  {voie.kind === 'cat' ? (
                    <select
                      className="form-select"
                      value={cells[voie.id]?.band ?? ''}
                      onChange={e => setCell(voie.id, { band: e.target.value })}
                    >
                      <option value="">—</option>
                      {voie.bands.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
                    </select>
                  ) : (
                    <input
                      className="ind-input"
                      type="number"
                      value={cells[voie.id]?.value ?? ''}
                      onChange={e => setCell(voie.id, { value: e.target.value })}
                    />
                  )}
                  <div className={'ind-score-pill ' + meta.cls}>{fmt(voieScoreMap[voie.id])}</div>
                </div>
                {openTip === voie.id && (
                  <div className="ind-tooltip">
                    <div className="ind-tooltip-code">{voie.code} — {voie.label}</div>
                    <div className="ind-tooltip-body">{voie.justification ?? 'Barème non documenté'}</div>
                    {voie.source && <div className="ind-tooltip-body" style={{ marginTop: 6, color: 'var(--text3)' }}>Source : {voie.source}</div>}
                  </div>
                )}
                <ProofRow id={voie.id} />
              </div>
            ))}
          </div>
        );
      })}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ind-section-header">
          <div className="ind-section-dot" style={{ background: 'var(--blue)' }} />
          <div className="ind-section-title">Lectures (hors score)</div>
          <div className="ind-section-sub">Maturité + Influence — ne comptent pas dans le RoS</div>
        </div>

        <div className="card-title" style={{ marginTop: 4 }}>Maturité — {fmt(readings.maturite.score)}</div>
        {MATURITE.map(ind => (
          <div key={ind.id} className="ind-row-wrap">
            <div className="ind-row">
              <div className="ind-id">{ind.code}</div>
              <div className="ind-label-block">
                <div className="ind-label">{ind.label}</div>
              </div>
              <div />
              <input
                className={'ind-input' + (ind.kind === 'qual' ? ' qual' : '')}
                type="number"
                min={ind.kind === 'qual' ? 1 : undefined}
                max={ind.kind === 'qual' ? 5 : undefined}
                value={cells[ind.id]?.value ?? ''}
                onChange={e => setCell(ind.id, { value: e.target.value })}
              />
              <div className="ind-score-pill">{cells[ind.id]?.value ?? '—'}</div>
            </div>
            <ProofRow id={ind.id} />
          </div>
        ))}

        <div className="card-title" style={{ marginTop: 20 }}>Influence — {fmt(readings.influence.score)}</div>
        {INFLUENCE.map(ind => (
          <div key={ind.id} className="ind-row-wrap">
            <div className="ind-row">
              <div className="ind-id">{ind.code}</div>
              <div className="ind-label-block">
                <div className="ind-label">{ind.label}</div>
              </div>
              <div />
              <input
                className={'ind-input' + (ind.kind === 'qual' ? ' qual' : '')}
                type="number"
                min={ind.kind === 'qual' ? 1 : undefined}
                max={ind.kind === 'qual' ? 5 : undefined}
                value={cells[ind.id]?.value ?? ''}
                onChange={e => setCell(ind.id, { value: e.target.value })}
              />
              <div className="ind-score-pill">{cells[ind.id]?.value ?? '—'}</div>
            </div>
            <ProofRow id={ind.id} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Gouvernance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={governance.croReporting}
              onChange={e => setGovernance(prev => ({ ...prev, croReporting: e.target.checked }))}
            />
            Reporting souveraineté remonté au Conseil (CRO reporting)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={governance.vetoFormalized}
              onChange={e => setGovernance(prev => ({ ...prev, vetoFormalized: e.target.checked }))}
            />
            Droit de veto souveraineté formalisé
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={governance.vetoExercised}
              onChange={e => setGovernance(prev => ({ ...prev, vetoExercised: e.target.checked }))}
            />
            Veto déjà exercé au moins une fois
          </label>
        </div>
        <div className="ind-section-sub">Coefficient de gouvernance appliqué au RoS : ×{assess.coef.toFixed(2)}</div>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : "Sauvegarder l'évaluation"}
        </button>
      </div>
    </div>
  );
}
