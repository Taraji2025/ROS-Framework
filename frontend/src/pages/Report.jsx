import { useState, useEffect } from 'react';
import { api } from '../api.js';
import {
  interpretScore, computeActionPlan, computeCompleteness,
  computeReadings, computeAssessment, fmt,
} from '../ros-engine.js';
import { VOIES, DIMENSIONS } from '../ros-model.js';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const DIM_LABELS = ['Informationnelle', 'Décisionnelle', 'Normative', 'Opérationnelle'];
const VOIES_BY_CODE = Object.fromEntries(VOIES.map(v => [v.code, v]));

export default function Report({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [period, setPeriod] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    Promise.all([api.getAssessments(), api.getCompany()])
      .then(([assessments, company]) => {
        const a = (assessments ?? []).find(x => x.cells);
        if (a) {
          setAssessment({ sector: a.sector, governance: a.governance ?? {}, cells: a.cells });
          setPeriod(a.period ?? '');
        }
        setCompanyName(company?.name ?? '');
      })
      .catch(err => showToast(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40 }}>Chargement...</div>;

  if (!assessment) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">▤</div>
          <div className="empty-title">Aucune évaluation V4</div>
          <div className="empty-sub">Aucune évaluation V4 — créez-en une dans Évaluation.</div>
        </div>
      </div>
    );
  }

  const interp = interpretScore(assessment);
  const plan = computeActionPlan(assessment);
  const comp = computeCompleteness(assessment.cells, assessment.sector);
  computeReadings(assessment.cells); // lectures Maturité/Influence — hors score, non affichées ici
  const assess = computeAssessment(assessment);

  const radarData = {
    labels: DIM_LABELS,
    datasets: [{
      data: DIMENSIONS.map(d => assess.matrix.penalized[1].dims[d].score ?? 0),
      backgroundColor: 'rgba(88,166,255,.15)',
      borderColor: 'rgba(88,166,255,.8)',
      borderWidth: 2,
      pointBackgroundColor: ['#58a6ff', '#bc8cff', '#f0883e', '#3fb950'],
      pointBorderColor: '#0d1117',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{companyName || 'Rapport'}</div>
          <div className="page-sub">Rapport de souveraineté — {period || '—'}</div>
        </div>
        <button className="btn btn-primary no-print" onClick={() => window.print()}>Imprimer / PDF</button>
      </div>

      {/* En-tête score : morceau #1 */}
      <div className="ros-main" style={{ marginBottom: 16 }}>
        <div className="ros-label">Return on Sovereignty</div>
        <div className="ros-score" style={{ color: interp.level.color }}>{fmt(assess.headline)}</div>
        <div className="ros-interp" style={{ color: interp.level.color }}>{interp.level.label}</div>
        <div style={{ marginTop: 12, color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, position: 'relative' }}>
          {interp.verdict}
        </div>
      </div>

      {/* Top / flop : morceau #1 */}
      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">Forces (top 3)</div>
          {interp.top3.length === 0 && <div className="empty-sub">Aucune voie renseignée.</div>}
          {interp.top3.map(v => (
            <div key={v.code} className="strength-card" style={{ marginBottom: 8 }}>
              <div className="aw-item"><strong>{v.code}</strong> — {v.label} · {fmt(v.score)}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Faiblesses (flop 3)</div>
          {interp.flop3.length === 0 && <div className="empty-sub">Aucune voie renseignée.</div>}
          {interp.flop3.map(v => (
            <div key={v.code} className="weakness-card" style={{ marginBottom: 8 }}>
              <div className="aw-item"><strong>{v.code}</strong> — {v.label} · {fmt(v.score)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar 4 dimensions */}
      <div className="card" style={{ marginBottom: 16 }}>
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

      {/* Plan d'action : morceau #2 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Plan d'action</div>
        <table className="data-table">
          <thead>
            <tr><th>Code</th><th>Levier</th><th>Score</th><th>Écart</th></tr>
          </thead>
          <tbody>
            {plan.map(p => (
              <tr key={p.code}>
                <td>{p.code}</td>
                <td>{p.label}</td>
                <td>{fmt(p.score)}</td>
                <td>{fmt(p.gap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Complétude : morceau #4 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Complétude</div>
        <div className="aw-item" style={{ marginBottom: 8 }}>
          {comp.filled}/{comp.required} voies renseignées
        </div>
        {comp.isPublishable ? (
          <div className="badge badge-teal">Publiable</div>
        ) : (
          <div className="badge badge-orange">Partiel</div>
        )}
        <div className="aw-item" style={{ marginTop: 8 }}>
          Taux de sourçage : {Math.round(comp.tauxSourcage * 100)}%
        </div>
      </div>

      {/* Traçabilité : morceau #3 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Traçabilité</div>
        {plan.length === 0 && <div className="empty-sub">Aucune voie renseignée.</div>}
        {plan.map(p => {
          const voie = VOIES_BY_CODE[p.code];
          const cell = assessment.cells[voie.id] ?? {};
          return (
            <div key={p.code} className="ind-row-wrap" style={{ paddingBottom: 12, marginBottom: 12 }}>
              <div className="ind-id" style={{ marginBottom: 4 }}>{voie.code} — {voie.label}</div>
              <div className="aw-item">Justification du barème : {voie.justification ?? 'Barème non documenté'}</div>
              <div className="aw-item">Source du barème : {voie.source ?? '—'}</div>
              <div className="aw-item">Preuve saisie : {cell.source || '—'}{cell.note ? ` · ${cell.note}` : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
