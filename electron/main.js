const { app, BrowserWindow, dialog, Menu, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

const PORT = 3003;
let mainWindow = null;

// ── Chemins selon mode packagé ou développement ───────────────
const isPackaged = app.isPackaged;
const resourcesPath = isPackaged ? process.resourcesPath : path.join(__dirname, '..');

const backendPath    = path.join(resourcesPath, 'backend');
const frontendPath   = path.join(resourcesPath, 'frontend-dist');
const userDataPath   = app.getPath('userData');
const dataPath       = path.join(userDataPath, 'data');

// ── Démarrer Express dans ce même process Node.js ────────────
function startBackend() {
  process.env.ROS_PORT           = PORT;
  process.env.ROS_DATA_DIR       = dataPath;
  process.env.ROS_FRONTEND_DIST  = frontendPath;
  process.env.JWT_SECRET         = 'ros-electron-local-secret';
  process.env.NODE_ENV           = 'production';

  require(path.join(backendPath, 'server.js'));
}

// ── Attendre que le serveur réponde ──────────────────────────
function waitForBackend(maxMs = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(`http://localhost:${PORT}/api/health`, res => {
        if (res.statusCode === 200) resolve();
        else retry();
      }).on('error', retry);
    };
    const retry = () => {
      if (Date.now() - start > maxMs) {
        reject(new Error('Le serveur RoS n\'a pas démarré à temps.'));
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  });
}

// ── Fenêtre principale ────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'Return on Sovereignty v3.0',
    backgroundColor: '#0d1117',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Ouvrir les liens externes dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── Menu applicatif simplifié ─────────────────────────────────
function buildMenu() {
  const dataDir = dataPath;
  const template = [
    {
      label: 'RoS',
      submenu: [
        { label: 'À propos', click: () => {
          dialog.showMessageBox(mainWindow, {
            title: 'Return on Sovereignty v3.0',
            message: 'Return on Sovereignty v3.0',
            detail: 'Développé par Naouphel Ouakaoui\nMémoire CRO 3.0 — École de Guerre Économique\n2025-2026 · MaCyb09',
            type: 'info'
          });
        }},
        { type: 'separator' },
        { label: 'Ouvrir le dossier de données', click: () => shell.openPath(dataDir) },
        { type: 'separator' },
        { label: 'Quitter', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Recharger', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Zoom +', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
        { label: 'Zoom −', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Taille normale', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Plein écran', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Cycle de vie ──────────────────────────────────────────────
app.whenReady().then(async () => {
  try {
    buildMenu();
    startBackend();
    await waitForBackend();
    createWindow();
  } catch (err) {
    dialog.showErrorBox(
      'Erreur de démarrage RoS',
      err.message + '\n\nVérifiez que le port 3003 n\'est pas déjà utilisé.'
    );
    app.quit();
  }
});

app.on('window-all-closed', () => app.quit());

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
