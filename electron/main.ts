import { app, BrowserWindow, ipcMain } from 'electron';
import storage from 'electron-json-storage';
import { SettingsState } from '../src/Settings';
import { createResizeHandle, saveStateStorage } from './utils';
// import { session } from 'electron'
// import path from 'path';
// import os from 'os';

let mainWindow: BrowserWindow | null;
let viewWindow: BrowserWindow | null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

type StorageWindowSize = Electron.Rectangle | undefined;

const dataPath = storage.getDataPath();
console.log('dataPath storage', dataPath);

function createWindow() {
  const mainSize = storage.getSync('mainWindowBounds') as StorageWindowSize;
  const viewSize = storage.getSync('viewWindowBounds') as StorageWindowSize;
  const viewState = storage.getSync('viewState') as SettingsState | undefined;

  console.log('state on load', viewState);

  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: mainSize?.width ?? 1400,
    height: mainSize?.height ?? 700,
    x: mainSize?.x,
    y: mainSize?.y,
    backgroundColor: '#191622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  console.log('MAIN_WINDOW_WEBPACK_ENTRY', MAIN_WINDOW_WEBPACK_ENTRY);
  console.log(
    'MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY',
    MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  viewWindow = new BrowserWindow({
    width: viewSize?.width ?? 800,
    height: viewSize?.height ?? 600,
    x: viewSize?.x,
    y: viewSize?.y,
    frame: false,
    transparent: true,
    webPreferences: {
      backgroundThrottling: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  viewWindow.loadURL(`${MAIN_WINDOW_WEBPACK_ENTRY}/#/chat`);

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('send to main', viewState);

    mainWindow?.webContents.send('change-state', viewState);
  });

  viewWindow.webContents.on('did-finish-load', () => {
    if (viewState?.alwaysOnTop) {
      viewWindow?.setAlwaysOnTop(true, 'screen-saver');
    }

    console.log('send to view', viewState);

    viewWindow?.webContents.send('change-state', viewState);
  });

  // TODO убрать в production
  mainWindow.webContents.openDevTools();

  viewWindow.webContents.openDevTools();

  viewWindow.on('closed', () => {
    viewWindow = null;
  });

  const onViewResize = createResizeHandle(viewWindow, 'viewWindowBounds');
  const onMainResize = createResizeHandle(mainWindow, 'mainWindowBounds');

  viewWindow.on('resize', onViewResize);
  viewWindow.on('move', onViewResize);

  mainWindow.on('resize', onMainResize);
  mainWindow.on('move', onMainResize);
}

async function registerListeners() {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on('message', (_, message) => {
    console.log('msg', message);
  });

  ipcMain.on('change-state', (_, payload: SettingsState) => {
    viewWindow?.webContents.send('change-state', payload);

    const alwaysOnTop = Boolean(payload.alwaysOnTop);

    viewWindow?.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
    saveStateStorage(payload);
  });
}

app
  .on('ready', createWindow)
  .whenReady()
  .then(() => {
    registerListeners();
    // // Load react-devtools
    // session.defaultSession.loadExtension(
    //   path.join(
    //     os.homedir(),
    //     '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.21.0_0'
    //   )
    // );
  })
  .catch((e) => console.error(e));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
