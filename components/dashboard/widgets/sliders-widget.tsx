"use client"

import { useEffect } from "react"
import { useDashboardStore } from "@/lib/store"
import { Volume2, Sun } from "lucide-react"

export function SlidersWidget() {
  const { volume, setVolume, brightness, setBrightness } = useDashboardStore()

  // Monitor physical hardware keyboard volume updates
  useEffect(() => {
    if (typeof window !== "undefined" && window.electron?.onVolumeUpdate) {
      const removeListener = window.electron.onVolumeUpdate((newVol: number) => {
        if (newVol !== volume) {
          setVolume(newVol)
        }
      })

      return () => {
        if (typeof removeListener === "function") {
          removeListener()
        }
      }
    }
  }, [setVolume, volume])

  // Initialize display brightness tracking parameters on component mount
  useEffect(() => {
    if (window.electron?.getBrightness) {
      window.electron.getBrightness().then((initialBrightness: number) => {
        setBrightness(initialBrightness)
      })
    }
  }, [setBrightness])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    setVolume(val)
    if (window.electron) {
      window.electron.setVolume(val)
    }
  }

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    setBrightness(val)
    if (window.electron) {
      window.electron.setBrightness(val)
    }
  }

  return (
    <div className="p-4 h-full flex flex-col justify-around gap-4">
      {/* Volume Layout */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-white/70">
          <Volume2 className="w-4 h-4" />
          <span className="text-[10px] font-medium">{volume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Brightness Layout */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-white/70">
          <Sun className="w-4 h-4" />
          <span className="text-[10px] font-medium">{brightness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={brightness}
          onChange={handleBrightnessChange}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
        />
      </div>
    </div>
  )
}
