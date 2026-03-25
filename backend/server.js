const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.ROS_PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'ros-secret-change-in-prod';

// En mode Electron, les données sont dans le dossier utilisateur
const DATA_DIR = process.env.ROS_DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json());

// Servir le frontend en mode Electron (pas de Nginx)
const frontendDist = process.env.ROS_FRONTEND_DIST;
if (frontendDist && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*$/, (_, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

// ── Storage helpers ──────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DATA_FILE)) return { users: [], company: {}, assessments: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function backupDB() {
  if (!fs.existsSync(DATA_FILE)) return;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const bakFile = DATA_FILE + '.bak.' + today;
  if (!fs.existsSync(bakFile)) {
    fs.copyFileSync(DATA_FILE, bakFile);
    console.log('DB backup created:', path.basename(bakFile));
    // Garder seulement les 30 derniers backups
    const dir = path.dirname(DATA_FILE);
    const baks = fs.readdirSync(dir)
      .filter(f => f.startsWith('storage.json.bak.'))
      .sort();
    if (baks.length > 30) {
      baks.slice(0, baks.length - 30).forEach(f => {
        fs.unlinkSync(path.join(dir, f));
        console.log('Old backup removed:', f);
      });
    }
  }
}

function initDB() {
  if (!fs.existsSync(DATA_FILE)) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    writeDB({
      users: [{ id: uuidv4(), username: 'admin', password: adminHash, role: 'admin', createdAt: Date.now() }],
      company: { name: '', sector: 'standard', description: '' },
      assessments: []
    });
    console.log('DB initialized — admin / admin123');
  } else {
    backupDB();
  }
}

// ── Auth middleware ──────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// ── Auth routes ──────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Identifiants incorrects' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.post('/api/auth/change-password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password))
    return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
  user.password = bcrypt.hashSync(newPassword, 10);
  writeDB(db);
  res.json({ ok: true });
});

// ── Users routes (admin) ─────────────────────────────────────
app.get('/api/users', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  const db = readDB();
  res.json(db.users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt })));
});

app.post('/api/users', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  const { username, password, role = 'analyst' } = req.body;
  const db = readDB();
  if (db.users.find(u => u.username === username))
    return res.status(400).json({ error: 'Utilisateur déjà existant' });
  const user = { id: uuidv4(), username, password: bcrypt.hashSync(password, 10), role, createdAt: Date.now() };
  db.users.push(user);
  writeDB(db);
  res.json({ id: user.id, username: user.username, role: user.role });
});

app.delete('/api/users/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  const db = readDB();
  db.users = db.users.filter(u => u.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ── Company (single) routes ──────────────────────────────────
app.get('/api/company', auth, (req, res) => {
  const db = readDB();
  res.json(db.company || {});
});

app.put('/api/company', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  const db = readDB();
  const { name, sector, description } = req.body;
  db.company = { name: name || '', sector: sector || 'standard', description: description || '' };
  writeDB(db);
  res.json(db.company);
});

// ── Assessments routes ───────────────────────────────────────
app.get('/api/assessments', auth, (req, res) => {
  const db = readDB();
  res.json([...db.assessments].sort((a, b) => b.createdAt - a.createdAt));
});

app.post('/api/assessments', auth, (req, res) => {
  const db = readDB();
  const assessment = {
    id: uuidv4(),
    period: req.body.period,
    sector: req.body.sector,
    scores: req.body.scores,
    indicators: req.body.indicators,
    createdAt: Date.now(),
    createdBy: req.user.username
  };
  db.assessments.push(assessment);
  writeDB(db);
  res.json(assessment);
});

app.delete('/api/assessments/:id', auth, (req, res) => {
  const db = readDB();
  db.assessments = db.assessments.filter(a => a.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ── Stats route ──────────────────────────────────────────────
app.get('/api/stats', auth, (req, res) => {
  const db = readDB();
  const last = [...db.assessments].sort((a, b) => b.createdAt - a.createdAt)[0] || null;
  res.json({
    assessments: db.assessments.length,
    users: db.users.length,
    lastRos: last?.scores?.ros ?? null,
    lastPeriod: last?.period ?? null,
    company: db.company
  });
});

// ── Health ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

initDB();
const server = app.listen(PORT, () => console.log(`RoS backend running on port ${PORT}`));
module.exports = { app, server };
