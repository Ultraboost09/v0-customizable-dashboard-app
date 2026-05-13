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

const getIconComponent = (iconName: string, size: string = "w-5 h-5") => {
  const iconMap: Record<string, React.ReactNode> = {
    github: <Github className={size} />,
    twitter: <Twitter className={size} />,
    youtube: <Youtube className={size} />,
    music: <Music className={size} />,
    mail: <Mail className={size} />,
    globe: <Globe className={size} />,
    chrome: <Chrome className={size} />,
    file: <FileText className={size} />,
    image: <Image className={size} />,
    folder: <Folder className={size} />,
    terminal: <Terminal className={size} />,
    code: <Code className={size} />,
    slack: <Slack className={size} />,
    linkedin: <Linkedin className={size} />,
    instagram: <Instagram className={size} />,
    facebook: <Facebook className={size} />,
  }
  return iconMap[iconName] || <Globe className={size} />
}

const availableIcons = ["github", "twitter", "youtube", "music", "mail", "globe", "chrome", "file", "image", "folder", "terminal", "code", "slack", "linkedin", "instagram", "facebook"]

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
    <div className="h-full w-full flex items-center gap-2 p-2 overflow-x-auto overflow-y-hidden">
      {/* Quick Links */}
      {quickLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group relative flex-shrink-0"
          style={{ 
            width: "clamp(32px, 8vw, 44px)", 
            height: "clamp(32px, 8vw, 44px)" 
          }}
          title={link.name}
        >
          <span className="text-white/70 group-hover:text-white">
            {getIconComponent(link.icon, "w-4 h-4")}
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
        <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg flex-shrink-0">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-14 bg-transparent text-white placeholder-white/40 outline-none"
            style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)" }}
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL"
            className="w-20 bg-transparent text-white placeholder-white/40 outline-none"
            style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)" }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            className="bg-white/10 text-white rounded px-1 py-0.5 outline-none"
            style={{ fontSize: "clamp(0.55rem, 1.2vw, 0.65rem)" }}
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
          className="rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-dashed border-white/20 flex-shrink-0"
          style={{ 
            width: "clamp(32px, 8vw, 44px)", 
            height: "clamp(32px, 8vw, 44px)" 
          }}
        >
          <Plus className="w-4 h-4 text-white/40" />
        </button>
      )}
    </div>
  )
}
