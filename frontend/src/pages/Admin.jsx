import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { SECTORS } from '../ros-engine.js';

export default function Admin({ showToast }) {
  const [users, setUsers] = useState([]);
  const [company, setCompany] = useState({ name: '', sector: 'standard', description: '' });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'analyst' });
  const [saving, setSaving] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);

  const me = JSON.parse(localStorage.getItem('ros_user') || '{}');

  const load = () => {
    Promise.all([api.getUsers(), api.getCompany()])
      .then(([u, c]) => { setUsers(u); setCompany(c); })
      .catch(err => showToast(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      await api.updateCompany(company);
      showToast('Profil mis à jour ✓');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;
    setSaving(true);
    try {
      await api.createUser(form);
      setShowModal(false);
      setForm({ username: '', password: '', role: 'analyst' });
      load();
      showToast('Utilisateur créé ✓');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (id === me.id) { showToast('Vous ne pouvez pas supprimer votre propre compte'); return; }
    if (!confirm('Supprimer "' + username + '" ?')) return;
    try {
      await api.deleteUser(id);
      load();
      showToast('Utilisateur supprimé');
    } catch (err) {
      showToast(err.message);
    }
  };

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40 }}>Chargement...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Administration</div>
          <div className="page-sub">Profil de l'entreprise et gestion des accès</div>
        </div>
      </div>

      {/* Company profile */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Profil de l'entreprise</div>
        <form onSubmit={handleSaveCompany}>
          <div className="grid2" style={{ gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nom de l'entreprise</label>
              <input
                className="form-input"
                value={company.name}
                onChange={e => setCompany(c => ({ ...c, name: e.target.value }))}
                placeholder="Ex: Groupe TotalEnergies"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Secteur</label>
              <select
                className="form-select"
                value={company.sector}
                onChange={e => setCompany(c => ({ ...c, sector: e.target.value }))}
              >
                {SECTORS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              className="form-input"
              value={company.description}
              onChange={e => setCompany(c => ({ ...c, description: e.target.value }))}
              placeholder="Ex: Leader européen de l'énergie"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingCompany}>
            {savingCompany ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {/* Users */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Utilisateurs</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Ajouter</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Identifiant</th>
              <th>Rôle</th>
              <th>Créé le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>
                  {u.username}
                  {u.id === me.id && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--blue)' }}>(vous)</span>}
                </td>
                <td><span className={'badge ' + (u.role === 'admin' ? 'badge-orange' : 'badge-blue')}>{u.role}</span></td>
                <td style={{ color: 'var(--text2)', fontSize: 12 }}>
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td>
                  {u.id !== me.id && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.username)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nouvel utilisateur</div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Identifiant *</label>
                <input className="form-input" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="prenom.nom" autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input className="form-input" type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select className="form-select" value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
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
