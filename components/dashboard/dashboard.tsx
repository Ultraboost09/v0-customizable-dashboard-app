"use client"

import { useState, useEffect } from "react"
import { useDashboardStore } from "@/lib/store"
import { RainEffect } from "./rain-effect"
import { DraggableWidget } from "./draggable-widget"
import { SettingsModal } from "./settings-modal"
import { ModeSwitcher } from "./mode-switcher"
import { ClockWidget } from "./widgets/clock-widget"
import { CalendarWidget } from "./widgets/calendar-widget"
import { WeatherWidget } from "./widgets/weather-widget"
import { RemindersWidget } from "./widgets/reminders-widget"
import { NotesWidget } from "./widgets/notes-widget"
import { TimerWidget } from "./widgets/timer-widget"
import { PomodoroWidget } from "./widgets/pomodoro-widget"
import { AlarmWidget } from "./widgets/alarm-widget"
import { NewsWidget } from "./widgets/news-widget"
import { MusicWidget } from "./widgets/music-widget"
import { QuickLinksWidget } from "./widgets/quicklinks-widget"
import { SlidersWidget } from "./widgets/sliders-widget"
import { format } from "date-fns"

export function Dashboard() {
  const {
    mode,
    homeWidgets,
    workWidgets,
    editMode,
    setSpotifyAccessToken,
  } = useDashboardStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const widgets = mode === "home" ? homeWidgets : workWidgets

  // Handle Spotify OAuth callback
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1))
      const token = params.get("access_token")
      if (token) {
        setSpotifyAccessToken(token)
        window.history.replaceState(null, "", window.location.pathname)
      }
    }
  }, [setSpotifyAccessToken])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-[#1a2a4a]">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white/50">Loading...</div>
        </div>
      </div>
    )
  }

  const widgetSizes: Record<string, { width: number; height: number }> = {
    clock: { width: 280, height: 120 },
    calendar: { width: 220, height: 260 },
    weather: { width: 180, height: 160 },
    reminders: { width: 220, height: 200 },
    notes: { width: 220, height: 200 },
    timer: { width: 200, height: 280 },
    pomodoro: { width: 260, height: 160 },
    alarm: { width: 200, height: 200 },
    news: { width: 280, height: 300 },
    music: { width: 320, height: 80 },
    quicklinks: { width: 400, height: 60 },
    sliders: { width: 120, height: 200 },
  }

  const renderWidget = (type: string) => {
    switch (type) {
      case "clock":
        return <ClockWidget onSettingsClick={() => setSettingsOpen(true)} />
      case "calendar":
        return <CalendarWidget />
      case "weather":
        return <WeatherWidget />
      case "reminders":
        return <RemindersWidget />
      case "notes":
        return <NotesWidget />
      case "timer":
        return <TimerWidget />
      case "pomodoro":
        return <PomodoroWidget />
      case "alarm":
        return <AlarmWidget />
      case "news":
        return <NewsWidget />
      case "music":
        return <MusicWidget />
      case "quicklinks":
        return <QuickLinksWidget />
      case "sliders":
        return <SlidersWidget />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2a4a]/40 via-[#1a2a4a]/30 to-[#1a2a4a]/60" />

      {/* Rain Effect */}
      <RainEffect />

      {/* Glass Overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {/* FRIDAY Title */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30">
        <h1
          className="text-5xl tracking-[0.4em] text-white/90 font-light"
          style={{
            fontFamily: "var(--font-orbitron), var(--font-rajdhani), sans-serif",
            textShadow: "0 2px 30px rgba(0,0,0,0.4)",
          }}
        >
          {format(new Date(), "EEEE").toUpperCase()}
        </h1>
      </div>

      {/* Mode Switcher */}
      <div className="absolute top-4 right-4 z-30">
        <ModeSwitcher onSettingsClick={() => setSettingsOpen(true)} />
      </div>

      {/* Edit Mode Indicator */}
      {editMode && (
        <div className="absolute top-4 left-4 z-30 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full">
          Edit Mode - Drag widgets to reposition
        </div>
      )}

      {/* Widgets */}
      {widgets
        .filter((widget) => widget.visible)
        .map((widget) => (
          <DraggableWidget
            key={`${mode}-${widget.id}`}
            id={widget.id}
            x={widget.x}
            y={widget.y}
          >
            <div
              style={{
                width: widgetSizes[widget.type]?.width || 200,
                height: widgetSizes[widget.type]?.height || 150,
              }}
            >
              {renderWidget(widget.type)}
            </div>
          </DraggableWidget>
        ))}

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
