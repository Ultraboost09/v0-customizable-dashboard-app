const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  getVolume: () => ipcRenderer.invoke('get-volume'),
  setVolume: (vol) => ipcRenderer.invoke('set-volume', vol),
  getBrightness: () => ipcRenderer.invoke('get-brightness'),
  setBrightness: (bright) => ipcRenderer.invoke('set-brightness', bright),
  getNowPlaying: () => ipcRenderer.invoke('get-now-playing'),
  mediaControl: (action) => ipcRenderer.invoke('media-control', action),
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  
  // Updated with a cleanup return
  onVolumeUpdate: (callback) => {
    const subscription = (event, value) => callback(value)
    ipcRenderer.on('volume-update', subscription)
    // Return a function to remove this specific listener later
    return () => ipcRenderer.removeListener('volume-update', subscription)
  }
})
