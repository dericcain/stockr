const electron = require('electron');
const settings = require('electron-settings');
const path = require('path');
const url = require('url');

// Module to control application life.
const app = electron.app;
const { Tray, ipcMain } = electron;
const assetsDirectory = path.join(__dirname, '../public/assets');
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const isDev = Boolean(process.env.ELECTRON_START_URL);
let mainWindow, tray, favorite, watchList;
const defaultStocks = {
  favorite: 'MSFT',
  watchList: ['MSFT', 'GWRE', 'GOOGL']
};

app.dock.hide();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await createTray();
  createWindow();
});

const loadSettings = () => {
  favorite = settings.get('stocks.favorite') || defaultStocks.favorite;
  watchList = settings.get('stocks.watchList') || defaultStocks.watchList;

  settings.set('stocks', {
    favorite,
    watchList,
  });
}

const startUrl = process.env.ELECTRON_START_URL || url.format({
  pathname: path.join(__dirname, '/../build/index.html'),
  protocol: 'file:',
  slashes: true
});

const getWindowPosition = () => {
  const windowBounds = mainWindow.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  return { x, y };
};

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
};

const showWindow = () => {
  const position = getWindowPosition();
  mainWindow.setPosition(position.x, position.y, false);
  mainWindow.show();
  mainWindow.focus();
};

const createTray = async () => {
  loadSettings();
  const tray = new Tray(path.join(assetsDirectory, 'stockerTemplate.png'));
  global.tray = tray;
  tray.on('right-click', toggleWindow);
  tray.on('double-click', toggleWindow);
  tray.on('click', function(event) {
  toggleWindow();
    // Show devtools when command clicked
    if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
      mainWindow.openDevTools({ mode: 'detach' });
    }
  });
};

const createWindow = () => {
  const windowConfig = isDev ? {
    width: 600,
    height: 800
  } : {
    width: 320,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  };

  // Create the browser window.
  mainWindow = new BrowserWindow(windowConfig);

  // and load the index.html of the app.
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('show-window', () => {
  showWindow();
});

ipcMain.on('stocks-updated', (event, stocks) => {
  // Show "feels like" temperature in tray
  // tray.setTitle(`${Math.round(weather.currently.apparentTemperature)}°`)
});

