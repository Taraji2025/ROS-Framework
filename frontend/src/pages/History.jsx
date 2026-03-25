import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { rosLevel, fmt } from '../ros-engine.js';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function History({ showToast }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.getAssessments()
      .then(setAssessments)
      .catch(err => showToast(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette évaluation ?')) return;
    try {
      await api.deleteAssessment(id);
      load();
      showToast('Évaluation supprimée');
    } catch (err) {
      showToast(err.message);
    }
  };

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40 }}>Chargement...</div>;

  const sorted = [...assessments].reverse();

  const lineData = {
    labels: sorted.map(a => a.period),
    datasets: [
      { label: 'RoS', data: sorted.map(a => a.scores?.ros), borderColor: '#f0c040', backgroundColor: 'rgba(240,192,64,.1)', borderWidth: 3, tension: .3 },
      { label: 'SI',  data: sorted.map(a => a.scores?.SI),  borderColor: '#58a6ff', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SD',  data: sorted.map(a => a.scores?.SD),  borderColor: '#bc8cff', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SN',  data: sorted.map(a => a.scores?.SN),  borderColor: '#f0883e', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'SO',  data: sorted.map(a => a.scores?.SO),  borderColor: '#3fb950', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
      { label: 'CI',  data: sorted.map(a => a.scores?.CI),  borderColor: '#f778ba', borderWidth: 1.5, tension: .3, borderDash: [4,2] },
    ]
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Historique</div>
          <div className="page-sub">Suivi longitudinal du Return on Sovereignty</div>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <div className="empty-title">Aucune évaluation</div>
            <div className="empty-sub">Saisissez les indicateurs pour créer la première évaluation</div>
          </div>
        </div>
      ) : (
        <>
          {sorted.length >= 2 && (
            <div className="card" style={{ marginBottom: 16 }}>
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
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Secteur</th>
                  <th>RoS</th>
                  <th>SI</th><th>SD</th><th>SN</th><th>SO</th><th>CI</th>
                  <th>Niveau</th>
                  <th>Par</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(a => {
                  const lvl = rosLevel(a.scores?.ros);
                  return (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'Space Mono', fontSize: 12 }}>{a.period}</td>
                      <td style={{ color: 'var(--text2)' }}>{a.sector}</td>
                      <td style={{ fontFamily: 'Space Mono', fontWeight: 700, color: lvl.color }}>{fmt(a.scores?.ros)}</td>
                      <td style={{ color: 'var(--dim1)' }}>{fmt(a.scores?.SI)}</td>
                      <td style={{ color: 'var(--dim2)' }}>{fmt(a.scores?.SD)}</td>
                      <td style={{ color: 'var(--dim3)' }}>{fmt(a.scores?.SN)}</td>
                      <td style={{ color: 'var(--dim4)' }}>{fmt(a.scores?.SO)}</td>
                      <td style={{ color: 'var(--dim5)' }}>{fmt(a.scores?.CI)}</td>
                      <td><span className={'badge ' + lvl.cls}>{lvl.label}</span></td>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>{a.createdBy || '—'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
