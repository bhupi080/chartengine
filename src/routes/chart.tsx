import { useEffect, useMemo, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppMenu } from "@/components/AppMenu"
import { SymbolSelector } from "@/components/SymbolSelector"
import { DateRangeFilter } from "@/components/DateRangeFilter"
import {
  ChartTypeSelector,
  type ChartType,
} from "@/components/ChartTypeSelector"
import { OHLCChart } from "@/components/CandlestickChart"
import { fetchSymbols, fetchOHLCData, type OHLCRow } from "@/server/ohlc"

export type ChartSearch = {
  symbol: string | undefined
}

function parseChartSearch(search: Record<string, unknown>): ChartSearch {
  const raw = search.symbol
  if (typeof raw === "string" && raw.trim() !== "") {
    return { symbol: raw.trim() }
  }
  return { symbol: undefined }
}

export const Route = createFileRoute("/chart")({
  validateSearch: parseChartSearch,
  loader: () => fetchSymbols(),
  component: ChartPage,
})

function ChartPage() {
  const symbols = Route.useLoaderData()
  const { symbol: symbolFromUrl } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [ohlcData, setOhlcData] = useState<OHLCRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [chartType, setChartType] = useState<ChartType>("candlestick")

  const selected = symbolFromUrl ?? null

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

  useEffect(() => {
    if (!symbolFromUrl) {
      setOhlcData([])
      setFromDate("")
      setToDate("")
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setOhlcData([])
    setFromDate("")
    setToDate("")

    fetchOHLCData({ data: symbolFromUrl })
      .then((data) => {
        if (!cancelled) setOhlcData(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch data",
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [symbolFromUrl])

  function handleSelectSymbol(symbol: string) {
    navigate({ search: { symbol } })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 items-center border-b border-border px-2">
        <AppMenu />
        <div className="mx-1 h-5 w-px bg-border" />

        <SymbolSelector
          symbols={symbols}
          selected={selected}
          onSelect={handleSelectSymbol}
        />

        {ohlcData.length > 0 && (
          <>
            <div className="mx-1 h-5 w-px bg-border" />

            <ChartTypeSelector
              selected={chartType}
              onSelect={setChartType}
            />

            <div className="mx-1 h-5 w-px bg-border" />

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

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyQuickRange(1)}
                className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                1D
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange(7)}
                className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                1W
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange(30)}
                className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                1M
              </button>
            </div>

            <div className="mx-1 h-5 w-px bg-border" />

            <span className="px-2 text-xs text-muted-foreground">
              {filteredData.length.toLocaleString()} candles
            </span>
          </>
        )}

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

      <div className="relative flex flex-1 overflow-hidden">
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
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
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-sm font-medium text-foreground">
              No symbol selected
            </p>
            <p className="text-sm text-muted-foreground">
              Pick a symbol from the toolbar or open a link like{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                /chart?symbol=your_symbol
              </code>
            </p>
          </div>
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
