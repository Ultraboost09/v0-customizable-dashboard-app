const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  getVolume: () => ipcRenderer.invoke('get-volume'),
  setVolume: (vol) => ipcRenderer.invoke('set-volume', vol),
  getBrightness: () => ipcRenderer.invoke('get-brightness'),
  setBrightness: (bright) => ipcRenderer.invoke('set-brightness', bright),
  getNowPlaying: () => ipcRenderer.invoke('get-now-playing'),
  mediaControl: (action) => ipcRenderer.invoke('media-control', action),
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  
  // Listen for the volume heartbeat
  onVolumeUpdate: (callback) => {
    ipcRenderer.on('volume-update', (event, value) => callback(value))
  }
})
