"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WidgetType =
  | "clock"
  | "calendar"
  | "weather"
  | "reminders"
  | "notes"
  | "timer"
  | "pomodoro"
  | "news"
  | "music"
  | "quicklinks"
  | "sliders"
  | "alarm"

export interface Widget {
  id: string
  type: WidgetType
  x: number
  y: number
  width: number
  height: number
  visible: boolean
}

export interface Task {
  id: string
  text: string
  completed: boolean
  category: string
}

export interface QuickLink {
  id: string
  name: string
  url: string
  icon: string
}

export interface Alarm {
  id: string
  time: string
  label: string
  enabled: boolean
  days: number[]
}

interface DashboardState {
  // Mode
  mode: "home" | "work"
  editMode: boolean
  setMode: (mode: "home" | "work") => void
  setEditMode: (edit: boolean) => void

  // Widgets
  homeWidgets: Widget[]
  workWidgets: Widget[]
  updateWidgetPosition: (id: string, x: number, y: number) => void
  toggleWidgetVisibility: (id: string) => void
  resetWidgets: () => void

  // Tasks/Reminders
  tasks: Task[]
  addTask: (text: string, category: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  editTask: (id: string, text: string) => void

  // Notes
  notes: string
  setNotes: (notes: string) => void

  // Quick Links
  quickLinks: QuickLink[]
  addQuickLink: (link: Omit<QuickLink, "id">) => void
  removeQuickLink: (id: string) => void

  // Alarms
  alarms: Alarm[]
  addAlarm: (alarm: Omit<Alarm, "id">) => void
  removeAlarm: (id: string) => void
  toggleAlarm: (id: string) => void
  updateAlarm: (id: string, alarm: Partial<Alarm>) => void

  // Settings
  newsApiKey: string
  spotifyClientId: string
  spotifyAccessToken: string
  setNewsApiKey: (key: string) => void
  setSpotifyClientId: (id: string) => void
  setSpotifyAccessToken: (token: string) => void

  // System
  volume: number
  brightness: number
  setVolume: (vol: number) => void
  setBrightness: (bright: number) => void
}

const defaultHomeWidgets: Widget[] = [
  { id: "clock", type: "clock", x: 50, y: 400, width: 280, height: 120, visible: true },
  { id: "calendar", type: "calendar", x: 900, y: 180, width: 220, height: 240, visible: true },
  { id: "weather", type: "weather", x: 1130, y: 180, width: 140, height: 120, visible: true },
  { id: "reminders", type: "reminders", x: 900, y: 430, width: 200, height: 180, visible: true },
  { id: "notes", type: "notes", x: 1110, y: 430, width: 200, height: 180, visible: true },
  { id: "timer", type: "timer", x: 600, y: 350, width: 180, height: 200, visible: true },
  { id: "pomodoro", type: "pomodoro", x: 600, y: 560, width: 180, height: 100, visible: true },
  { id: "music", type: "music", x: 800, y: 650, width: 280, height: 80, visible: true },
  { id: "quicklinks", type: "quicklinks", x: 400, y: 700, width: 380, height: 60, visible: true },
  { id: "sliders", type: "sliders", x: 50, y: 550, width: 100, height: 200, visible: true },
  { id: "alarm", type: "alarm", x: 350, y: 350, width: 200, height: 180, visible: true },
]

const defaultWorkWidgets: Widget[] = [
  { id: "clock", type: "clock", x: 50, y: 100, width: 280, height: 120, visible: true },
  { id: "calendar", type: "calendar", x: 50, y: 250, width: 280, height: 280, visible: true },
  { id: "reminders", type: "reminders", x: 400, y: 100, width: 350, height: 300, visible: true },
  { id: "notes", type: "notes", x: 800, y: 100, width: 350, height: 300, visible: true },
  { id: "pomodoro", type: "pomodoro", x: 400, y: 420, width: 350, height: 150, visible: true },
  { id: "timer", type: "timer", x: 800, y: 420, width: 200, height: 200, visible: true },
  { id: "news", type: "news", x: 1020, y: 420, width: 280, height: 280, visible: true },
  { id: "weather", type: "weather", x: 50, y: 550, width: 280, height: 150, visible: true },
]

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      mode: "home",
      editMode: false,
      setMode: (mode) => set({ mode }),
      setEditMode: (editMode) => set({ editMode }),

      homeWidgets: defaultHomeWidgets,
      workWidgets: defaultWorkWidgets,

      updateWidgetPosition: (id, x, y) => {
        const { mode } = get()
        if (mode === "home") {
          set({
            homeWidgets: get().homeWidgets.map((w) =>
              w.id === id ? { ...w, x, y } : w
            ),
          })
        } else {
          set({
            workWidgets: get().workWidgets.map((w) =>
              w.id === id ? { ...w, x, y } : w
            ),
          })
        }
      },

      toggleWidgetVisibility: (id) => {
        const { mode } = get()
        if (mode === "home") {
          set({
            homeWidgets: get().homeWidgets.map((w) =>
              w.id === id ? { ...w, visible: !w.visible } : w
            ),
          })
        } else {
          set({
            workWidgets: get().workWidgets.map((w) =>
              w.id === id ? { ...w, visible: !w.visible } : w
            ),
          })
        }
      },

      resetWidgets: () => {
        const { mode } = get()
        if (mode === "home") {
          set({ homeWidgets: defaultHomeWidgets })
        } else {
          set({ workWidgets: defaultWorkWidgets })
        }
      },

      tasks: [
        { id: "1", text: "Review project proposal", completed: false, category: "Work" },
        { id: "2", text: "Buy groceries", completed: true, category: "Personal" },
        { id: "3", text: "Call dentist", completed: false, category: "Personal" },
      ],
      addTask: (text, category) =>
        set((state) => ({
          tasks: [...state.tasks, { id: crypto.randomUUID(), text, completed: false, category }],
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      editTask: (id, text) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, text } : t)),
        })),

      notes: "Your text won't erase\nif you switch to another app.",
      setNotes: (notes) => set({ notes }),

      quickLinks: [
        { id: "1", name: "GitHub", url: "https://github.com", icon: "github" },
        { id: "2", name: "Twitter", url: "https://twitter.com", icon: "twitter" },
        { id: "3", name: "YouTube", url: "https://youtube.com", icon: "youtube" },
        { id: "4", name: "Spotify", url: "https://spotify.com", icon: "music" },
        { id: "5", name: "Gmail", url: "https://gmail.com", icon: "mail" },
      ],
      addQuickLink: (link) =>
        set((state) => ({
          quickLinks: [...state.quickLinks, { ...link, id: crypto.randomUUID() }],
        })),
      removeQuickLink: (id) =>
        set((state) => ({
          quickLinks: state.quickLinks.filter((l) => l.id !== id),
        })),

      alarms: [],
      addAlarm: (alarm) =>
        set((state) => ({
          alarms: [...state.alarms, { ...alarm, id: crypto.randomUUID() }],
        })),
      removeAlarm: (id) =>
        set((state) => ({
          alarms: state.alarms.filter((a) => a.id !== id),
        })),
      toggleAlarm: (id) =>
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
        })),
      updateAlarm: (id, update) =>
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === id ? { ...a, ...update } : a)),
        })),

      newsApiKey: "",
      spotifyClientId: "",
      spotifyAccessToken: "",
      setNewsApiKey: (newsApiKey) => set({ newsApiKey }),
      setSpotifyClientId: (spotifyClientId) => set({ spotifyClientId }),
      setSpotifyAccessToken: (spotifyAccessToken) => set({ spotifyAccessToken }),

      volume: 70,
      brightness: 80,
      setVolume: (volume) => set({ volume }),
      setBrightness: (brightness) => set({ brightness }),
    }),
    {
      name: "friday-dashboard-storage",
    }
  )
)
