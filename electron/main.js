const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const { exec } = require('child_process')

process.on('uncaughtException', (error) => {
  dialog.showErrorBox('Fatal App Error', error.toString())
  app.quit()
})

const { createServer } = require('http')
const next = require('next')

const dev = !app.isPackaged
const nextApp = next({ 
  dev, 
  dir: app.getAppPath(),
  conf: { distDir: 'next-build' }
})
const handle = nextApp.getRequestHandler()

let mainWindow

// SYSTEM HARDWARE LISTENERS
ipcMain.handle('get-volume', async () => {
  if (process.platform === 'darwin') {
    return new Promise(resolve => {
      exec('osascript -e "output volume of (get volume settings)"', (err, stdout) => {
        resolve(err ? 50 : parseInt(stdout))
      })
    })
  }
  return 50 
})

ipcMain.handle('set-volume', async (event, volume) => {
  if (process.platform === 'darwin') {
    exec(`osascript -e "set volume output volume ${volume}"`)
  }
})

ipcMain.handle('get-brightness', async () => 80)
ipcMain.handle('set-brightness', async (event, brightness) => {})

ipcMain.handle('get-now-playing', async () => {
  if (process.platform === 'darwin') {
    return new Promise(resolve => {
      // This script checks the general macOS Control Center info
      const script = `
        try
          tell application "System Events"
            if exists (process "ControlCenter") then
              -- We try to get the metadata that macOS broadcasts globally
              set nowPlaying to do shell script "nowplaying-cli get title artist"
              return "System|" & nowPlaying
            end if
          end tell
        end try
        
        -- Fallback to the reliable Spotify/Music check if global fails
        try
          if application "Spotify" is running then
            tell application "Spotify"
              if player state is playing then
                return "Spotify|" & name of current track & "|" & artist of current track
              end if
            end tell
          end if
        end try
        return ""
      `;
      
      // Note: If nowplaying-cli isn't installed, we use a different internal command
      exec('nowplaying-cli get title artist', (err, stdout) => {
        if (!err && stdout.trim()) {
          const lines = stdout.trim().split('\n');
          resolve({ 
            app: 'Media', 
            title: lines[0] || 'Unknown Title', 
            artist: lines[1] || 'Unknown Artist', 
            isPlaying: true 
          });
        } else {
          // Final fallback for Chrome/Safari if CLI fails
          exec(`osascript -e 'tell application "Google Chrome" to return title of active tab of front window'`, (e, out) => {
             if (!e && out.trim()) {
                resolve({ app: 'Chrome', title: out.trim().split(' - YouTube')[0], artist: 'Browser', isPlaying: true });
             } else {
                resolve(null);
             }
          });
        }
      });
    })
  }
  return null
})

ipcMain.handle('media-control', async (event, action) => {
  if (process.platform === 'darwin') {
    // This uses the system media keys (F7, F8, F9) to control EVERYTHING
    const keyCode = action === 'playpause' ? 16 : action === 'next' ? 19 : 20;
    exec(`osascript -e 'tell application "System Events" to key code ${keyCode}'`);
  }
})

ipcMain.handle('get-system-stats', async () => ({ cpu: 15, ram: 45 }))

// APP LAUNCHER
app.whenReady().then(async () => {
  try {
    await nextApp.prepare()
    const server = createServer((req, res) => { handle(req, res) })
    server.listen(3000, () => {
      mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        }
      })
      mainWindow.loadURL('http://localhost:3000')
      
      setInterval(() => {
        if (process.platform === 'darwin' && mainWindow) {
          exec('osascript -e "output volume of (get volume settings)"', (err, stdout) => {
            if (!err) {
              mainWindow.webContents.send('volume-update', parseInt(stdout))
            }
          })
        }
      }, 1000)
    })
  } catch (err) {
    dialog.showErrorBox('Server Error', err.toString())
    app.quit()
  }
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
