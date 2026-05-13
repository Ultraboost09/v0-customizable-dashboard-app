"use client"

import { useState, useEffect } from "react"
import { Download, Monitor, Apple, Check, Smartphone, Globe, Zap, Cloud, Bell, Layout, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [platform, setPlatform] = useState<"windows" | "mac" | "ios" | "android" | "other">("other")
  const [browser, setBrowser] = useState<"chrome" | "edge" | "safari" | "firefox" | "other">("other")

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    
    // Detect platform
    if (ua.includes("win")) setPlatform("windows")
    else if (ua.includes("mac") && !ua.includes("iphone") && !ua.includes("ipad")) setPlatform("mac")
    else if (ua.includes("iphone") || ua.includes("ipad")) setPlatform("ios")
    else if (ua.includes("android")) setPlatform("android")

    // Detect browser
    if (ua.includes("edg/")) setBrowser("edge")
    else if (ua.includes("chrome")) setBrowser("chrome")
    else if (ua.includes("safari") && !ua.includes("chrome")) setBrowser("safari")
    else if (ua.includes("firefox")) setBrowser("firefox")

    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Listen for the install prompt
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    setIsInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsInstalled(true)
      }
    } finally {
      setDeferredPrompt(null)
      setIsInstalling(false)
    }
  }

  const features = [
    { icon: Layout, title: "Full Dashboard", desc: "All widgets work exactly like the web" },
    { icon: Cloud, title: "Cloud Sync", desc: "Data syncs across all your devices" },
    { icon: Bell, title: "Notifications", desc: "Alarm and reminder alerts" },
    { icon: Zap, title: "Instant Launch", desc: "Opens fast like a native app" },
  ]

  const getInstallInstructions = () => {
    if (platform === "ios") {
      return (
        <ol className="space-y-3 text-white/80">
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
            <span>Tap the <strong>Share</strong> button at the bottom of Safari</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
            <span>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
            <span>Tap <strong>Add</strong> in the top right</span>
          </li>
        </ol>
      )
    }

    if (platform === "android") {
      return (
        <ol className="space-y-3 text-white/80">
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
            <span>Tap the <strong>menu</strong> (three dots) in Chrome</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
            <span>Tap <strong>&quot;Add to Home screen&quot;</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
            <span>Tap <strong>Add</strong></span>
          </li>
        </ol>
      )
    }

    if (browser === "safari" && platform === "mac") {
      return (
        <ol className="space-y-3 text-white/80">
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
            <span>Click <strong>File</strong> in the menu bar</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
            <span>Click <strong>&quot;Add to Dock&quot;</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
            <span>Click <strong>Add</strong> to install</span>
          </li>
        </ol>
      )
    }

    if (browser === "chrome" || browser === "edge") {
      return (
        <ol className="space-y-3 text-white/80">
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
            <span>Look for the <strong>install icon</strong> in the address bar (right side)</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
            <span>Click it and select <strong>&quot;Install&quot;</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
            <span>The app will open in its own window</span>
          </li>
        </ol>
      )
    }

    return (
      <ol className="space-y-3 text-white/80">
        <li className="flex gap-3">
          <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
          <span>Open the browser menu (three dots or lines)</span>
        </li>
        <li className="flex gap-3">
          <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
          <span>Look for <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong></span>
        </li>
        <li className="flex gap-3">
          <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
          <span>Follow the prompts to install</span>
        </li>
      </ol>
    )
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case "mac": return <Apple className="w-10 h-10" />
      case "windows": return <Monitor className="w-10 h-10" />
      case "ios": case "android": return <Smartphone className="w-10 h-10" />
      default: return <Globe className="w-10 h-10" />
    }
  }

  const getPlatformName = () => {
    switch (platform) {
      case "mac": return "macOS"
      case "windows": return "Windows"
      case "ios": return "iPhone/iPad"
      case "android": return "Android"
      default: return "Desktop"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2a4a] via-[#1e3a5f] to-[#1a2a4a] text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="text-center mb-10">
          <h1 
            className="text-4xl font-light tracking-[0.3em] mb-3"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            FRIDAY
          </h1>
          <p className="text-white/60">Install as an app on your device</p>
        </div>

        {/* Main Install Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center">
              {getPlatformIcon()}
            </div>
            <div>
              <h2 className="text-xl font-medium">Install for {getPlatformName()}</h2>
              <p className="text-white/50 text-sm">
                {isInstalled ? "Already installed on this device" : "Free, no app store needed"}
              </p>
            </div>
          </div>

          {isInstalled ? (
            <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
              <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-400">FRIDAY is installed!</p>
                <p className="text-sm text-white/60">Find it in your apps or dock</p>
              </div>
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {isInstalling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Install Now
                </>
              )}
            </button>
          ) : (
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-white/70 text-sm mb-4 font-medium">Follow these steps:</p>
              {getInstallInstructions()}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <f.icon className="w-6 h-6 mb-2 text-blue-400" />
              <h3 className="font-medium text-sm mb-0.5">{f.title}</h3>
              <p className="text-xs text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 text-center">
          <p className="text-sm text-white/70">
            This installs as a <strong>Progressive Web App</strong> - it works offline, 
            syncs your data, and runs like a native application.
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          Works on Windows, macOS, Linux, iOS, and Android
        </p>
      </div>
    </div>
  )
}
