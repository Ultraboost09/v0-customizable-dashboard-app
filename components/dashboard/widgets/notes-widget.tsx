"use client"

import { useDashboardStore } from "@/lib/store"
import { format } from "date-fns"
import { StickyNote } from "lucide-react"

export function NotesWidget() {
  const { notes, setNotes } = useDashboardStore()

  return (
    <div className="h-full w-full flex flex-col p-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <div className="w-full h-6 rounded bg-yellow-500 flex items-center px-2">
          <StickyNote className="w-3 h-3 text-black/70 flex-shrink-0" />
          <span 
            className="text-black/70 font-medium ml-1 truncate"
            style={{ fontSize: "clamp(0.65rem, 2vw, 0.75rem)" }}
          >
            Notes
          </span>
        </div>
      </div>

      {/* Notes Area */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your notes here..."
        className="flex-1 bg-transparent text-white/80 placeholder-white/40 outline-none resize-none leading-relaxed min-h-0"
        style={{ fontSize: "clamp(0.65rem, 2vw, 0.75rem)" }}
      />

      {/* Timestamp */}
      <div 
        className="text-white/40 mt-2 flex-shrink-0"
        style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)" }}
      >
        {format(new Date(), "M/d/yyyy h:mm a")}
      </div>
    </div>
  )
}
