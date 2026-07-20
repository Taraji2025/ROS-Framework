import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { rosLevel, fmt, interpretScore, computeActionPlan } from '../ros-engine.js';
import { radarData, radarOptions } from '../chart-theme.js';
import { Radar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend, CategoryScale, LinearScale
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale);

export default function Dashboard({ showToast, onEvaluate }) {
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getAssessments()])
      .then(([s, a]) => { setStats(s); setAssessments(a); })
      .catch(err => showToast(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40 }}>Chargement...</div>;

  const last = assessments[0] || null;
  const lvl = rosLevel(last?.scores?.ros ?? null);
  const assessment = last ? { sector: last.sector, governance: last.governance ?? {}, cells: last.cells ?? {} } : null;
  const interp = assessment ? interpretScore(assessment) : null;
  const plan = assessment ? computeActionPlan(assessment).slice(0, 3) : [];
  const dims = [
    ['SI', 'Informationnelle', last?.scores?.SI, 'dim-1'],
    ['SD', 'Décisionnelle',    last?.scores?.SD, 'dim-2'],
    ['SN', 'Normative',        last?.scores?.SN, 'dim-3'],
    ['SO', 'Opérationnelle',   last?.scores?.SO, 'dim-4'],
  ];

  // Trend: 10 dernières évaluations (ordre chronologique pour le graphe)
  const trendData = [...assessments].reverse().slice(-10);

  const lineData = {
    labels: trendData.map(a => a.period),
    datasets: [
      { label: 'RoS', data: trendData.map(a => a.scores?.ros), borderColor: '#f0c040', backgroundColor: 'rgba(240,192,64,.1)', borderWidth: 3, tension: .3 },
      { label: 'SI',  data: trendData.map(a => a.scores?.SI),  borderColor: '#58a6ff', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SD',  data: trendData.map(a => a.scores?.SD),  borderColor: '#bc8cff', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SN',  data: trendData.map(a => a.scores?.SN),  borderColor: '#f0883e', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SO',  data: trendData.map(a => a.scores?.SO),  borderColor: '#3fb950', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
    ]
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{stats?.company?.name || 'Dashboard'}</div>
          <div className="page-sub">Return on Sovereignty — Vue synthétique</div>
        </div>
        <button className="btn btn-primary" onClick={onEvaluate}>+ Nouvelle évaluation</button>
      </div>

      {/* Stats */}
      <div className="grid4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: lvl.color }}>
            {last ? Math.round(last.scores?.ros) : '—'}
          </div>
          <div className="stat-label">Dernier RoS · {last?.period || '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{stats?.assessments ?? 0}</div>
          <div className="stat-label">Évaluations totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{stats?.users ?? 0}</div>
          <div className="stat-label">Utilisateurs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text2)', fontSize: 20, paddingTop: 6 }}>
            {stats?.company?.sector || '—'}
          </div>
          <div className="stat-label">Secteur</div>
        </div>
      </div>

      {/* RoS + Radar */}
      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="card hero-card" style={{ position: 'relative' }}>
          <div className="accent-bar" />
          <div className="label">Score RoS global</div>
          <div className="stat-num">{last ? Math.round(last.scores?.ros) : '—'}<small>/100</small></div>
          {last && (
            <span className="chip-level" style={{ color: lvl.color, marginTop: 12 }}>{lvl.label}</span>
          )}
          {interp?.verdict && <div className="hero-verdict">{interp.verdict}</div>}
          {!last && <div className="empty-hint">Aucune évaluation — lance une évaluation pour voir le score.</div>}
        </div>
        <div className="card">
          <div className="card-title">Radar des 4 dimensions</div>
          <div className="chart-wrap">
            <Radar
              data={radarData([last?.scores?.SI ?? 0, last?.scores?.SD ?? 0, last?.scores?.SN ?? 0, last?.scores?.SO ?? 0])}
              options={radarOptions({ animate: true })}
            />
          </div>
        </div>
      </div>

      <div className="dim-row">
        {dims.map(([k, labelTxt, v, cls]) => (
          <div className="card dim-card" key={k}>
            <div className="label">{k} · {labelTxt}</div>
            <div className={`dim-val ${cls}`}>{v != null ? Math.round(v) : '—'}</div>
            <div className="track"><i className={`fill-${cls.slice(-1)}`} style={{ width: `${v ?? 0}%` }} /></div>
          </div>
        ))}
      </div>

      {plan.length > 0 && (
        <div className="card action-card">
          <div className="label">Plan d'action prioritaire — écart au max</div>
          {plan.map((p, i) => (
            <div className="action-row" key={p.code}>
              <span className="action-rank">{i + 1}</span>
              <span className="action-txt">{p.code} · {p.label}</span>
              <span className="action-gap">+{Math.round(p.gap)} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Trend */}
      {trendData.length >= 2 && (
        <div className="card">
          <div className="card-title">Évolution temporelle</div>
          <div className="chart-wrap">
            <Line data={lineData} options={{
              responsive: true, maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, max: 100, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
                x: { grid: { color: '#30363d' }, ticks: { color: '#8b949e' } }
              },
              plugins: { legend: { position: 'top', labels: { color: '#8b949e', boxWidth: 12, padding: 15 } } }
            }} />
          </div>
        </div>
      )}

      {assessments.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <div className="empty-title">Aucune évaluation</div>
            <div className="empty-sub">Saisissez les 30 indicateurs pour obtenir votre premier score RoS</div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onEvaluate}>
              Commencer l'évaluation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
