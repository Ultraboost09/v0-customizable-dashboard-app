"use client"

import { useState } from "react"
import { useDashboardStore } from "@/lib/store"
import { Plus, Trash2, Check, X, Edit2, Calendar, Clock } from "lucide-react"
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns"

export function RemindersWidget() {
  const { tasks, addTask, toggleTask, deleteTask, editTask } = useDashboardStore()
  const [newTask, setNewTask] = useState("")
  const [newCategory, setNewCategory] = useState("Personal")
  const [newDueDate, setNewDueDate] = useState("")
  const [newDueTime, setNewDueTime] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  const categories = ["Personal", "Work", "Shopping", "Health"]
  
  // Sort tasks: incomplete first, then by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return 0
  })

  const displayTasks = sortedTasks.slice(0, 6)
  const completedCount = tasks.filter((t) => t.completed).length

  const handleAdd = async () => {
    if (newTask.trim()) {
      await addTask(newTask.trim(), newCategory, newDueDate || undefined, newDueTime || undefined)
      setNewTask("")
      setNewDueDate("")
      setNewDueTime("")
      setShowAdd(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (editText.trim()) {
      const task = tasks.find(t => t.id === id)
      await editTask(id, editText.trim(), task?.dueDate, task?.dueTime)
      setEditingId(null)
    }
  }

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null
    const date = parseISO(dueDate)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM d")
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return isPast(parseISO(dueDate)) && !isToday(parseISO(dueDate))
  }

  return (
    <div className="h-full flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-medium text-sm">Reminders</span>
          {completedCount > 0 && (
            <span className="text-[10px] text-white/40 bg-white/10 px-1.5 py-0.5 rounded">
              {completedCount} done
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`p-1 rounded transition-colors ${showAdd ? "bg-white/20" : "hover:bg-white/10"}`}
        >
          {showAdd ? <X className="w-4 h-4 text-white/70" /> : <Plus className="w-4 h-4 text-white/70" />}
        </button>
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <div className="mb-2 p-2 bg-white/5 rounded-lg border border-white/10">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New reminder..."
            className="w-full bg-transparent text-white text-xs placeholder-white/40 outline-none mb-2"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          
          {/* Due Date & Time */}
          <div className="flex gap-2 mb-2">
            <div className="flex items-center gap-1 flex-1">
              <Calendar className="w-3 h-3 text-white/40" />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="flex-1 bg-white/5 text-white/80 text-[10px] px-2 py-1 rounded outline-none border border-white/10"
              />
            </div>
            <div className="flex items-center gap-1 flex-1">
              <Clock className="w-3 h-3 text-white/40" />
              <input
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="flex-1 bg-white/5 text-white/80 text-[10px] px-2 py-1 rounded outline-none border border-white/10"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex gap-1 flex-wrap mb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                  newCategory === cat 
                    ? "bg-blue-500 text-white" 
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleAdd}
            disabled={!newTask.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-xs py-1.5 rounded transition-colors"
          >
            Add Reminder
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
        {displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Check className="w-6 h-6 text-white/20 mb-2" />
            <p className="text-white/40 text-xs">No reminders</p>
            <p className="text-white/30 text-[10px]">Tap + to add one</p>
          </div>
        ) : (
          displayTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-2 p-1.5 rounded-lg group transition-colors ${
                task.completed ? "opacity-50" : "hover:bg-white/5"
              } ${isOverdue(task.dueDate) && !task.completed ? "bg-red-500/10" : ""}`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  task.completed 
                    ? "bg-green-500 border-green-500" 
                    : "border-white/30 hover:border-white/50 hover:bg-white/10"
                }`}
              >
                {task.completed && <Check className="w-2.5 h-2.5 text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                {editingId === task.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => handleEdit(task.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleEdit(task.id)}
                    className="w-full bg-transparent text-white text-xs outline-none"
                    autoFocus
                  />
                ) : (
                  <>
                    <span
                      className={`text-xs block truncate ${
                        task.completed ? "line-through text-white/40" : "text-white/90"
                      }`}
                    >
                      {task.text}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-white/40 bg-white/5 px-1 py-0.5 rounded">
                        {task.category}
                      </span>
                      {task.dueDate && (
                        <span className={`text-[9px] flex items-center gap-0.5 ${
                          isOverdue(task.dueDate) && !task.completed 
                            ? "text-red-400" 
                            : "text-white/40"
                        }`}>
                          <Calendar className="w-2 h-2" />
                          {formatDueDate(task.dueDate)}
                          {task.dueTime && ` ${task.dueTime}`}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                <button
                  onClick={() => {
                    setEditingId(task.id)
                    setEditText(task.text)
                  }}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Edit2 className="w-2.5 h-2.5 text-white/50" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Trash2 className="w-2.5 h-2.5 text-red-400/70" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {tasks.length > 6 && (
        <div className="text-[10px] text-white/40 mt-1 pt-1 border-t border-white/10">
          +{tasks.length - 6} more reminders
        </div>
      )}
    </div>
  )
}
