const { app, BrowserWindow, ipcMain, globalShortcut, nativeTheme } = require('electron')
const path = require('path')
const { exec } = require('child_process')

// Keep a global reference of the window object
let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#00000000',
  })

  // Load the app - always load from the hosted Vercel URL
  // This ensures Supabase auth works properly and data syncs across devices
  const appUrl = isDev ? 'http://localhost:3000' : 'https://v0-customizable-dashboard-app.vercel.app'
  mainWindow.loadURL(appUrl)
  
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Make window draggable by the title area
  mainWindow.setWindowButtonVisibility(true)
}

app.whenReady().then(() => {
  createWindow()

  // Register global media key shortcuts
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow?.webContents.send('media-key', 'playpause')
  })
  globalShortcut.register('MediaNextTrack', () => {
    mainWindow?.webContents.send('media-key', 'next')
  })
  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow?.webContents.send('media-key', 'previous')
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// IPC Handlers for system controls

// Get system volume (macOS)
ipcMain.handle('get-volume', async () => {
  return new Promise((resolve) => {
    if (process.platform === 'darwin') {
      exec('osascript -e "output volume of (get volume settings)"', (err, stdout) => {
        if (err) resolve(70)
        else resolve(parseInt(stdout.trim()) || 70)
      })
    } else if (process.platform === 'win32') {
      // Windows - would need nircmd or similar
      resolve(70)
    } else {
      resolve(70)
    }
  })
})

// Set system volume
ipcMain.handle('set-volume', async (event, volume) => {
  return new Promise((resolve) => {
    const vol = Math.max(0, Math.min(100, volume))
    if (process.platform === 'darwin') {
      exec(`osascript -e "set volume output volume ${vol}"`, (err) => {
        resolve(!err)
      })
    } else if (process.platform === 'win32') {
      // For Windows, you'd use nircmd or PowerShell
      // exec(`nircmd.exe setsysvolume ${Math.round(vol * 655.35)}`)
      resolve(true)
    } else {
      resolve(false)
    }
  })
})

// Get screen brightness (macOS)
ipcMain.handle('get-brightness', async () => {
  return new Promise((resolve) => {
    if (process.platform === 'darwin') {
      exec('brightness -l 2>/dev/null | grep "display 0" | awk \'{print $4}\'', (err, stdout) => {
        if (err || !stdout.trim()) resolve(80)
        else resolve(Math.round(parseFloat(stdout.trim()) * 100))
      })
    } else {
      resolve(80)
    }
  })
})

// Set screen brightness
ipcMain.handle('set-brightness', async (event, brightness) => {
  return new Promise((resolve) => {
    const bright = Math.max(0, Math.min(100, brightness)) / 100
    if (process.platform === 'darwin') {
      exec(`brightness ${bright}`, (err) => {
        resolve(!err)
      })
    } else {
      resolve(false)
    }
  })
})

// Get now playing info (macOS)
ipcMain.handle('get-now-playing', async () => {
  return new Promise((resolve) => {
    if (process.platform === 'darwin') {
      const script = `
        tell application "System Events"
          set frontApp to name of first application process whose frontmost is true
        end tell
        
        set nowPlayingInfo to {title:"", artist:"", album:"", isPlaying:false, app:""}
        
        try
          if application "Spotify" is running then
            tell application "Spotify"
              if player state is playing then
                set nowPlayingInfo to {title:(name of current track), artist:(artist of current track), album:(album of current track), isPlaying:true, app:"Spotify"}
              else if player state is paused then
                set nowPlayingInfo to {title:(name of current track), artist:(artist of current track), album:(album of current track), isPlaying:false, app:"Spotify"}
              end if
            end tell
          end if
        end try
        
        try
          if application "Music" is running and (title of nowPlayingInfo) is "" then
            tell application "Music"
              if player state is playing then
                set nowPlayingInfo to {title:(name of current track), artist:(artist of current track), album:(album of current track), isPlaying:true, app:"Apple Music"}
              else if player state is paused then
                set nowPlayingInfo to {title:(name of current track), artist:(artist of current track), album:(album of current track), isPlaying:false, app:"Apple Music"}
              end if
            end tell
          end if
        end try
        
        return (title of nowPlayingInfo) & "|" & (artist of nowPlayingInfo) & "|" & (album of nowPlayingInfo) & "|" & (isPlaying of nowPlayingInfo) & "|" & (app of nowPlayingInfo)
      `
      exec(`osascript -e '${script.replace(/'/g, "'\"'\"'")}'`, (err, stdout) => {
        if (err || !stdout.trim() || stdout.trim().startsWith('|')) {
          resolve(null)
        } else {
          const parts = stdout.trim().split('|')
          if (parts[0]) {
            resolve({
              title: parts[0] || 'Unknown',
              artist: parts[1] || 'Unknown Artist',
              album: parts[2] || '',
              isPlaying: parts[3] === 'true',
              app: parts[4] || 'Unknown',
            })
          } else {
            resolve(null)
          }
        }
      })
    } else if (process.platform === 'win32') {
      // Windows media session - would need additional native module
      resolve(null)
    } else {
      resolve(null)
    }
  })
})

// Media controls
ipcMain.handle('media-control', async (event, action) => {
  return new Promise((resolve) => {
    if (process.platform === 'darwin') {
      let keyCode
      switch (action) {
        case 'play':
        case 'pause':
        case 'playpause':
          keyCode = 49 // Space or play/pause
          exec('osascript -e \'tell application "System Events" to key code 49\'')
          break
        case 'next':
          exec('osascript -e \'tell application "System Events" to key code 124 using command down\'')
          break
        case 'previous':
          exec('osascript -e \'tell application "System Events" to key code 123 using command down\'')
          break
      }
      resolve(true)
    } else {
      resolve(false)
    }
  })
})

// Window controls
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

// Get system stats
ipcMain.handle('get-system-stats', async () => {
  return new Promise((resolve) => {
    if (process.platform === 'darwin') {
      exec('top -l 1 -n 0 | head -n 10', (err, stdout) => {
        if (err) {
          resolve({ cpu: 0, memory: 0, disk: 0 })
          return
        }
        
        let cpu = 0, memory = 0
        const lines = stdout.split('\n')
        
        for (const line of lines) {
          if (line.includes('CPU usage')) {
            const match = line.match(/(\d+\.\d+)% user/)
            if (match) cpu = parseFloat(match[1])
          }
          if (line.includes('PhysMem')) {
            const usedMatch = line.match(/(\d+)([MG]) used/)
            const totalMatch = line.match(/(\d+)([MG]) unused/)
            if (usedMatch && totalMatch) {
              const used = parseInt(usedMatch[1]) * (usedMatch[2] === 'G' ? 1024 : 1)
              const unused = parseInt(totalMatch[1]) * (totalMatch[2] === 'G' ? 1024 : 1)
              memory = Math.round((used / (used + unused)) * 100)
            }
          }
        }
        
        // Get disk usage
        exec('df -h / | tail -1 | awk \'{print $5}\'', (err2, stdout2) => {
          const disk = parseInt(stdout2.replace('%', '')) || 0
          resolve({ cpu: Math.round(cpu), memory, disk })
        })
      })
    } else {
      resolve({ cpu: 25, memory: 45, disk: 60 })
    }
  })
})
