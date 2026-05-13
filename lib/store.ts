"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createClient } from "@/lib/supabase/client"

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
  dueDate?: string
  dueTime?: string
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

export interface NowPlaying {
  title: string
  artist: string
  album: string
  artwork: string
  isPlaying: boolean
}

interface DashboardState {
  // Auth
  userId: string | null
  isLoading: boolean
  setUserId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void

  // Mode
  mode: "home" | "work"
  editMode: boolean
  setMode: (mode: "home" | "work") => void
  setEditMode: (edit: boolean) => void

  // Widgets
  homeWidgets: Widget[]
  workWidgets: Widget[]
  updateWidgetPosition: (id: string, x: number, y: number) => void
  updateWidgetSize: (id: string, width: number, height: number) => void
  toggleWidgetVisibility: (id: string) => void
  resetWidgets: () => void

  // Tasks/Reminders
  tasks: Task[]
  addTask: (text: string, category: string, dueDate?: string, dueTime?: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  editTask: (id: string, text: string, dueDate?: string, dueTime?: string) => Promise<void>

  // Notes
  notes: string
  setNotes: (notes: string) => void
  saveNotes: () => Promise<void>

  // Quick Links
  quickLinks: QuickLink[]
  addQuickLink: (link: Omit<QuickLink, "id">) => Promise<void>
  removeQuickLink: (id: string) => Promise<void>

  // Alarms
  alarms: Alarm[]
  addAlarm: (alarm: Omit<Alarm, "id">) => Promise<void>
  removeAlarm: (id: string) => Promise<void>
  toggleAlarm: (id: string) => Promise<void>
  updateAlarm: (id: string, alarm: Partial<Alarm>) => Promise<void>

  // Now Playing (Media Session API)
  nowPlaying: NowPlaying | null
  setNowPlaying: (data: NowPlaying | null) => void

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

  // Wallpaper
  customWallpaper: string | null
  setCustomWallpaper: (url: string | null) => void

  // Sync
  loadFromSupabase: () => Promise<void>
  saveToSupabase: () => Promise<void>
}

const defaultHomeWidgets: Widget[] = [
  { id: "clock", type: "clock", x: 50, y: 380, width: 240, height: 130, visible: true },
  { id: "calendar", type: "calendar", x: 900, y: 160, width: 200, height: 260, visible: true },
  { id: "weather", type: "weather", x: 1110, y: 160, width: 160, height: 140, visible: true },
  { id: "reminders", type: "reminders", x: 680, y: 160, width: 210, height: 200, visible: true },
  { id: "notes", type: "notes", x: 680, y: 370, width: 210, height: 160, visible: true },
  { id: "timer", type: "timer", x: 460, y: 370, width: 200, height: 220, visible: true },
  { id: "pomodoro", type: "pomodoro", x: 240, y: 370, width: 200, height: 220, visible: true },
  { id: "music", type: "music", x: 680, y: 540, width: 280, height: 100, visible: true },
  { id: "quicklinks", type: "quicklinks", x: 350, y: 660, width: 500, height: 70, visible: true },
  { id: "sliders", type: "sliders", x: 50, y: 530, width: 100, height: 180, visible: true },
  { id: "alarm", type: "alarm", x: 1110, y: 310, width: 160, height: 200, visible: true },
  { id: "news", type: "news", x: 900, y: 430, width: 200, height: 200, visible: true },
]

const defaultWorkWidgets: Widget[] = [
  { id: "clock", type: "clock", x: 50, y: 100, width: 280, height: 130, visible: true },
  { id: "calendar", type: "calendar", x: 50, y: 250, width: 280, height: 280, visible: true },
  { id: "reminders", type: "reminders", x: 400, y: 100, width: 350, height: 300, visible: true },
  { id: "notes", type: "notes", x: 800, y: 100, width: 350, height: 300, visible: true },
  { id: "pomodoro", type: "pomodoro", x: 400, y: 420, width: 350, height: 180, visible: true },
  { id: "timer", type: "timer", x: 800, y: 420, width: 200, height: 200, visible: true },
  { id: "news", type: "news", x: 1020, y: 420, width: 280, height: 280, visible: true },
  { id: "weather", type: "weather", x: 50, y: 550, width: 280, height: 150, visible: true },
]

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      userId: null,
      isLoading: true,
      setUserId: (userId) => set({ userId }),
      setIsLoading: (isLoading) => set({ isLoading }),

      mode: "home",
      editMode: false,
      setMode: (mode) => {
        set({ mode })
        get().saveToSupabase()
      },
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
        get().saveToSupabase()
      },

      updateWidgetSize: (id, width, height) => {
        const { mode } = get()
        if (mode === "home") {
          set({
            homeWidgets: get().homeWidgets.map((w) =>
              w.id === id ? { ...w, width, height } : w
            ),
          })
        } else {
          set({
            workWidgets: get().workWidgets.map((w) =>
              w.id === id ? { ...w, width, height } : w
            ),
          })
        }
        get().saveToSupabase()
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
        get().saveToSupabase()
      },

      resetWidgets: () => {
        const { mode } = get()
        if (mode === "home") {
          set({ homeWidgets: defaultHomeWidgets })
        } else {
          set({ workWidgets: defaultWorkWidgets })
        }
        get().saveToSupabase()
      },

      tasks: [],
      addTask: async (text, category, dueDate, dueTime) => {
        const { userId } = get()
        const newTask = { id: crypto.randomUUID(), text, completed: false, category, dueDate, dueTime }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
        
        if (userId) {
          const supabase = createClient()
          await supabase.from("reminders").insert({
            id: newTask.id,
            user_id: userId,
            title: text,
            category,
            completed: false,
            due_date: dueDate || null,
            due_time: dueTime || null,
          })
        }
      },
      toggleTask: async (id) => {
        const task = get().tasks.find(t => t.id === id)
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        }))
        
        if (get().userId && task) {
          const supabase = createClient()
          await supabase.from("reminders").update({ completed: !task.completed }).eq("id", id)
        }
      },
      deleteTask: async (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
        
        if (get().userId) {
          const supabase = createClient()
          await supabase.from("reminders").delete().eq("id", id)
        }
      },
      editTask: async (id, text, dueDate, dueTime) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, text, dueDate, dueTime } : t)),
        }))
        
        if (get().userId) {
          const supabase = createClient()
          await supabase.from("reminders").update({ 
            title: text, 
            due_date: dueDate || null,
            due_time: dueTime || null,
          }).eq("id", id)
        }
      },

      notes: "",
      setNotes: (notes) => set({ notes }),
      saveNotes: async () => {
        const { userId, notes } = get()
        if (userId) {
          const supabase = createClient()
          await supabase.from("notes").upsert({
            user_id: userId,
            content: notes,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" })
        }
      },

      quickLinks: [],
      addQuickLink: async (link) => {
        const { userId, quickLinks } = get()
        const newLink = { ...link, id: crypto.randomUUID() }
        set((state) => ({ quickLinks: [...state.quickLinks, newLink] }))
        
        if (userId) {
          const supabase = createClient()
          await supabase.from("quick_links").insert({
            id: newLink.id,
            user_id: userId,
            name: link.name,
            url: link.url,
            icon: link.icon,
            sort_order: quickLinks.length,
          })
        }
      },
      removeQuickLink: async (id) => {
        set((state) => ({ quickLinks: state.quickLinks.filter((l) => l.id !== id) }))
        
        if (get().userId) {
          const supabase = createClient()
          await supabase.from("quick_links").delete().eq("id", id)
        }
      },

      alarms: [],
      addAlarm: async (alarm) => {
        const { userId } = get()
        const newAlarm = { ...alarm, id: crypto.randomUUID() }
        set((state) => ({ alarms: [...state.alarms, newAlarm] }))
        
        if (userId) {
          const supabase = createClient()
          await supabase.from("alarms").insert({
            id: newAlarm.id,
            user_id: userId,
            time: alarm.time,
            label: alarm.label,
            enabled: alarm.enabled,
            days: alarm.days,
          })
        }
      },
      removeAlarm: async (id) => {
        set((state) => ({ alarms: state.alarms.filter((a) => a.id !== id) }))
        
        if (get().userId) {
          const supabase = createClient()
          await supabase.from("alarms").delete().eq("id", id)
        }
      },
      toggleAlarm: async (id) => {
        const alarm = get().alarms.find(a => a.id === id)
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
        }))
        
        if (get().userId && alarm) {
          const supabase = createClient()
          await supabase.from("alarms").update({ enabled: !alarm.enabled }).eq("id", id)
        }
      },
      updateAlarm: async (id, update) => {
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === id ? { ...a, ...update } : a)),
        }))
        
        if (get().userId) {
          const supabase = createClient()
          await supabase.from("alarms").update(update).eq("id", id)
        }
      },

      nowPlaying: null,
      setNowPlaying: (nowPlaying) => set({ nowPlaying }),

      newsApiKey: "",
      spotifyClientId: "",
      spotifyAccessToken: "",
      setNewsApiKey: (newsApiKey) => {
        set({ newsApiKey })
        get().saveToSupabase()
      },
      setSpotifyClientId: (spotifyClientId) => {
        set({ spotifyClientId })
        get().saveToSupabase()
      },
      setSpotifyAccessToken: (spotifyAccessToken) => set({ spotifyAccessToken }),

      volume: 70,
      brightness: 80,
      setVolume: (volume) => set({ volume }),
      setBrightness: (brightness) => set({ brightness }),

      customWallpaper: null,
      setCustomWallpaper: (customWallpaper) => {
        set({ customWallpaper })
        get().saveToSupabase()
      },

      loadFromSupabase: async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          set({ isLoading: false })
          return
        }
        
        set({ userId: user.id })

        // Load user settings (widget positions, sizes, visibility)
        const { data: settings } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (settings) {
          const homeWidgets = settings.widget_positions?.home || get().homeWidgets
          const workWidgets = settings.widget_positions?.work || get().workWidgets
          set({
            mode: settings.current_mode || "home",
            homeWidgets: Array.isArray(homeWidgets) ? homeWidgets : get().homeWidgets,
            workWidgets: Array.isArray(workWidgets) ? workWidgets : get().workWidgets,
            newsApiKey: settings.settings?.newsApiKey || "",
            spotifyClientId: settings.settings?.spotifyClientId || "",
          })
        }

        // Load reminders
        const { data: reminders } = await supabase
          .from("reminders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (reminders) {
          set({
            tasks: reminders.map(r => ({
              id: r.id,
              text: r.title,
              completed: r.completed,
              category: r.category,
              dueDate: r.due_date,
              dueTime: r.due_time,
            })),
          })
        }

        // Load quick links
        const { data: links } = await supabase
          .from("quick_links")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true })

        if (links) {
          set({ quickLinks: links })
        }

        // Load alarms
        const { data: alarms } = await supabase
          .from("alarms")
          .select("*")
          .eq("user_id", user.id)

        if (alarms) {
          set({ alarms })
        }

        // Load notes
        const { data: notes } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (notes) {
          set({ notes: notes.content })
        }

        set({ isLoading: false })
      },

      saveToSupabase: async () => {
        const { userId, mode, homeWidgets, workWidgets, newsApiKey, spotifyClientId } = get()
        
        if (!userId) return

        const supabase = createClient()
        await supabase.from("user_settings").upsert({
          user_id: userId,
          current_mode: mode,
          widget_positions: { home: homeWidgets, work: workWidgets },
          settings: { newsApiKey, spotifyClientId },
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
      },
    }),
    {
      name: "friday-dashboard-storage",
      partialize: (state) => ({
        mode: state.mode,
        homeWidgets: state.homeWidgets,
        workWidgets: state.workWidgets,
        tasks: state.tasks,
        notes: state.notes,
        quickLinks: state.quickLinks,
        alarms: state.alarms,
        newsApiKey: state.newsApiKey,
        spotifyClientId: state.spotifyClientId,
        volume: state.volume,
        brightness: state.brightness,
      }),
    }
  )
)
