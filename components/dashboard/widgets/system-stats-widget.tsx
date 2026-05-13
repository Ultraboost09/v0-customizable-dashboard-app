"use client"

import { useState, useEffect } from "react"
import { Cpu, HardDrive, MemoryStick } from "lucide-react"

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
    <div className="h-full flex flex-col p-3 gap-2">
      <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
        System
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        {/* CPU */}
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex-1">
            <div className="text-[10px] text-white/50 mb-0.5">CPU</div>
            <div className="text-sm font-bold text-cyan-400">{stats.cpu}%</div>
          </div>
        </div>

        {/* RAM */}
        <div className="flex items-center gap-2">
          <MemoryStick className="w-3.5 h-3.5 text-emerald-400" />
          <div className="flex-1">
            <div className="text-[10px] text-white/50 mb-0.5">RAM</div>
            <div className="text-sm font-bold text-emerald-400">{stats.ram}%</div>
          </div>
        </div>

        {/* HDD */}
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          <div className="flex-1">
            <div className="text-[10px] text-white/50 mb-0.5">HDD</div>
            <div className="text-sm font-bold text-amber-400">{stats.hdd}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
