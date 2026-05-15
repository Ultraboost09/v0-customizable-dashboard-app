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
// SYSTEM HARDWARE LISTENERS
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

// Brightness Controller (Simulates Keyboard Hardware Keys)
let currentVirtualBrightness = 80;

ipcMain.handle('get-brightness', async () => {
  return currentVirtualBrightness;
})

ipcMain.handle('set-brightness', async (event, brightness) => {
  if (process.platform === 'darwin') {
    const difference = brightness - currentVirtualBrightness;
    currentVirtualBrightness = brightness;

    // Key Code 145 = Brightness Up, 144 = Brightness Down (Modern MacBooks)
    if (difference > 0) {
       exec(`osascript -e 'tell application "System Events" to key code 145'`)
    } else if (difference < 0) {
       exec(`osascript -e 'tell application "System Events" to key code 144'`)
    }
  }
})

// Now Playing Media Scanner (Broken into independent safe queries)
ipcMain.handle('get-now-playing', async () => {
  if (process.platform !== 'darwin') return null;

  // Helper function to run scripts safely
  const runScript = (script) => new Promise(resolve => {
    exec(`osascript -e '${script}'`, (err, stdout) => {
      resolve((!err && stdout.trim()) ? stdout.trim() : null);
    });
  });

  // 1. Check Spotify
  const spotifyScript = `if application "Spotify" is running then tell application "Spotify" to if player state is playing then return "Spotify|" & name of current track & "|" & artist of current track`;
  let res = await runScript(spotifyScript);
  if (res) {
    const parts = res.split('|');
    return { app: parts[0], title: parts[1], artist: parts[2], isPlaying: true };
  }

  // 2. Check Apple Music
  const musicScript = `if application "Music" is running then tell application "Music" to if player state is playing then return "Music|" & name of current track & "|" & artist of current track`;
  res = await runScript(musicScript);
  if (res) {
    const parts = res.split('|');
    return { app: parts[0], title: parts[1], artist: parts[2], isPlaying: true };
  }

  // 3. Check Google Chrome (Scans ALL open tabs, not just the front one)
  const chromeScript = `
    if application "Google Chrome" is running then
      tell application "Google Chrome"
        repeat with w in windows
          repeat with t in tabs of w
            if title of t contains "YouTube" or title of t contains "SoundCloud" then
              return "Chrome|" & title of t & "|Browser"
            end if
          end repeat
        end repeat
      end tell
    end if
    return ""
  `;
  res = await runScript(chromeScript);
  if (res && res !== "") {
    const parts = res.split('|');
    let title = parts[1].replace(' - YouTube', '').replace(' - SoundCloud', '');
    return { app: parts[0], title: title, artist: parts[2], isPlaying: true };
  }

  return null;
})

ipcMain.handle('media-control', async (event, action) => {
  if (process.platform === 'darwin') {
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
