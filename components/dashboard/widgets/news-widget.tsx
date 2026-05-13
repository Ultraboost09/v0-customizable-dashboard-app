"use client"

import { useState, useEffect, useCallback } from "react"
import { Newspaper, RefreshCw, ExternalLink } from "lucide-react"

interface NewsItem {
  title: string
  url: string
  source: string
  time: string
}

type NewsCategory = "general" | "tech" | "sports"

// US News RSS feeds (no API key needed)
const RSS_FEEDS: Record<NewsCategory, { name: string; url: string }[]> = {
  general: [
    { name: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
    { name: "AP News", url: "https://rsshub.app/apnews/topics/apf-topnews" },
    { name: "USA Today", url: "https://rsshub.app/usatoday/news/nation" },
  ],
  tech: [
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
  ],
  sports: [
    { name: "ESPN", url: "https://www.espn.com/espn/rss/news" },
    { name: "CBS Sports", url: "https://www.cbssports.com/rss/headlines/" },
  ],
}

// RSS to JSON converter proxy (free, no API key needed)
const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url="

export function NewsWidget() {
  const [category, setCategory] = useState<NewsCategory>("general")
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNews = useCallback(async () => {
    setLoading(true)

    try {
      const feeds = RSS_FEEDS[category]
      const allNews: NewsItem[] = []

      // Fetch from multiple sources
      await Promise.all(
        feeds.map(async (feed) => {
          try {
            const response = await fetch(`${RSS_PROXY}${encodeURIComponent(feed.url)}`)
            const data = await response.json()

            if (data.status === "ok" && data.items) {
              data.items.slice(0, 3).forEach((item: { title: string; link: string; pubDate: string }) => {
                allNews.push({
                  title: item.title,
                  url: item.link,
                  source: feed.name,
                  time: formatTimeAgo(new Date(item.pubDate)),
                })
              })
            }
          } catch {
            // Silently fail for individual feeds
          }
        })
      )

      if (allNews.length === 0) {
        setNews(getDemoNews(category))
      } else {
        // Shuffle and take top 6
        const shuffled = allNews.sort(() => Math.random() - 0.5)
        setNews(shuffled.slice(0, 6))
      }
      setLoading(false)
    } catch {
      setNews(getDemoNews(category))
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const categories: { key: NewsCategory; label: string }[] = [
    { key: "general", label: "US News" },
    { key: "tech", label: "Tech" },
    { key: "sports", label: "Sports" },
  ]

  return (
    <div className="h-full w-full flex flex-col p-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-white/70 flex-shrink-0" />
          <span className="text-white font-medium" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>News</span>
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
      <div className="flex gap-1 mb-2 flex-shrink-0">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              category === cat.key
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
            }`}
            style={{ fontSize: "clamp(0.5rem, 1.5vw, 0.625rem)" }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-4 h-4 text-white/30 animate-spin" />
          </div>
        ) : (
          news.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-white/90 leading-tight line-clamp-2 font-medium"
                    style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)" }}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40" style={{ fontSize: "clamp(0.5rem, 1vw, 0.55rem)" }}>{item.source}</span>
                    <span className="text-white/30" style={{ fontSize: "clamp(0.5rem, 1vw, 0.55rem)" }}>{item.time}</span>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function getDemoNews(category: NewsCategory): NewsItem[] {
  const demoNews: Record<NewsCategory, NewsItem[]> = {
    general: [
      { title: "Congress reaches bipartisan agreement on infrastructure spending", url: "#", source: "AP News", time: "2h ago" },
      { title: "Federal Reserve announces new economic outlook for 2026", url: "#", source: "NPR", time: "4h ago" },
      { title: "Weather service issues warnings across Southeast states", url: "#", source: "USA Today", time: "6h ago" },
    ],
    tech: [
      { title: "AI advances continue to reshape software development landscape", url: "#", source: "TechCrunch", time: "1h ago" },
      { title: "New smartphone features revolutionize mobile photography", url: "#", source: "The Verge", time: "3h ago" },
      { title: "Cloud computing market sees unprecedented growth", url: "#", source: "Ars Technica", time: "5h ago" },
    ],
    sports: [
      { title: "NBA playoffs heat up with unexpected upsets across conferences", url: "#", source: "ESPN", time: "30m ago" },
      { title: "NFL draft prospects showcase skills at combine", url: "#", source: "CBS Sports", time: "2h ago" },
      { title: "MLB spring training updates from across the league", url: "#", source: "ESPN", time: "4h ago" },
    ],
  }
  return demoNews[category]
}
