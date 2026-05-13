"use client"

import { useState } from "react"
import { useDashboardStore } from "@/lib/store"
import {
  Plus,
  X,
  Github,
  Twitter,
  Youtube,
  Music,
  Mail,
  Globe,
  Chrome,
  FileText,
  Image,
  Folder,
  Terminal,
  Code,
  Slack,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  github: <Github className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  music: <Music className="w-5 h-5" />,
  mail: <Mail className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  chrome: <Chrome className="w-5 h-5" />,
  file: <FileText className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  folder: <Folder className="w-5 h-5" />,
  terminal: <Terminal className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  slack: <Slack className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  facebook: <Facebook className="w-5 h-5" />,
}

const availableIcons = Object.keys(iconMap)

export function QuickLinksWidget() {
  const { quickLinks, addQuickLink, removeQuickLink } = useDashboardStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newIcon, setNewIcon] = useState("globe")

  const handleAdd = () => {
    if (newName.trim() && newUrl.trim()) {
      let url = newUrl.trim()
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url
      }
      addQuickLink({ name: newName.trim(), url, icon: newIcon })
      setNewName("")
      setNewUrl("")
      setNewIcon("globe")
      setShowAdd(false)
    }
  }

  return (
    <div className="h-full flex items-center gap-2 p-2">
      {/* Quick Links */}
      {quickLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group relative"
          title={link.name}
        >
          <span className="text-white/70 group-hover:text-white">
            {iconMap[link.icon] || <Globe className="w-5 h-5" />}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              removeQuickLink(link.id)
            }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex"
          >
            <X className="w-2 h-2 text-white" />
          </button>
        </a>
      ))}

      {/* Add Button / Form */}
      {showAdd ? (
        <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-16 bg-transparent text-white text-xs placeholder-white/40 outline-none"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL"
            className="w-24 bg-transparent text-white text-xs placeholder-white/40 outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            className="bg-white/10 text-white text-xs rounded px-1 py-0.5 outline-none"
          >
            {availableIcons.map((icon) => (
              <option key={icon} value={icon} className="bg-gray-800">
                {icon}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="p-1 bg-blue-500 rounded text-white"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setShowAdd(false)}
            className="p-1 hover:bg-white/10 rounded text-white/70"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-dashed border-white/20"
        >
          <Plus className="w-4 h-4 text-white/40" />
        </button>
      )}
    </div>
  )
}
