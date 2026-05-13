"use client"

import { useState } from "react"
import { useDashboardStore } from "@/lib/store"
import { X, Key, Music, Newspaper, RefreshCw, Eye, EyeOff } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    newsApiKey,
    setNewsApiKey,
    spotifyClientId,
    setSpotifyClientId,
    spotifyAccessToken,
    setSpotifyAccessToken,
    homeWidgets,
    workWidgets,
    mode,
    toggleWidgetVisibility,
    resetWidgets,
  } = useDashboardStore()

  const [localNewsKey, setLocalNewsKey] = useState(newsApiKey)
  const [localSpotifyId, setLocalSpotifyId] = useState(spotifyClientId)
  const [localSpotifyToken, setLocalSpotifyToken] = useState(spotifyAccessToken)
  const [showKeys, setShowKeys] = useState(false)
  const [activeTab, setActiveTab] = useState<"api" | "widgets">("api")

  const widgets = mode === "home" ? homeWidgets : workWidgets

  if (!isOpen) return null

  const handleSave = () => {
    setNewsApiKey(localNewsKey)
    setSpotifyClientId(localSpotifyId)
    setSpotifyAccessToken(localSpotifyToken)
    onClose()
  }

  const handleSpotifyAuth = () => {
    if (!spotifyClientId) {
      alert("Please enter your Spotify Client ID first")
      return
    }

    // Spotify OAuth flow
    const redirectUri = window.location.origin
    const scopes = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
    ].join(" ")

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`

    window.open(authUrl, "_blank", "width=500,height=700")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-medium">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("api")}
            className={`flex-1 px-4 py-2 text-sm transition-colors ${
              activeTab === "api"
                ? "text-white border-b-2 border-blue-500"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab("widgets")}
            className={`flex-1 px-4 py-2 text-sm transition-colors ${
              activeTab === "widgets"
                ? "text-white border-b-2 border-blue-500"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            Widgets
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === "api" ? (
            <div className="space-y-6">
              {/* News API */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper className="w-4 h-4 text-white/70" />
                  <label className="text-white text-sm font-medium">
                    News API Key
                  </label>
                </div>
                <p className="text-white/40 text-xs mb-2">
                  Get your free API key from{" "}
                  <a
                    href="https://newsapi.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    newsapi.org
                  </a>
                </p>
                <div className="relative">
                  <input
                    type={showKeys ? "text" : "password"}
                    value={localNewsKey}
                    onChange={(e) => setLocalNewsKey(e.target.value)}
                    placeholder="Enter your News API key"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Spotify */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-green-500" />
                  <label className="text-white text-sm font-medium">
                    Spotify Integration
                  </label>
                </div>
                <p className="text-white/40 text-xs mb-2">
                  Create an app at{" "}
                  <a
                    href="https://developer.spotify.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Spotify Developer Dashboard
                  </a>
                </p>

                <div className="space-y-2">
                  <input
                    type={showKeys ? "text" : "password"}
                    value={localSpotifyId}
                    onChange={(e) => setLocalSpotifyId(e.target.value)}
                    placeholder="Spotify Client ID"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/30"
                  />

                  <input
                    type={showKeys ? "text" : "password"}
                    value={localSpotifyToken}
                    onChange={(e) => setLocalSpotifyToken(e.target.value)}
                    placeholder="Spotify Access Token (or use Auth button)"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/30"
                  />

                  <button
                    onClick={handleSpotifyAuth}
                    className="w-full bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Music className="w-4 h-4" />
                    Authenticate with Spotify
                  </button>
                </div>
              </div>

              {/* Show/Hide Keys Toggle */}
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center gap-2 text-white/50 text-xs hover:text-white/70"
              >
                {showKeys ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
                {showKeys ? "Hide" : "Show"} API keys
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/50 text-xs">
                Toggle widget visibility for {mode} mode
              </p>

              <div className="space-y-2">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                  >
                    <span className="text-white text-sm capitalize">
                      {widget.type}
                    </span>
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        widget.visible ? "bg-blue-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          widget.visible ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={resetWidgets}
                className="flex items-center gap-2 text-white/50 text-xs hover:text-white/70"
              >
                <RefreshCw className="w-3 h-3" />
                Reset widget positions
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
