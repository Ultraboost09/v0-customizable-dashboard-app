"use client"

import { useState, useEffect } from "react"
import { useDashboardStore } from "@/lib/store"
import { Newspaper, RefreshCw, ExternalLink } from "lucide-react"

interface NewsItem {
  title: string
  url: string
  source: string
  publishedAt: string
}

type NewsCategory = "general" | "sports" | "technology"

export function NewsWidget() {
  const { newsApiKey } = useDashboardStore()
  const [category, setCategory] = useState<NewsCategory>("general")
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    if (!newsApiKey) {
      setError("Add your News API key in settings")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Using NewsAPI.org
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=5&apiKey=${newsApiKey}`
      )
      const data = await response.json()

      if (data.status === "error") {
        throw new Error(data.message)
      }

      setNews(
        data.articles?.map((article: { title: string; url: string; source: { name: string }; publishedAt: string }) => ({
          title: article.title,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
        })) || []
      )
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch news")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, newsApiKey])

  const categories: { key: NewsCategory; label: string }[] = [
    { key: "general", label: "General" },
    { key: "sports", label: "Sports" },
    { key: "technology", label: "Tech" },
  ]

  return (
    <div className="h-full flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-white/70" />
          <span className="text-white font-medium text-sm">News</span>
        </div>
        <button
          onClick={fetchNews}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 text-white/70 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              category === cat.key
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/50 text-xs">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/50 text-xs text-center">{error}</div>
          </div>
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/50 text-xs">No news available</div>
          </div>
        ) : (
          news.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-white/80 text-xs leading-tight line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-white/40 text-[10px] mt-1">{item.source}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
