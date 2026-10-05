import { useState, useEffect } from 'react';
import { api } from '../api.js';
import {
  interpretScore, computeActionPlan, computeCompleteness,
  computeAssessment, fmt,
} from '../ros-engine.js';
import { VOIES, DIMENSIONS } from '../ros-model.js';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { DISCLAIMER_REPORT } from '../disclaimer.js';
import ReadingsLines from './ReadingsLines.jsx';
import { radarData as radarDataShared, radarOptions } from '../chart-theme.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const DIM_LABELS = ['Informationnelle', 'Décisionnelle', 'Normative', 'Opérationnelle'];
const VOIES_BY_CODE = Object.fromEntries(VOIES.map(v => [v.code, v]));

export default function Report({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);          // évaluations V4 (avec cells), + récent d'abord
  const [selectedId, setSelectedId] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const assessments = await api.getAssessments();
        const v4 = (assessments ?? []).filter(x => x.cells);
        setList(v4);
        if (v4.length > 0) setSelectedId(v4[0].id);
        const company = await api.getCompany().catch(() => ({}));
        setCompanyName(company?.name ?? '');
      } catch (err) {
        showToast(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40 }}>Chargement...</div>;

  if (list.length === 0) {
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

  const raw = list.find(x => x.id === selectedId) ?? list[0];
  const period = raw.period ?? '';
  const assessment = { sector: raw.sector, governance: raw.governance ?? {}, cells: raw.cells };

  const interp = interpretScore(assessment);
  const plan = computeActionPlan(assessment);
  const comp = computeCompleteness(assessment.cells, assessment.sector);
  const assess = computeAssessment(assessment);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{companyName || 'Rapport'}</div>
          <div className="page-sub">Rapport de souveraineté — {period || '—'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {list.length > 1 && (
            <select
              className="form-select no-print"
              style={{ minWidth: 200 }}
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              {list.map(a => (
                <option key={a.id} value={a.id}>{a.period || a.id}</option>
              ))}
            </select>
          )}
          <button className="btn btn-primary no-print" onClick={() => window.print()}>Imprimer / PDF</button>
        </div>
      </div>

      <div className="report-disclaimer">{DISCLAIMER_REPORT}</div>

      {/* En-tête score : morceau #1 */}
      <div className="ros-main" style={{ marginBottom: 16 }}>
        <div className="ros-label">Return on Sovereignty</div>
        <div className="ros-score" style={{ color: interp.level.color }}>{fmt(assess.headline)}</div>
        <div className="ros-interp" style={{ color: interp.level.color }}>{interp.level.label}</div>
        <div style={{ marginTop: 12, color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, position: 'relative' }}>
          {interp.verdict}
        </div>
        <ReadingsLines cells={assessment.cells} />
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
          <Radar
            data={radarDataShared(DIMENSIONS.map(d => assess.matrix.penalized[1].dims[d].score ?? 0))}
            options={radarOptions({ animate: false })}
          />
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
        <div className="aw-item" style={{ marginTop: 10, marginBottom: 4, color: 'var(--text2)' }}>
          Couverture par dimension
        </div>
        {DIMENSIONS.map((d, i) => {
          const pct = Math.round((assess.coverageByDim[d] ?? 0) * 100);
          return (
            <div key={d} className="aw-item">
              {DIM_LABELS[i]} : <span style={{ color: pct < 100 ? 'var(--orange)' : 'inherit' }}>{pct}%</span>
            </div>
          );
        })}
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
