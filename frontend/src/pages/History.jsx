import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { rosLevel, fmt, comparableAssessments } from '../ros-engine.js';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

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

  // Même correctif que le Dashboard (28/07) : ce graphe reliait par des courbes
  // des évaluations d'entreprises DIFFÉRENTES à des dates différentes, comme si
  // une entité avait évolué. On compare des cas ; une seule série, donc pas de
  // légende ni de palette catégorielle.
  const comparaison = comparableAssessments(sorted);
  const barData = {
    labels: comparaison.retenues.map(a => a.period),
    datasets: [{
      data: comparaison.retenues.map(a => a.scores?.ros),
      backgroundColor: '#8b949e',
      borderRadius: 4,
      barThickness: 22,
    }],
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
          {comparaison.retenues.length >= 2 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Comparaison des cas codés</div>
              <div className="page-sub" style={{ marginBottom: 12 }}>
                Score RoS par évaluation. Ce ne sont pas des points d'une trajectoire : chaque barre
                est une entreprise à une date donnée.
              </div>
              <div className="chart-wrap">
                <Bar data={barData} options={{
                  indexAxis: 'y',
                  responsive: true, maintainAspectRatio: false,
                  scales: {
                    x: { beginAtZero: true, max: 100, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
                    y: { grid: { display: false }, ticks: { color: '#8b949e' } }
                  },
                  plugins: { legend: { display: false } }
                }} />
              </div>
              {comparaison.exclues.length > 0 && (
                <div className="page-sub" style={{ marginTop: 12 }}>
                  {comparaison.exclues.length} évaluation{comparaison.exclues.length > 1 ? 's' : ''} antérieure
                  {comparaison.exclues.length > 1 ? 's' : ''} au modèle v4 ({comparaison.exclues.map(a => a.period).join(', ')})
                  {comparaison.exclues.length > 1 ? ' sont écartées' : ' est écartée'} du graphe : sans cellules
                  codées, {comparaison.exclues.length > 1 ? 'elles ne sont' : 'elle n’est'} pas recalculable
                  {comparaison.exclues.length > 1 ? 's' : ''}. {comparaison.exclues.length > 1 ? 'Elles restent' : 'Elle reste'} dans le tableau ci-dessous.
                </div>
              )}
            </div>
          )}
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Secteur</th>
                  <th>RoS</th>
                  <th>SI</th><th>SD</th><th>SN</th><th>SO</th>
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
