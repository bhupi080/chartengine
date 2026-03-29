import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/** Stable string coords for SVG under SSR + hydration (avoids float / string mismatches). */
function svgCoord(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2)
}

function CandlestickPattern() {
  const candles: ReactNode[] = []

  const rows = [
    {
      count: 60,
      spacing: 50,
      startX: 30,
      baseY: 150,
      waveFunc: (i: number) => Math.sin(i * 0.25) * 45,
    },
    {
      count: 55,
      spacing: 55,
      startX: 60,
      baseY: 350,
      waveFunc: (i: number) => Math.cos(i * 0.3) * 40,
    },
    {
      count: 65,
      spacing: 45,
      startX: 20,
      baseY: 550,
      waveFunc: (i: number) => Math.sin(i * 0.2) * 50,
    },
    {
      count: 58,
      spacing: 52,
      startX: 80,
      baseY: 750,
      waveFunc: (i: number) => Math.cos(i * 0.28) * 38,
    },
  ]

  rows.forEach((row, rowIndex) => {
    for (let i = 0; i < row.count; i++) {
      const x = row.startX + i * row.spacing
      const trend = row.waveFunc(i)
      const volatility = (Math.sin(rowIndex * 100 + i * 7.3) * 0.5) * 18
      const currentPrice = row.baseY + trend + volatility
      const prevPrice =
        i > 0 ? row.baseY + row.waveFunc(i - 1) : row.baseY
      const isBull = currentPrice < prevPrice
      const bodyHeight =
        12 + Math.abs(trend) * 0.25 + Math.abs(Math.sin(i * 3.7)) * 8
      const upperWick = 6 + Math.abs(Math.sin(i * 2.1)) * 10
      const lowerWick = 6 + Math.abs(Math.cos(i * 1.9)) * 10
      const bodyTop = currentPrice
      const bodyBottom = currentPrice + bodyHeight

      candles.push(
        <g
          key={`row${rowIndex}-${i}`}
          opacity="0.05"
          className="dark:opacity-[0.025]"
        >
          <line
            x1={svgCoord(x)}
            y1={svgCoord(bodyTop - upperWick)}
            x2={svgCoord(x)}
            y2={svgCoord(bodyTop)}
            stroke={isBull ? "#26a69a" : "#ef5350"}
            strokeWidth="1.5"
          />
          <line
            x1={svgCoord(x)}
            y1={svgCoord(bodyBottom)}
            x2={svgCoord(x)}
            y2={svgCoord(bodyBottom + lowerWick)}
            stroke={isBull ? "#26a69a" : "#ef5350"}
            strokeWidth="1.5"
          />
          <rect
            x={svgCoord(x - 7)}
            y={svgCoord(bodyTop)}
            width="14"
            height={svgCoord(bodyHeight)}
            fill={isBull ? "#26a69a" : "#ef5350"}
          />
        </g>,
      )
    }
  })

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
      preserveAspectRatio="none"
      viewBox="0 0 2000 1000"
    >
      {candles}
    </svg>
  )
}

const featureCards = [
  {
    title: "OHLC Charts",
    description: (
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>Candlestick, Bar, Line, Area, Baseline views</li>
        <li>Volume overlay with color coding</li>
        <li>Live OHLC legend on crosshair hover</li>
        <li>Responsive full-screen charting</li>
      </ul>
    ),
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M8 17V9" />
        <path d="M12 17V5" />
        <path d="M16 17v-4" />
      </svg>
    ),
  },
  {
    title: "Symbol Explorer",
    description: (
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>Auto-detect all ohlc_* tables from Postgres</li>
        <li>Date range filtering with calendar</li>
        <li>Multiple chart type switching</li>
        <li>Real-time candle count</li>
      </ul>
    ),
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "More Coming Soon",
    description: (
      <p className="text-sm text-muted-foreground">This is upcoming feature</p>
    ),
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    disabled: true,
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
]

export function LandingPage({ symbolCount }: { symbolCount: number }) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background p-6">
      <CandlestickPattern />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M3 3v18h18" />
              <path d="m7 16 4-8 4 4 4-6" />
            </svg>
            <h1 className="text-4xl font-bold tracking-tight">
              Chart Engine 1.0
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">(Test env)</p>
          <p className="mb-32 text-lg text-muted-foreground">
            Choose a symbol to get started
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            {featureCards.map((card) => (
              <Card
                key={card.title}
                className={`h-full border-2 transition-all ${card.borderColor} ${card.bgColor} ${
                  card.disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:scale-105 hover:shadow-lg"
                }`}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`mb-4 flex h-16 w-16 items-center justify-center rounded-lg ${card.bgColor}`}
                  >
                    <span className={card.color}>{card.icon}</span>
                  </div>
                  <CardTitle className="text-2xl">{card.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {card.title === "Symbol Explorer" ? (
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        <li>Auto-detect all ohlc_* tables from Postgres</li>
                        <li>Date range filtering with calendar</li>
                        <li>Multiple chart type switching</li>
                        <li>{symbolCount} symbols available</li>
                      </ul>
                    ) : (
                      card.description
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    {card.disabled
                      ? "Coming soon..."
                      : "Select a symbol above →"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
