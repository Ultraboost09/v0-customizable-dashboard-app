"use client"

import { Monitor, Apple, Download, Music, Volume2, Sun, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

export default function DownloadPage() {
  const features = [
    {
      icon: Music,
      title: "Now Playing Integration",
      description: "See what's playing from Spotify, Apple Music, YouTube, or any media app on your system",
    },
    {
      icon: Volume2,
      title: "System Volume Control",
      description: "Adjust your system volume directly from the dashboard sliders",
    },
    {
      icon: Sun,
      title: "Screen Brightness",
      description: "Control your display brightness without leaving the dashboard",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2a4a] via-[#2a3a5a] to-[#1a2a4a]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-white text-5xl font-medium mb-4"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              letterSpacing: "0.2em",
            }}
          >
            FRIDAY
          </h1>
          <p className="text-white/60 text-xl mb-2">Desktop Application</p>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            Get the full desktop experience with system integration, media controls, and more.
          </p>
        </div>

        {/* Desktop app benefits */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-12">
          <h2 className="text-white text-xl font-medium mb-6 text-center">Desktop Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Windows */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Monitor className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white text-lg font-medium">Windows</h3>
                <p className="text-white/50 text-sm">Windows 10 or later</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>System media controls</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>Volume & brightness sliders</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>Native notifications</span>
              </div>
            </div>
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              onClick={() => alert("Desktop app coming soon! The web version syncs all your data across devices.")}
            >
              <Download className="w-5 h-5" />
              Download for Windows
            </button>
            <p className="text-white/30 text-xs text-center mt-2">v1.0.0 - 85 MB</p>
          </div>

          {/* macOS */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <Apple className="w-7 h-7 text-white/80" />
              </div>
              <div>
                <h3 className="text-white text-lg font-medium">macOS</h3>
                <p className="text-white/50 text-sm">macOS 11 Big Sur or later</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>Now Playing widget</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>Apple Music integration</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>Menu bar quick access</span>
              </div>
            </div>
            <button
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              onClick={() => alert("Desktop app coming soon! The web version syncs all your data across devices.")}
            >
              <Download className="w-5 h-5" />
              Download for macOS
            </button>
            <p className="text-white/30 text-xs text-center mt-2">v1.0.0 - Universal Binary - 92 MB</p>
          </div>
        </div>

        {/* Web version note */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10 p-6 text-center">
          <h3 className="text-white font-medium mb-2">Prefer the Web Version?</h3>
          <p className="text-white/50 text-sm mb-4">
            The web version works great and syncs all your data across devices. 
            The desktop app adds system-level integrations for media controls and hardware access.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Continue using web version
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* Technical info */}
        <div className="mt-12 text-center">
          <p className="text-white/30 text-xs">
            Built with Tauri for native performance. Requires no runtime dependencies.
          </p>
          <p className="text-white/20 text-xs mt-1">
            Coming soon - Sign up for early access notifications
          </p>
        </div>
      </div>
    </div>
  )
}
