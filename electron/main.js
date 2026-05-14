const { app, BrowserWindow, dialog } = require('electron')
const { createServer } = require('http')
const next = require('next')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
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
    // If Next.js crashes, show a visible popup instead of closing silently
    dialog.showErrorBox('Failed to start Next.js server', err.toString())
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
