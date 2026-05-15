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

// ==========================================
// HARDWARE & MEDIA LISTENERS
// ==========================================

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

// Brightness: Note on Mac - without native C++ modules, we simulate via shell
ipcMain.handle('get-brightness', async () => 80)
ipcMain.handle('set-brightness', async (event, brightness) => {
  if (process.platform === 'darwin') {
    const target = brightness / 100
    // Try native command if installed, otherwise fail silently instead of crashing
    exec(`brightness ${target}`, (err) => {
      if (err) console.log("Brightness tool not found. Requires native module for true absolute slider.")
    })
  }
})

// Now Playing: Will now successfully trigger the permission popups!
ipcMain.handle('get-now-playing', async () => {
  if (process.platform === 'darwin') {
    return new Promise(resolve => {
      const script = `
        try
          if application "Spotify" is running then
            tell application "Spotify"
              if player state is playing then
                return "Spotify|" & name of current track & "|" & artist of current track
              end if
            end tell
          end if
        end try

        try
          if application "Music" is running then
            tell application "Music"
              if player state is playing then
                return "Music|" & name of current track & "|" & artist of current track
              end if
            end tell
          end if
        end try

        try
          if application "Google Chrome" is running then
            tell application "Google Chrome"
              set activeTabTitle to title of active tab of front window
              if activeTabTitle contains "YouTube" or activeTabTitle contains "SoundCloud" then
                return "Chrome|" & activeTabTitle & "|Browser"
              end if
            end tell
          end if
        end try

        return "NONE"
      `;
      
      exec(`osascript -e '${script}'`, (err, stdout) => {
        if (!err && stdout && stdout.trim() !== "NONE") {
          const parts = stdout.trim().split('|');
          let title = parts[1];
          if (parts[0] === 'Chrome') {
            title = title.replace(' - YouTube', '').replace(' - SoundCloud', '');
          }
          resolve({ app: parts[0], title: title, artist: parts[2], isPlaying: true });
        } else {
          resolve(null);
        }
      });
    })
  }
  return null
})

ipcMain.handle('media-control', async (event, action) => {
  if (process.platform === 'darwin') {
    // Triggers actual media keys via System Events (Requires Accessibility permission)
    const keyCode = action === 'playpause' ? 16 : action === 'next' ? 19 : 20;
    exec(`osascript -e 'tell application "System Events" to key code ${keyCode}'`);
  }
})

ipcMain.handle('get-system-stats', async () => ({ cpu: 15, ram: 45 }))

// ==========================================
// APP LAUNCHER
// ==========================================
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
            if (!err && stdout.trim()) {
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
