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
      // Direct check of the macOS Media Hub defaults
      const script = `
        try
          set info to do shell script "defaults read com.apple.nowplayinginfo"
          return info
        on error
          return "EMPTY"
        end try
      `;
      
      exec(`osascript -e '${script}'`, (err, stdout) => {
        if (!err && stdout.trim() !== "EMPTY") {
          // Look for Title and Artist in the system dump
          const tMatch = stdout.match(/kMRMediaRemoteNowPlayingInfoTitle = "(.*?)";/);
          const aMatch = stdout.match(/kMRMediaRemoteNowPlayingInfoArtist = "(.*?)";/);
          
          if (tMatch && tMatch[1]) {
            resolve({
              app: "Media",
              title: tMatch[1],
              artist: aMatch ? aMatch[1] : "Unknown",
              isPlaying: true
            });
          } else {
            resolve(null);
          }
        } else {
          // Final fallback to checking apps directly
          const fallback = `
            try
              if application "Spotify" is running then
                tell application "Spotify" to return "Spotify|" & name of current track & "|" & artist of current track
              else if application "Music" is running then
                tell application "Music" to return "Music|" & name of current track & "|" & artist of current track
              end if
            end try
            return ""
          `;
          exec(`osascript -e '${fallback}'`, (e, out) => {
            if (!e && out.trim()) {
              const p = out.trim().split('|');
              resolve({ app: p[0], title: p[1], artist: p[2], isPlaying: true });
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
