"use client"

import { useState, useEffect, useCallback } from "react"
import { useDashboardStore } from "@/lib/store"
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from "lucide-react"

interface SpotifyTrack {
  name: string
  artist: string
  album: string
  albumArt: string
  isPlaying: boolean
  progress: number
  duration: number
}

export function MusicWidget() {
  const { spotifyAccessToken, spotifyClientId } = useDashboardStore()
  const [track, setTrack] = useState<SpotifyTrack | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrentTrack = useCallback(async () => {
    if (!spotifyAccessToken) return

    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      })

      if (response.status === 204) {
        setTrack(null)
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch")
      }

      const data = await response.json()
      
      if (data.item) {
        setTrack({
          name: data.item.name,
          artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
          album: data.item.album.name,
          albumArt: data.item.album.images[0]?.url || "",
          isPlaying: data.is_playing,
          progress: data.progress_ms,
          duration: data.item.duration_ms,
        })
      }
    } catch (err) {
      setError("Unable to connect")
    }
  }, [spotifyAccessToken])

  useEffect(() => {
    if (spotifyAccessToken) {
      fetchCurrentTrack()
      const interval = setInterval(fetchCurrentTrack, 3000)
      return () => clearInterval(interval)
    }
  }, [spotifyAccessToken, fetchCurrentTrack])

  const controlPlayback = async (action: "play" | "pause" | "next" | "previous") => {
    if (!spotifyAccessToken) return

    try {
      const endpoint = action === "play" || action === "pause" 
        ? `https://api.spotify.com/v1/me/player/${action}`
        : `https://api.spotify.com/v1/me/player/${action}`

      await fetch(endpoint, {
        method: action === "play" || action === "pause" ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      })

      setTimeout(fetchCurrentTrack, 500)
    } catch (err) {
      console.error("Playback control failed:", err)
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // No token state
  if (!spotifyAccessToken) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Music className="w-6 h-6 text-white/30 mx-auto mb-2" />
          <p className="text-white/40 text-xs">
            {spotifyClientId 
              ? "Connect Spotify in settings"
              : "Add Spotify Client ID in settings"}
          </p>
        </div>
      </div>
    )
  }

  // No track playing
  if (!track) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Music className="w-6 h-6 text-white/30 mx-auto mb-2" />
          <p className="text-white/40 text-xs">No track playing</p>
        </div>
      </div>
    )
  }

  const progress = (track.progress / track.duration) * 100

  return (
    <div className="h-full flex items-center gap-3 p-3">
      {/* Album Art */}
      {track.albumArt && (
        <div className="w-14 h-14 rounded bg-white/10 flex-shrink-0 overflow-hidden">
          <img 
            src={track.albumArt} 
            alt={track.album}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Track Info & Controls */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">{track.name}</div>
        <div className="text-white/50 text-xs truncate">{track.artist}</div>

        {/* Progress Bar */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-white/40 tabular-nums">
            {formatTime(track.progress)}
          </span>
          <div className="flex-1 h-1 bg-white/10 rounded-full">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-white/40 tabular-nums">
            {formatTime(track.duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => controlPlayback("previous")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
        >
          <SkipBack className="w-4 h-4 text-white" />
        </button>
        <button 
          onClick={() => controlPlayback(track.isPlaying ? "pause" : "play")}
          className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors"
        >
          {track.isPlaying ? (
            <Pause className="w-4 h-4 text-black" />
          ) : (
            <Play className="w-4 h-4 text-black ml-0.5" />
          )}
        </button>
        <button 
          onClick={() => controlPlayback("next")}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
        >
          <SkipForward className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
