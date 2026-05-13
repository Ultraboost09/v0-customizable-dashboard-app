"use client"

import { useDashboardStore } from "@/lib/store"
import { Home, Briefcase, Settings } from "lucide-react"

interface ModeSwitcherProps {
  onSettingsClick: () => void
}

export function ModeSwitcher({ onSettingsClick }: ModeSwitcherProps) {
  const { mode, setMode, editMode, setEditMode } = useDashboardStore()

  return (
    <div className="flex items-center gap-2">
      {/* Mode Buttons */}
      <div className="flex bg-white/10 backdrop-blur-xl rounded-full p-1">
        <button
          onClick={() => setMode("home")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
            mode === "home"
              ? "bg-white/20 text-white"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          <Home className="w-3 h-3" />
          Home
        </button>
        <button
          onClick={() => setMode("work")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
            mode === "work"
              ? "bg-white/20 text-white"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          <Briefcase className="w-3 h-3" />
          Work
        </button>
      </div>

      {/* Edit Mode Toggle */}
      <button
        onClick={() => setEditMode(!editMode)}
        className={`p-2 rounded-full transition-all ${
          editMode
            ? "bg-blue-500 text-white"
            : "bg-white/10 text-white/50 hover:text-white/70"
        }`}
        title={editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
      >
        <Settings className={`w-4 h-4 ${editMode ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
      </button>
    </div>
  )
}
