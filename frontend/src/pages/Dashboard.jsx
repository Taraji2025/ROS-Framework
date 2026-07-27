import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { rosLevel, fmt, interpretScore, computeActionPlan, comparableAssessments } from '../ros-engine.js';
import { radarData, radarOptions } from '../chart-theme.js';
import { Radar, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

  // Comparaison entre cas — jamais une série temporelle (voir comparableAssessments).
  const comparaison = comparableAssessments([...assessments].reverse());
  const barData = {
    labels: comparaison.retenues.map(a => a.period),
    datasets: [{
      data: comparaison.retenues.map(a => a.scores?.ros),
      backgroundColor: '#8b949e',   // neutre : la barre porte une valeur, pas une identité
      borderRadius: 4,
      barThickness: 22,
    }],
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

      {/* Comparaison entre cas — remplace l'ancienne « évolution temporelle », qui
          reliait par des courbes deux entreprises différentes à deux dates
          historiques (constat du 27/07). Une seule série : pas de légende, pas de
          palette catégorielle, la couleur reste disponible pour signaler. */}
      {comparaison.retenues.length >= 2 && (
        <div className="card">
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
            /* Jamais d'exclusion muette : une barre qui manque doit s'expliquer. */
            <div className="page-sub" style={{ marginTop: 12 }}>
              {comparaison.exclues.length} évaluation{comparaison.exclues.length > 1 ? 's' : ''} antérieure
              {comparaison.exclues.length > 1 ? 's' : ''} au modèle v4 ({comparaison.exclues.map(a => a.period).join(', ')})
              {comparaison.exclues.length > 1 ? ' sont écartées' : ' est écartée'} : sans cellules codées,
              {comparaison.exclues.length > 1 ? ' elles ne sont' : ' elle n’est'} pas recalculable
              {comparaison.exclues.length > 1 ? 's' : ''} dans le référentiel actuel.
            </div>
          )}
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
