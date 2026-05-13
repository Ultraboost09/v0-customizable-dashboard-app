"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useDashboardStore } from "@/lib/store"
import { Plus, X, Bell, BellOff, Trash2 } from "lucide-react"
import { format, parse } from "date-fns"

export function AlarmWidget() {
  const { alarms, addAlarm, removeAlarm, toggleAlarm } = useDashboardStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newTime, setNewTime] = useState("08:00")
  const [newLabel, setNewLabel] = useState("")
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [activeAlarm, setActiveAlarm] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAHj+HimH0AAH/f45uAAABx2+CaewAAadjem3sAAGba3Jl7AABj2NqWegAAYNXYlHgAAF3S1ZF2AABaztKOdAAAV8rPi3IAAFXE")
  }, [])

  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.loop = true
      audioRef.current.play().catch(() => {})
    }
  }, [])

  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.loop = false
    }
    setActiveAlarm(null)
  }, [])

  // Check alarms every second
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      const currentDay = now.getDay()

      alarms.forEach((alarm) => {
        if (
          alarm.enabled &&
          alarm.time === currentTime &&
          (alarm.days.length === 0 || alarm.days.includes(currentDay)) &&
          activeAlarm !== alarm.id
        ) {
          setActiveAlarm(alarm.id)
          playAlarm()
        }
      })
    }

    const interval = setInterval(checkAlarms, 1000)
    return () => clearInterval(interval)
  }, [alarms, activeAlarm, playAlarm])

  const handleAddAlarm = () => {
    addAlarm({
      time: newTime,
      label: newLabel || "Alarm",
      enabled: true,
      days: selectedDays,
    })
    setShowAdd(false)
    setNewTime("08:00")
    setNewLabel("")
    setSelectedDays([1, 2, 3, 4, 5])
  }

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  // Format time to 12-hour
  const formatTime12Hour = (time24: string) => {
    try {
      const date = parse(time24, "HH:mm", new Date())
      return format(date, "h:mm a")
    } catch {
      return time24
    }
  }

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div className="h-full w-full flex flex-col p-3 overflow-hidden">
      {/* Active Alarm Alert */}
      {activeAlarm && (
        <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center z-10 rounded-xl animate-pulse">
          <Bell className="w-8 h-8 text-white mb-2 animate-bounce" />
          <span className="text-white font-medium text-sm mb-2">
            {alarms.find((a) => a.id === activeAlarm)?.label}
          </span>
          <button
            onClick={stopAlarm}
            className="px-4 py-2 bg-white text-red-500 rounded-full text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-white/70 flex-shrink-0" />
          <span className="text-white font-medium" style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}>Alarms</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          {showAdd ? <X className="w-4 h-4 text-white/70" /> : <Plus className="w-4 h-4 text-white/70" />}
        </button>
      </div>

      {/* Add Alarm Form */}
      {showAdd && (
        <div className="mb-2 p-2 bg-white/5 rounded flex-shrink-0">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-full bg-white/10 text-white p-1.5 rounded outline-none mb-2"
            style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)" }}
          />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (optional)"
            className="w-full bg-transparent text-white placeholder-white/40 outline-none mb-2"
            style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)" }}
          />
          <div className="flex gap-1 mb-2 flex-wrap">
            {dayLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`w-5 h-5 rounded-full ${
                  selectedDays.includes(i)
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/50"
                }`}
                style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.625rem)" }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleAddAlarm}
            className="w-full bg-blue-500 text-white py-1.5 rounded"
            style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)" }}
          >
            Add Alarm
          </button>
        </div>
      )}

      {/* Alarms List */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {alarms.length === 0 ? (
          <div className="text-white/40 text-center py-4" style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)" }}>
            No alarms set
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`flex items-center justify-between p-2 rounded group ${
                alarm.enabled ? "bg-white/5" : "bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => toggleAlarm(alarm.id)}
                  className="p-1 rounded hover:bg-white/10 flex-shrink-0"
                >
                  {alarm.enabled ? (
                    <Bell className="w-3 h-3 text-blue-400" />
                  ) : (
                    <BellOff className="w-3 h-3 text-white/30" />
                  )}
                </button>
                <div className="min-w-0">
                  <div 
                    className={`font-medium truncate ${alarm.enabled ? "text-white" : "text-white/40"}`}
                    style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
                  >
                    {formatTime12Hour(alarm.time)}
                  </div>
                  <div className="text-white/40 truncate" style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.625rem)" }}>{alarm.label}</div>
                </div>
              </div>
              <button
                onClick={() => removeAlarm(alarm.id)}
                className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <Trash2 className="w-3 h-3 text-red-400/70" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
