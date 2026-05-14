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
  getVolume: () => Promise<number>
  setVolume: (volume: number) => Promise<boolean>
  getBrightness: () => Promise<number>
  setBrightness: (brightness: number) => Promise<boolean>
  getNowPlaying: () => Promise<NowPlayingInfo | null>
  mediaControl: (action: 'play' | 'pause' | 'playpause' | 'next' | 'previous') => Promise<boolean>
  getSystemStats: () => Promise<SystemStats>
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  onMediaKey: (callback: (key: string) => void) => void
  platform: 'darwin' | 'win32' | 'linux'
  isElectron: boolean
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
    electron: {
      getVolume: () => Promise<number>
      setVolume: (vol: number) => Promise<void>
      getBrightness: () => Promise<number>
      setBrightness: (bright: number) => Promise<void>
      getNowPlaying: () => Promise<NowPlayingInfo | null>
      mediaControl: (action: string) => Promise<void>
      getSystemStats: () => Promise<any>
      // Updated return type to include the cleanup function
      onVolumeUpdate: (callback: (newVol: number) => void) => (() => void) | void
    }
  }
}

export {}
