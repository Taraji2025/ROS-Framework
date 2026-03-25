import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { rosLevel, fmt } from '../ros-engine.js';
import { SECTORS } from '../ros-engine.js';

export default function Companies({ onAssess, onHistory, showToast }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sector: 'standard', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.getCompanies()
      .then(setCompanies)
      .catch(err => showToast(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.createCompany(form);
      setShowModal(false);
      setForm({ name: '', sector: 'standard', description: '' });
      load();
      showToast('Entreprise créée ✓');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer "${name}" et toutes ses évaluations ?`)) return;
    try {
      await api.deleteCompany(id);
      load();
      showToast('Entreprise supprimée');
    } catch (err) {
      showToast(err.message);
    }
  };

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40 }}>Chargement...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Entreprises</div>
          <div className="page-sub">Gérez les entités auditées et leurs évaluations</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nouvelle entreprise</button>
      </div>

      {companies.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <div className="empty-title">Aucune entreprise</div>
            <div className="empty-sub">Créez votre première entreprise pour commencer une évaluation RoS</div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}>
              + Créer une entreprise
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Secteur</th>
                <th>Évaluations</th>
                <th>Dernier RoS</th>
                <th>Dernière période</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => {
                const ros = c.lastAssessment?.scores?.ros;
                const lvl = rosLevel(ros);
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      {c.description && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{c.description}</div>}
                    </td>
                    <td><span className="badge badge-blue">{c.sector}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{c.assessmentCount}</td>
                    <td>
                      {ros != null
                        ? <span style={{ fontFamily: 'Space Mono', fontWeight: 700, color: lvl.color }}>{Math.round(ros)}</span>
                        : <span style={{ color: 'var(--text3)' }}>—</span>
                      }
                    </td>
                    <td style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text2)' }}>
                      {c.lastAssessment?.period || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => onAssess(c)}>Évaluer</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => onHistory(c)}>Historique</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nouvelle entreprise</div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nom de l'entreprise *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Groupe TotalEnergies"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Secteur</label>
                <select
                  className="form-select"
                  value={form.sector}
                  onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                >
                  {SECTORS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optionnel)</label>
                <input
                  className="form-input"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Leader européen de l'énergie"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
