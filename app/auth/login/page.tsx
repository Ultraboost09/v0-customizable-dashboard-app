"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Initialize the client once inside state to prevent re-renders and build crashes
  const [supabase] = useState(() => createClient())

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #1a2a4a 0%, #2d4a6a 50%, #3d5a7a 100%)",
      }}
    >
      {/* Background mountains */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px)",
        }}
      />
      
      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div 
          className="rounded-3xl p-8 backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* FRIDAY Logo */}
          <h1 
            className="text-4xl text-center text-white/90 mb-2 tracking-[0.3em]"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            FRIDAY
          </h1>
          <p className="text-white/50 text-center text-sm mb-8">Personal Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                placeholder="Your password"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backdropFilter: "blur(10px)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-white/50 text-center text-sm mt-6">
            {"Don't have an account? "}
            <Link href="/auth/sign-up" className="text-white/80 hover:text-white underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
