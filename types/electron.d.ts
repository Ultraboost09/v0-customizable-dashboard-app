interface NowPlayingInfo {
  title: string
  artist: string
  album: string
  isPlaying: boolean
  app: string
}

interface SystemStats {
  cpu: number
  memory: number
  disk: number
}

interface ElectronAPI {
  // System controls
  getVolume: () => Promise<number>
  setVolume: (volume: number) => Promise<boolean>
  getBrightness: () => Promise<number>
  setBrightness: (brightness: number) => Promise<boolean>
  
  // Now playing
  getNowPlaying: () => Promise<NowPlayingInfo | null>
  mediaControl: (action: 'play' | 'pause' | 'playpause' | 'next' | 'previous') => Promise<boolean>
  
  // System stats
  getSystemStats: () => Promise<SystemStats>
  
  // Window controls
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  
  // Media key listeners
  onMediaKey: (callback: (key: string) => void) => void
  
  // Platform info
  platform: 'darwin' | 'win32' | 'linux'
  isElectron: boolean
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
