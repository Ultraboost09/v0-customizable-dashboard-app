const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')

// Catch ALL fatal errors immediately so the app never closes silently
process.on('uncaughtException', (error) => {
  dialog.showErrorBox('Fatal App Error', error.toString())
  app.quit()
})

const { createServer } = require('http')
const next = require('next')

// Use Electron's native package checker
const dev = !app.isPackaged
const nextApp = next({ dev, dir: app.getAppPath() })
const handle = nextApp.getRequestHandler()

let mainWindow

app.whenReady().then(async () => {
  try {
    // 1. Prepare the Next.js server
    await nextApp.prepare()

    // 2. Create a local web server inside the desktop app
    const server = createServer((req, res) => {
      handle(req, res)
    })

    // 3. Listen on port 3000, then open the window
    server.listen(3000, () => {
      mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, 'preload.js')
        }
      })

      // 4. Load the dashboard from the local server
      mainWindow.loadURL('http://localhost:3000')
    })
  } catch (err) {
    dialog.showErrorBox('Server Error', err.toString())
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
