const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')

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
          nodeIntegration: true,
          preload: path.join(__dirname, 'preload.js')
        }
      })

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
