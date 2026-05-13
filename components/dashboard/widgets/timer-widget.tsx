"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react"

export function TimerWidget() {
  const [mode, setMode] = useState<"timer" | "stopwatch">("timer")
  const [timerMinutes, setTimerMinutes] = useState(3)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60 + timerSeconds)
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element for alarm
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAHj+HimH0AAH/f45uAAABx2+CaewAAadjem3sAAGba3Jl7AABj2NqWegAAYNXYlHgAAF3S1ZF2AABaztKOdAAAV8rPi3IAAFXE" )
  }, [])

  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === "timer") {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsRunning(false)
              playAlarm()
              return 0
            }
            return prev - 1
          })
        } else {
          setStopwatchTime((prev) => prev + 1)
        }
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, mode, playAlarm])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const adjustTime = (delta: number) => {
    if (!isRunning && mode === "timer") {
      const newMinutes = Math.max(0, Math.min(99, timerMinutes + delta))
      setTimerMinutes(newMinutes)
      setTimeLeft(newMinutes * 60 + timerSeconds)
    }
  }

  const reset = () => {
    setIsRunning(false)
    if (mode === "timer") {
      setTimeLeft(timerMinutes * 60 + timerSeconds)
    } else {
      setStopwatchTime(0)
    }
  }

  const progress = mode === "timer" 
    ? (timeLeft / (timerMinutes * 60 + timerSeconds)) * 100 
    : 0

  const circumference = 2 * Math.PI * 70

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            setMode("timer")
            setIsRunning(false)
          }}
          className={`text-[10px] px-2 py-0.5 rounded ${
            mode === "timer" ? "bg-white/20 text-white" : "text-white/50"
          }`}
        >
          Timer
        </button>
        <button
          onClick={() => {
            setMode("stopwatch")
            setIsRunning(false)
          }}
          className={`text-[10px] px-2 py-0.5 rounded ${
            mode === "stopwatch" ? "bg-white/20 text-white" : "text-white/50"
          }`}
        >
          Stopwatch
        </button>
      </div>

      {/* Circular Timer */}
      <div className="relative">
        <svg width="160" height="160" className="transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          {mode === "timer" && (
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          )}
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-light text-white tabular-nums">
            {mode === "timer" ? formatTime(timeLeft) : formatTime(stopwatchTime)}
          </span>
        </div>
      </div>

      {/* Time Adjusters */}
      {mode === "timer" && !isRunning && (
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => adjustTime(-1)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Minus className="w-4 h-4 text-white/60" />
          </button>
          <span className="text-white/60 text-xs">{timerMinutes} min</span>
          <button
            onClick={() => adjustTime(1)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Plus className="w-4 h-4 text-white/60" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          {isRunning ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
