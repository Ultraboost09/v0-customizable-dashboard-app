"use client"

import { useState, useEffect } from "react"
import { Cpu, HardDrive, MemoryStick, Download } from "lucide-react"

export function SystemStatsWidget() {
  const [stats, setStats] = useState({
    cpu: 0,
    ram: 26,
    hdd: 22,
  })

  // Simulated stats - in a real desktop app (Electron/Tauri),
  // you would hook into system APIs here
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 15),
        ram: 20 + Math.floor(Math.random() * 20),
        hdd: 20 + Math.floor(Math.random() * 10),
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full w-full flex flex-col p-3 gap-2 overflow-hidden">
      <div 
        className="text-white/50 uppercase tracking-wider"
        style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)" }}
      >
        System
      </div>
      
      <div className="flex-1 flex flex-col gap-2 justify-center min-h-0">
        {/* CPU */}
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-white/50" style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.625rem)" }}>CPU</div>
            <div className="font-bold text-cyan-400" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>{stats.cpu}%</div>
          </div>
        </div>

        {/* RAM */}
        <div className="flex items-center gap-2">
          <MemoryStick className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-white/50" style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.625rem)" }}>RAM</div>
            <div className="font-bold text-emerald-400" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>{stats.ram}%</div>
          </div>
        </div>

        {/* HDD */}
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-white/50" style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.625rem)" }}>HDD</div>
            <div className="font-bold text-amber-400" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>{stats.hdd}%</div>
          </div>
        </div>
      </div>

      {/* Desktop app hint */}
      <a 
        href="/download"
        className="flex items-center justify-center gap-1 text-white/30 hover:text-white/50 transition-colors pt-1 border-t border-white/10"
        style={{ fontSize: "clamp(0.45rem, 1vw, 0.5rem)" }}
      >
        <Download className="w-2.5 h-2.5" />
        Real stats in desktop app
      </a>
    </div>
  )
}
