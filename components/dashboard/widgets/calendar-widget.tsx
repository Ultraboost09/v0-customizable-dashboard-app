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
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = new Date()

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

  return (
    <div className="h-full flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-xs font-medium uppercase">
            {format(currentMonth, "MMMM")}
          </span>
          <span className="text-3xl font-bold text-white">
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
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] text-white/50 font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((date, i) => {
          const isToday = isSameDay(date, today)
          const isCurrentMonth = isSameMonth(date, currentMonth)

          return (
            <div
              key={i}
              className={`
                flex items-center justify-center text-[10px] rounded
                ${isToday ? "bg-red-500 text-white font-bold" : ""}
                ${!isCurrentMonth ? "text-white/20" : "text-white/70"}
                ${isCurrentMonth && !isToday ? "hover:bg-white/10 cursor-pointer" : ""}
              `}
            >
              {format(date, "d")}
            </div>
          )
        })}
      </div>
    </div>
  )
}
