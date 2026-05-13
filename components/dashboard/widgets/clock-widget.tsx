"use client"

import { useState, useEffect } from "react"
import { Power, RotateCcw, Settings } from "lucide-react"
import { format } from "date-fns"

interface ClockWidgetProps {
  onSettingsClick: () => void
}

export function ClockWidget({ onSettingsClick }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = format(time, "HH")
  const minutes = format(time, "mm")
  const seconds = format(time, "ss")
  const dayName = format(time, "EEEE")
  const dateStr = format(time, "MMMM d")

  return (
    <div className="h-full flex flex-col justify-center p-4">
      <div className="flex items-start gap-4">
        {/* System Icons */}
        <div className="flex flex-col gap-2 pt-2">
          <button className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" title="Power" />
          <button className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" title="Restart" />
          <button 
            className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" 
            title="Settings"
            onClick={onSettingsClick}
          />
        </div>

        {/* Time Display */}
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className="text-6xl font-light tracking-tight text-white tabular-nums">
              {hours}:{minutes}
            </span>
            <span className="text-2xl font-light text-white/70 ml-1 tabular-nums">
              {seconds}
            </span>
          </div>
          <span className="text-white/70 text-sm mt-1">
            {dayName}, {dateStr}
          </span>
        </div>
      </div>
    </div>
  )
}
