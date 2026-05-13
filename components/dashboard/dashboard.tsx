"use client"

import { useState, useEffect } from "react"
import { useDashboardStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
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
import { SystemStatsWidget } from "./widgets/system-stats-widget"
import { format } from "date-fns"
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function Dashboard() {
  const {
    mode,
    homeWidgets,
    workWidgets,
    editMode,
    loadFromSupabase,
    setUserId,
    setSpotifyAccessToken,
  } = useDashboardStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  const widgets = mode === "home" ? homeWidgets : workWidgets

  useEffect(() => {
    const supabase = createClient()
    
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || null)
        await loadFromSupabase()
      }
    }
    
    initUser()
    setMounted(true)
  }, [setUserId, loadFromSupabase])

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

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-[#1a2a4a]">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white/50">Loading...</div>
        </div>
      </div>
    )
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
      case "systemStats":
        return <SystemStatsWidget />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Image - Misty blue mountains */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
        }}
      />

      {/* Dark blue overlay for dusk effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2a4a]/50 via-[#2a3a5a]/40 to-[#1a2a4a]/70" />

      {/* Rain Effect */}
      <RainEffect />

      {/* Frosted glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* FRIDAY Title - Exact font match from reference image */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30">
        <h1
          className="text-white/95 font-medium select-none"
          style={{
            fontFamily: "var(--font-orbitron), 'Rajdhani', sans-serif",
            fontSize: "3.5rem",
            letterSpacing: "0.35em",
            textShadow: "0 4px 40px rgba(0,0,0,0.5)",
            fontWeight: 400,
          }}
        >
          {format(new Date(), "EEEE").toUpperCase()}
        </h1>
      </div>

      {/* User info & Sign out */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/20">
          <User className="w-3.5 h-3.5 text-white/70" />
          <span className="text-white/80 text-xs">{userEmail || "User"}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/20 hover:bg-white/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-white/70" />
          <span className="text-white/80 text-xs">Sign Out</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="absolute top-4 right-4 z-30">
        <ModeSwitcher onSettingsClick={() => setSettingsOpen(true)} />
      </div>

      {/* Edit Mode Indicator */}
      {editMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-blue-500/90 backdrop-blur text-white text-xs px-4 py-2 rounded-full shadow-lg">
          Edit Mode - Drag to move, corners to resize
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
            width={widget.width}
            height={widget.height}
            widgetType={widget.type}
          >
            {renderWidget(widget.type)}
          </DraggableWidget>
        ))}

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
