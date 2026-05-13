"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useDashboardStore } from "@/lib/store"

export function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const today = new Date()
  const { tasks } = useDashboardStore()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = startDate
  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"]

  // Get reminders for a specific date
  const getRemindersForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      try {
        const taskDate = parseISO(task.dueDate)
        return isSameDay(taskDate, date)
      } catch {
        return false
      }
    })
  }

  // Check if date has reminders
  const hasReminders = (date: Date) => {
    return getRemindersForDate(date).length > 0
  }

  return (
    <div className="h-full w-full flex flex-col p-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span 
            className="text-red-400 font-medium uppercase"
            style={{ fontSize: "clamp(0.6rem, 2vw, 0.75rem)" }}
          >
            {format(currentMonth, "MMMM")}
          </span>
          <span 
            className="font-bold text-white"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)" }}
          >
            {format(today, "d")}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-white/70" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1 flex-shrink-0">
        {weekDays.map((d, i) => (
          <div
            key={i}
            className="text-center text-white/50 font-medium"
            style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-0.5 flex-1 min-h-0">
        {days.map((date, i) => {
          const isToday = isSameDay(date, today)
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const dateReminders = getRemindersForDate(date)
          const hasRems = dateReminders.length > 0
          const isHovered = hoveredDate && isSameDay(date, hoveredDate)

          return (
            <div
              key={i}
              className={`
                relative flex flex-col items-center justify-center rounded cursor-pointer transition-colors
                ${isToday ? "bg-red-500 text-white font-bold" : ""}
                ${!isCurrentMonth ? "text-white/20" : "text-white/70"}
                ${isCurrentMonth && !isToday ? "hover:bg-white/10" : ""}
              `}
              style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.65rem)" }}
              onMouseEnter={() => hasRems && setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {format(date, "d")}
              {/* Reminder dot indicator */}
              {hasRems && (
                <div 
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    isToday ? "bg-white" : "bg-blue-400"
                  }`}
                />
              )}
              
              {/* Reminder tooltip on hover */}
              {isHovered && dateReminders.length > 0 && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-900/95 backdrop-blur rounded-lg p-2 shadow-xl border border-white/10">
                  <div className="text-white/60 text-[9px] mb-1 font-medium">
                    {format(date, "MMM d")} - {dateReminders.length} reminder{dateReminders.length > 1 ? "s" : ""}
                  </div>
                  {dateReminders.slice(0, 3).map((rem, idx) => (
                    <div key={idx} className="text-white/90 text-[10px] truncate py-0.5">
                      {rem.completed ? "✓ " : "• "}{rem.text}
                    </div>
                  ))}
                  {dateReminders.length > 3 && (
                    <div className="text-white/50 text-[9px]">
                      +{dateReminders.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
