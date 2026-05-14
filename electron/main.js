const { app, BrowserWindow } = require('electron')
const { createServer } = require('http')
const next = require('next')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
// This points Next.js to your packaged app directory
const nextApp = next({ dev, dir: app.getAppPath() })
const handle = nextApp.getRequestHandler()

let mainWindow

app.whenReady().then(async () => {
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
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
