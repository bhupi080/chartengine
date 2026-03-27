import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { SymbolSelector } from "@/components/SymbolSelector"
import { DateRangeFilter } from "@/components/DateRangeFilter"
import { CandlestickChart } from "@/components/CandlestickChart"
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
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-2">
        <SymbolSelector
          symbols={symbols}
          selected={selected}
          onSelect={handleSelect}
        />

        {ohlcData.length > 0 && (
          <>
            <div className="h-5 w-px bg-border" />
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
            <span className="text-xs text-muted-foreground">
              {filteredData.length.toLocaleString()} candles
            </span>
          </>
        )}

        {filteredData.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            Latest:{" "}
            <span className="font-medium text-foreground">
              {new Date(filteredData[filteredData.length - 1].time * 1000).toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </span>
        )}
      </div>

      {/* Chart area - fills all remaining space */}
      <div className="relative flex flex-1 overflow-hidden">
        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading chart data…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && filteredData.length > 0 && selected && (
          <CandlestickChart data={filteredData} symbol={selected} />
        )}

        {!loading && !error && !selected && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Select a symbol from the dropdown to view its candlestick chart.
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
