"use client"

import { useDashboardStore } from "@/lib/store"
import { Volume2, Sun } from "lucide-react"

export function SlidersWidget() {
  const { volume, brightness, setVolume, setBrightness } = useDashboardStore()

  return (
    <div className="h-full flex items-center justify-center gap-6 p-4">
      {/* Volume Slider */}
      <div className="flex flex-col items-center gap-2">
        <Volume2 className="w-4 h-4 text-white/60" />
        <div className="relative h-32 w-2 bg-white/10 rounded-full">
          <div
            className="absolute bottom-0 w-full bg-blue-500 rounded-full transition-all"
            style={{ height: `${volume}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => {
              const newVolume = parseInt(e.target.value)
              setVolume(newVolume)
              
              // HOOK: Connect to Electron/Tauri backend for actual volume control
              // For Electron: ipcRenderer.send('set-volume', newVolume)
              // For Tauri: invoke('set_volume', { volume: newVolume })
              // Example implementation:
              // if (window.electron) {
              //   window.electron.ipcRenderer.send('set-volume', newVolume / 100)
              // }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
            }}
          />
        </div>
        <span className="text-[10px] text-white/40">{volume}%</span>
      </div>

      {/* Brightness Slider */}
      <div className="flex flex-col items-center gap-2">
        <Sun className="w-4 h-4 text-white/60" />
        <div className="relative h-32 w-2 bg-white/10 rounded-full">
          <div
            className="absolute bottom-0 w-full bg-yellow-500 rounded-full transition-all"
            style={{ height: `${brightness}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => {
              const newBrightness = parseInt(e.target.value)
              setBrightness(newBrightness)
              
              // HOOK: Connect to Electron/Tauri backend for actual brightness control
              // For Electron: ipcRenderer.send('set-brightness', newBrightness)
              // For Tauri: invoke('set_brightness', { brightness: newBrightness })
              // Example implementation:
              // if (window.electron) {
              //   window.electron.ipcRenderer.send('set-brightness', newBrightness / 100)
              // }
              
              // For web preview, we can simulate with CSS filter
              document.body.style.filter = `brightness(${0.5 + (newBrightness / 200)})`
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
            }}
          />
        </div>
        <span className="text-[10px] text-white/40">{brightness}%</span>
      </div>
    </div>
  )
}
