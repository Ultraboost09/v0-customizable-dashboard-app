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
      const script = `
        try
          if application "Spotify" is running then
            tell application "Spotify"
              if player state is playing then
                return "Spotify|" & name of current track & "|" & artist of current track & "|" & album of current track
              end if
            end tell
          end if
          if application "Music" is running then
            tell application "Music"
              if player state is playing then
                return "Music|" & name of current track & "|" & artist of current track & "|" & album of current track
              end if
            end tell
          end if
          if application "Google Chrome" is running then
            tell application "Google Chrome"
              repeat with w in windows
                repeat with t in tabs of w
                  set tabTitle to title of t
                  if tabTitle contains "YouTube" or tabTitle contains "SoundCloud" or tabTitle contains "Spotify" then
                    return "Chrome|" & tabTitle & "|Browser|"
                  end if
                end repeat
              end repeat
            end tell
          end if
        end try
        return ""
      `;
      exec(`osascript -e '${script}'`, (err, stdout) => {
        if (!err && stdout && stdout.trim()) {
          const parts = stdout.trim().split('|');
          let title = parts[1];
          if (parts[0] === 'Chrome') {
            title = title.replace(' - YouTube', '').replace(' - Spotify', '').replace(' - SoundCloud', '');
          }
          resolve({ app: parts[0], title: title, artist: parts[2], album: parts[3] || '', isPlaying: true });
        } else {
          resolve(null);
        }
      })
    })
  }
  return null
})

ipcMain.handle('media-control', async (event, action) => {
  if (process.platform === 'darwin') {
    const cmd = action === 'playpause' ? 'playpause' : action === 'next' ? 'next track' : 'previous track';
    exec(`osascript -e 'try\n if application "Spotify" is running then tell application "Spotify" to ${cmd}\n if application "Music" is running then tell application "Music" to ${cmd}\n end try'`)
  }
})

ipcMain.handle('get-system-stats', async () => ({ cpu: 15, ram: 45 }))

// APP LAUNCHER
app.whenReady().then(async () => {
  try {
    await nextApp.prepare()

    const server = createServer((req, res) => {
      handle(req, res)
    })

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

      // Sync volume with keyboard changes every 1 second
      setInterval(() => {
        if (process.platform === 'darwin' && mainWindow) {
          exec('osascript -e "output volume of (get volume settings)"', (err, stdout) => {
            if (!err) {
              const vol = parseInt(stdout)
              mainWindow.webContents.send('volume-update', vol)
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
