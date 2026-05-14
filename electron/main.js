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
      // This command asks the macOS system directly what is playing globally
      // It doesn't need Chrome permission because it asks the OS, not the app
      const cmd = "nowplaying-cli get title artist"
      
      exec(cmd, (err, stdout) => {
        if (!err && stdout.trim() && !stdout.includes("null")) {
          const lines = stdout.trim().split('\n')
          resolve({
            app: "Media",
            title: lines[0] || "Unknown",
            artist: lines[1] || "Playing",
            isPlaying: true
          })
        } else {
          // Fallback: Check if Spotify is specifically playing
          exec(`osascript -e 'if application "Spotify" is running then tell application "Spotify" to return name of current track & "|" & artist of current track'`, (e, out) => {
            if (!e && out.trim()) {
              const parts = out.trim().split('|')
              resolve({ app: "Spotify", title: parts[0], artist: parts[1], isPlaying: true })
            } else {
              resolve(null)
            }
          })
        }
      })
    })
  }
  return null
})

ipcMain.handle('media-control', async (event, action) => {
  if (process.platform === 'darwin') {
    // This simulates hitting the actual F7/F8/F9 keys on your keyboard
    // It will pause Chrome, Spotify, or anything else currently active
    const key = action === 'playpause' ? 'playpause' : action === 'next' ? 'next' : 'previous'
    exec(`nowplaying-cli ${key}`)
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
