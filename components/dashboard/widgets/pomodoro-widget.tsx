"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react"

type PomodoroMode = "focus" | "shortBreak" | "longBreak"

const DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

export function PomodoroWidget() {
  const [mode, setMode] = useState<PomodoroMode>("focus")
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAHj+HimH0AAH/f45uAAABx2+CaewAAadjem3sAAGba3Jl7AABj2NqWegAAYNXYlHgAAF3S1ZF2AABaztKOdAAAV8rPi3IAAFXE")
  }, [])

  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            playAlarm()
            
            if (mode === "focus") {
              setSessions((s) => s + 1)
              // After 4 sessions, take a long break
              if ((sessions + 1) % 4 === 0) {
                setMode("longBreak")
                return DURATIONS.longBreak
              } else {
                setMode("shortBreak")
                return DURATIONS.shortBreak
              }
            } else {
              setMode("focus")
              return DURATIONS.focus
            }
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, mode, sessions, playAlarm])

  const changeMode = (newMode: PomodoroMode) => {
    setMode(newMode)
    setTimeLeft(DURATIONS[newMode])
    setIsRunning(false)
  }

  const reset = () => {
    setTimeLeft(DURATIONS[mode])
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (timeLeft / DURATIONS[mode]) * 100

  return (
    <div className="h-full flex flex-col p-3">
      {/* Mode Selector */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => changeMode("focus")}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
            mode === "focus" ? "bg-red-500/80 text-white" : "bg-white/10 text-white/60"
          }`}
        >
          <Brain className="w-3 h-3" />
          Focus
        </button>
        <button
          onClick={() => changeMode("shortBreak")}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
            mode === "shortBreak" ? "bg-green-500/80 text-white" : "bg-white/10 text-white/60"
          }`}
        >
          <Coffee className="w-3 h-3" />
          Short
        </button>
        <button
          onClick={() => changeMode("longBreak")}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
            mode === "longBreak" ? "bg-blue-500/80 text-white" : "bg-white/10 text-white/60"
          }`}
        >
          <Coffee className="w-3 h-3" />
          Long
        </button>
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-2">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                mode === "focus" ? "bg-red-500" : mode === "shortBreak" ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-4xl font-light text-white text-center tabular-nums">
            {formatTime(timeLeft)}
          </div>

          <div className="text-[10px] text-white/40 text-center mt-1">
            Session {sessions + 1} / 4
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-1.5 rounded-full text-xs flex items-center gap-1 transition-colors ${
            isRunning
              ? "bg-white/20 text-white"
              : mode === "focus"
                ? "bg-red-500 text-white"
                : mode === "shortBreak"
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
          }`}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  )
}
