import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const feedUrl = searchParams.get("url")

  if (!feedUrl) {
    return NextResponse.json({ error: "No feed URL provided" }, { status: 400 })
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`)
    }

    const xml = await response.text()
    
    // Parse RSS/Atom XML to JSON
    const items = parseRSS(xml)

    return NextResponse.json({ items })
  } catch (error) {
    console.error("RSS fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch RSS feed" },
      { status: 500 }
    )
  }
}

interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
}

function parseRSS(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  
  // Get channel title for source
  const channelTitleMatch = xml.match(/<channel>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)
  const channelTitle = channelTitleMatch?.[1]?.trim() || "Unknown"

  // Match all items (RSS) or entries (Atom)
  const itemRegex = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
    const content = match[1] || match[2]
    
    // Extract title
    const titleMatch = content.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)
    const title = titleMatch?.[1]?.trim() || ""

    // Extract link
    let link = ""
    const linkMatch = content.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i)
    if (linkMatch) {
      link = linkMatch[1]?.trim() || ""
    } else {
      // Atom format
      const atomLinkMatch = content.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)
      link = atomLinkMatch?.[1] || ""
    }

    // Extract description
    const descMatch = content.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>|<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)
    let description = (descMatch?.[1] || descMatch?.[2] || "").trim()
    // Strip HTML tags from description
    description = description.replace(/<[^>]+>/g, "").substring(0, 200)

    // Extract publish date
    const dateMatch = content.match(/<pubDate>(.*?)<\/pubDate>|<published>(.*?)<\/published>|<updated>(.*?)<\/updated>/i)
    const pubDate = dateMatch?.[1] || dateMatch?.[2] || dateMatch?.[3] || ""

    if (title && link) {
      items.push({
        title,
        link,
        description,
        pubDate,
        source: channelTitle,
      })
    }
  }

  return items
}
