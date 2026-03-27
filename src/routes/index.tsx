import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { SymbolSelector } from "@/components/SymbolSelector"
import { DateRangeFilter } from "@/components/DateRangeFilter"
import {
  ChartTypeSelector,
  type ChartType,
} from "@/components/ChartTypeSelector"
import { OHLCChart } from "@/components/CandlestickChart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchSymbols, fetchOHLCData, type OHLCRow } from "@/server/ohlc"

export const Route = createFileRoute("/")({
  loader: () => fetchSymbols(),
  component: App,
})

function App() {
  const symbols = Route.useLoaderData()

  const [selected, setSelected] = useState<string | null>(null)
  const [ohlcData, setOhlcData] = useState<OHLCRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [chartType, setChartType] = useState<ChartType>("candlestick")

  const filteredData = useMemo(() => {
    if (!fromDate && !toDate) return ohlcData

    const fromTs = fromDate
      ? Math.floor(new Date(fromDate + "T00:00:00Z").getTime() / 1000)
      : -Infinity
    const toTs = toDate
      ? Math.floor(new Date(toDate + "T23:59:59Z").getTime() / 1000)
      : Infinity

    return ohlcData.filter((d) => d.time >= fromTs && d.time <= toTs)
  }, [ohlcData, fromDate, toDate])

  function toInputDateFromUnix(ts: number): string {
    return new Date(ts * 1000).toISOString().slice(0, 10)
  }

  function applyQuickRange(days: number) {
    if (ohlcData.length === 0) return
    const latestTs = ohlcData[ohlcData.length - 1].time
    const fromTs = latestTs - days * 24 * 60 * 60
    setFromDate(toInputDateFromUnix(fromTs))
    setToDate(toInputDateFromUnix(latestTs))
  }

  async function handleSelect(symbol: string) {
    setSelected(symbol)
    setLoading(true)
    setError(null)
    setOhlcData([])
    setFromDate("")
    setToDate("")

    try {
      const data = await fetchOHLCData({ data: symbol })
      setOhlcData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* TradingView-style Toolbar */}
      <div className="flex h-10 items-center border-b border-border px-2">
        {/* Symbol chip */}
        <SymbolSelector
          symbols={symbols}
          selected={selected}
          onSelect={handleSelect}
        />

        {ohlcData.length > 0 && (
          <>
            <div className="mx-1 h-5 w-px bg-border" />

            {/* Chart type */}
            <ChartTypeSelector
              selected={chartType}
              onSelect={setChartType}
            />

            <div className="mx-1 h-5 w-px bg-border" />

            {/* Date filter */}
            <DateRangeFilter
              from={fromDate}
              to={toDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
              onReset={() => {
                setFromDate("")
                setToDate("")
              }}
            />

            <div className="mx-1 h-5 w-px bg-border" />

            {/* Quick ranges */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => applyQuickRange(1)}
                className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                1D
              </button>
              <button
                onClick={() => applyQuickRange(7)}
                className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                1W
              </button>
              <button
                onClick={() => applyQuickRange(30)}
                className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                1M
              </button>
            </div>

            <div className="mx-1 h-5 w-px bg-border" />

            {/* Candle count */}
            <span className="px-2 text-xs text-muted-foreground">
              {filteredData.length.toLocaleString()} candles
            </span>
          </>
        )}

        {/* Right side: latest time */}
        {filteredData.length > 0 && (
          <span className="ml-auto px-2 text-xs text-muted-foreground">
            {new Date(
              filteredData[filteredData.length - 1].time * 1000,
            ).toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Chart area */}
      <div className="relative flex flex-1 overflow-hidden">
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            {/* Animated candlestick loader */}
            <div className="flex items-end gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const isUp = i % 2 === 0
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center"
                    style={{
                      animation: `chartPulse 1.4s ease-in-out ${i * 0.12}s infinite`,
                    }}
                  >
                    <div
                      className={`w-px ${isUp ? "bg-[#26a69a]" : "bg-[#ef5350]"}`}
                      style={{ height: 8 + (i % 3) * 4 }}
                    />
                    <div
                      className={`w-2.5 rounded-[1px] ${isUp ? "bg-[#26a69a]" : "bg-[#ef5350]"}`}
                      style={{ height: 14 + (i % 4) * 6 }}
                    />
                    <div
                      className={`w-px ${isUp ? "bg-[#26a69a]" : "bg-[#ef5350]"}`}
                      style={{ height: 6 + (i % 3) * 3 }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Loading chart data
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fetching {selected?.toUpperCase()} from database…
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && filteredData.length > 0 && selected && (
          <OHLCChart
            data={filteredData}
            symbol={selected}
            chartType={chartType}
          />
        )}

        {!loading && !error && !selected && (
          <LandingPage symbolCount={symbols.length} />
        )}

        {!loading &&
          !error &&
          selected &&
          ohlcData.length > 0 &&
          filteredData.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No candles in the selected date range.
              </p>
            </div>
          )}

        {!loading && !error && selected && ohlcData.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No OHLC data found for {selected.toUpperCase()}.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CandlestickPattern() {
  const candles: React.ReactNode[] = []

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
            x1={x}
            y1={bodyTop - upperWick}
            x2={x}
            y2={bodyTop}
            stroke={isBull ? "#26a69a" : "#ef5350"}
            strokeWidth="1.5"
          />
          <line
            x1={x}
            y1={bodyBottom}
            x2={x}
            y2={bodyBottom + lowerWick}
            stroke={isBull ? "#26a69a" : "#ef5350"}
            strokeWidth="1.5"
          />
          <rect
            x={x - 7}
            y={bodyTop}
            width="14"
            height={bodyHeight}
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

function LandingPage({ symbolCount }: { symbolCount: number }) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background p-6">
      <CandlestickPattern />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        {/* Header */}
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

        {/* Feature Cards */}
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
