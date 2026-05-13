"use client"

import { useState, useEffect } from "react"
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

  // 12-hour format
  const hours = format(time, "h")
  const minutes = format(time, "mm")
  const seconds = format(time, "ss")
  const ampm = format(time, "a")
  const dayName = format(time, "EEEE")
  const dateStr = format(time, "MMMM d")

  return (
    <div className="h-full w-full flex flex-col justify-center p-4 overflow-hidden">
      <div className="flex items-start gap-3 min-w-0">
        {/* System Icons */}
        <div className="flex flex-col gap-2 pt-2 flex-shrink-0">
          <button className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" title="Power" />
          <button className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" title="Restart" />
          <button 
            className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors" 
            title="Settings"
            onClick={onSettingsClick}
          />
        </div>

        {/* Time Display - scales with container */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-baseline flex-wrap">
            <span 
              className="font-light tracking-tight text-white tabular-nums"
              style={{ fontSize: "clamp(2rem, 8vw, 4rem)" }}
            >
              {hours}:{minutes}
            </span>
            <span 
              className="font-light text-white/70 ml-1 tabular-nums"
              style={{ fontSize: "clamp(1rem, 3vw, 1.75rem)" }}
            >
              {seconds}
            </span>
            <span 
              className="font-medium text-white/60 ml-2 uppercase"
              style={{ fontSize: "clamp(0.75rem, 2vw, 1.25rem)" }}
            >
              {ampm}
            </span>
          </div>
          <span 
            className="text-white/70 mt-1 truncate"
            style={{ fontSize: "clamp(0.65rem, 2vw, 0.875rem)" }}
          >
            {dayName}, {dateStr}
          </span>
        </div>
      </div>
    </div>
  )
}
