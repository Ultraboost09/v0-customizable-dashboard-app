const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // System controls
  getVolume: () => ipcRenderer.invoke('get-volume'),
  setVolume: (volume) => ipcRenderer.invoke('set-volume', volume),
  getBrightness: () => ipcRenderer.invoke('get-brightness'),
  setBrightness: (brightness) => ipcRenderer.invoke('set-brightness', brightness),
  
  // Now playing
  getNowPlaying: () => ipcRenderer.invoke('get-now-playing'),
  mediaControl: (action) => ipcRenderer.invoke('media-control', action),
  
  // System stats
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // Media key listeners
  onMediaKey: (callback) => {
    ipcRenderer.on('media-key', (event, key) => callback(key))
  },
  
  // Platform info
  platform: process.platform,
  isElectron: true,
})
