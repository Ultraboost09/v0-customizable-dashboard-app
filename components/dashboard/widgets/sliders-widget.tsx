"use client"

import { useEffect, useState } from "react"
import { useDashboardStore } from "@/lib/store"
import { Volume2, Sun } from "lucide-react"

export function SlidersWidget() {
  const { volume, brightness, setVolume, setBrightness } = useDashboardStore()
  const [isElectron, setIsElectron] = useState(false)

  // Check if running in Electron and sync system values
  useEffect(() => {
    const checkElectron = async () => {
      if (window.electronAPI?.isElectron) {
        setIsElectron(true)
        
        // Get actual system volume and brightness
        const systemVolume = await window.electronAPI.getVolume()
        const systemBrightness = await window.electronAPI.getBrightness()
        
        setVolume(systemVolume)
        setBrightness(systemBrightness)
      }
    }
    
    checkElectron()
  }, [setVolume, setBrightness])

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume)
    
    if (window.electronAPI?.isElectron) {
      // Actually change system volume
      await window.electronAPI.setVolume(newVolume)
    }
  }

  const handleBrightnessChange = async (newBrightness: number) => {
    setBrightness(newBrightness)
    
    if (window.electronAPI?.isElectron) {
      // Actually change system brightness
      await window.electronAPI.setBrightness(newBrightness)
    } else {
      // For web preview, simulate with CSS filter
      document.body.style.filter = `brightness(${0.5 + (newBrightness / 200)})`
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center gap-4 p-3 overflow-hidden">
      {/* Volume Slider */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[50px]">
        <Volume2 className="w-4 h-4 text-white/60 flex-shrink-0" />
        <div className="relative w-2 bg-white/10 rounded-full flex-1 min-h-[60px] max-h-[120px]">
          <div
            className="absolute bottom-0 w-full bg-blue-500 rounded-full transition-all"
            style={{ height: `${volume}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
            }}
          />
        </div>
        <span 
          className="text-white/40 flex-shrink-0"
          style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)" }}
        >
          {volume}%
        </span>
        {isElectron && (
          <span className="text-green-400/60" style={{ fontSize: "clamp(0.4rem, 1vw, 0.5rem)" }}>
            System
          </span>
        )}
      </div>

      {/* Brightness Slider */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[50px]">
        <Sun className="w-4 h-4 text-white/60 flex-shrink-0" />
        <div className="relative w-2 bg-white/10 rounded-full flex-1 min-h-[60px] max-h-[120px]">
          <div
            className="absolute bottom-0 w-full bg-yellow-500 rounded-full transition-all"
            style={{ height: `${brightness}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
            }}
          />
        </div>
        <span 
          className="text-white/40 flex-shrink-0"
          style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)" }}
        >
          {brightness}%
        </span>
        {isElectron && (
          <span className="text-green-400/60" style={{ fontSize: "clamp(0.4rem, 1vw, 0.5rem)" }}>
            System
          </span>
        )}
      </div>
    </div>
  )
}
