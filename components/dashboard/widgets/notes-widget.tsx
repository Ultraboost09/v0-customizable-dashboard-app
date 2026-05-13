"use client"

import { useDashboardStore } from "@/lib/store"
import { format } from "date-fns"
import { StickyNote } from "lucide-react"

export function NotesWidget() {
  const { notes, setNotes } = useDashboardStore()

  return (
    <div className="h-full flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-full h-6 rounded bg-yellow-500 flex items-center px-2">
          <StickyNote className="w-3 h-3 text-black/70" />
          <span className="text-black/70 font-medium text-xs ml-1">Notes</span>
        </div>
      </div>

      {/* Notes Area */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your notes here..."
        className="flex-1 bg-transparent text-white/80 text-xs placeholder-white/40 outline-none resize-none leading-relaxed"
      />

      {/* Timestamp */}
      <div className="text-[10px] text-white/40 mt-2">
        {format(new Date(), "M/d/yyyy h:mm:ss a")}
      </div>
    </div>
  )
}
