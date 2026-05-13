import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform")

  // For now, redirect to build instructions since we need to build locally
  // In production, you would host the built binaries and link to them here
  
  const instructions = {
    mac: `
To build FRIDAY Dashboard for macOS:

1. Clone the repository:
   git clone https://github.com/your-username/friday-dashboard.git
   cd friday-dashboard

2. Install dependencies:
   pnpm install

3. Build for macOS:
   pnpm electron:build:mac

4. Find your app in dist-electron/FRIDAY Dashboard.dmg

The built app will include:
- Now Playing integration (Spotify, Apple Music)
- System volume control via AppleScript
- Screen brightness control
- Real CPU/RAM/Disk usage stats
    `.trim(),
    
    win: `
To build FRIDAY Dashboard for Windows:

1. Clone the repository:
   git clone https://github.com/your-username/friday-dashboard.git
   cd friday-dashboard

2. Install dependencies:
   pnpm install

3. Build for Windows:
   pnpm electron:build:win

4. Find your installer in dist-electron/FRIDAY Dashboard Setup.exe

The built app will include:
- System media controls
- Volume adjustment
- Real CPU/RAM/Disk usage stats
    `.trim(),
  }

  const content = platform === "mac" ? instructions.mac : instructions.win

  // Return as a text file download
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="FRIDAY-build-instructions-${platform}.txt"`,
    },
  })
}
