import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { rosLevel, fmt } from '../ros-engine.js';
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

  // Trend: 10 dernières évaluations (ordre chronologique pour le graphe)
  const trendData = [...assessments].reverse().slice(-10);
  const radarData = {
    labels: ['Informationnelle', 'Décisionnelle', 'Normative', 'Opérationnelle', 'Influence'],
    datasets: [{
      data: last ? [last.scores?.SI ?? 0, last.scores?.SD ?? 0, last.scores?.SN ?? 0, last.scores?.SO ?? 0, last.scores?.CI ?? 0] : [0,0,0,0,0],
      backgroundColor: 'rgba(88,166,255,.15)',
      borderColor: 'rgba(88,166,255,.8)',
      borderWidth: 2,
      pointBackgroundColor: ['#58a6ff','#bc8cff','#f0883e','#3fb950','#f778ba'],
      pointBorderColor: '#0d1117',
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };

  const lineData = {
    labels: trendData.map(a => a.period),
    datasets: [
      { label: 'RoS', data: trendData.map(a => a.scores?.ros), borderColor: '#f0c040', backgroundColor: 'rgba(240,192,64,.1)', borderWidth: 3, tension: .3 },
      { label: 'SI',  data: trendData.map(a => a.scores?.SI),  borderColor: '#58a6ff', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SD',  data: trendData.map(a => a.scores?.SD),  borderColor: '#bc8cff', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SN',  data: trendData.map(a => a.scores?.SN),  borderColor: '#f0883e', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SO',  data: trendData.map(a => a.scores?.SO),  borderColor: '#3fb950', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'CI',  data: trendData.map(a => a.scores?.CI),  borderColor: '#f778ba', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
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
        <div className="ros-main">
          <div className="ros-label">Return on Sovereignty</div>
          <div className="ros-score" style={{ color: lvl.color }}>
            {last ? Math.round(last.scores?.ros) : '—'}
          </div>
          <div className="ros-interp" style={{ color: lvl.color }}>{lvl.label}</div>
          <div className="ros-bar">
            <div className="ros-bar-fill" style={{ width: `${last?.scores?.ros ?? 0}%` }} />
          </div>
          {last && (
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[['SI', last.scores?.SI, 'dim-1'], ['SD', last.scores?.SD, 'dim-2'], ['SN', last.scores?.SN, 'dim-3'],
                ['SO', last.scores?.SO, 'dim-4'], ['CI', last.scores?.CI, 'dim-5']].map(([k, v, cls]) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div className={`${cls}`} style={{ fontFamily: 'Space Mono', fontSize: 18, fontWeight: 700 }}>{fmt(v)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
          )}
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
