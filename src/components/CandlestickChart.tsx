import { useCallback, useEffect, useRef, useState } from "react"
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  CrosshairMode,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  type Time,
} from "lightweight-charts"
import type { OHLCRow } from "@/server/ohlc"

type CandlestickChartProps = {
  data: OHLCRow[]
  symbol: string
}

type OHLCLegend = {
  open: number
  high: number
  low: number
  close: number
  volume: number
  change: number
  changePercent: number
  isUp: boolean
} | null

function resolveColor(el: HTMLElement): string {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = getComputedStyle(el).color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}

function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2) + "B"
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + "M"
  if (v >= 1_000) return (v / 1_000).toFixed(2) + "K"
  return v.toFixed(0)
}

const UP_COLOR = "#26a69a"
const DOWN_COLOR = "#ef5350"
const VOLUME_UP = "rgba(38, 166, 154, 0.3)"
const VOLUME_DOWN = "rgba(239, 83, 80, 0.3)"

export function CandlestickChart({ data, symbol }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [legend, setLegend] = useState<OHLCLegend>(null)

  const lastBar = data.length > 0 ? data[data.length - 1] : null

  const updateLegend = useCallback(
    (bar: OHLCRow | null) => {
      if (!bar) {
        setLegend(null)
        return
      }
      const prevIdx = data.findIndex((d) => d.time === bar.time)
      const prevClose = prevIdx > 0 ? data[prevIdx - 1].close : bar.open
      const change = bar.close - prevClose
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0
      setLegend({
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
        change,
        changePercent,
        isUp: bar.close >= bar.open,
      })
    },
    [data],
  )

  useEffect(() => {
    if (lastBar) updateLegend(lastBar)
  }, [lastBar, updateLegend])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const textColor = resolveColor(container)

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(128, 128, 128, 0.06)" },
        horzLines: { color: "rgba(128, 128, 128, 0.06)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: "rgba(128, 128, 128, 0.4)",
          labelBackgroundColor: "#363a45",
        },
        horzLine: {
          width: 1,
          color: "rgba(128, 128, 128, 0.4)",
          labelBackgroundColor: "#363a45",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(128, 128, 128, 0.2)",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "rgba(128, 128, 128, 0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: container.clientHeight || 600,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderVisible: false,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR,
    })

    candleSeries.setData(
      data.map((d) => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })),
    )

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" as const },
      priceScaleId: "volume",
    })

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    volumeSeries.setData(
      data.map((d) => ({
        time: d.time as Time,
        value: d.volume,
        color: d.close >= d.open ? VOLUME_UP : VOLUME_DOWN,
      })),
    )

    candleSeries.priceScale().applyOptions({
      autoScale: true,
      scaleMargins: { top: 0.1, bottom: 0.25 },
    })

    chart.timeScale().fitContent()

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.size) {
        if (lastBar) updateLegend(lastBar)
        return
      }

      const candleData = param.seriesData.get(
        candleSeries as unknown as ISeriesApi<SeriesType>,
      ) as { open: number; high: number; low: number; close: number } | undefined

      const volumeData = param.seriesData.get(
        volumeSeries as unknown as ISeriesApi<SeriesType>,
      ) as { value: number } | undefined

      if (candleData) {
        const bar: OHLCRow = {
          time: param.time as number,
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volumeData?.value ?? 0,
        }
        updateLegend(bar)
      }
    })

    chartRef.current = chart

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [data, lastBar, updateLegend])

  return (
    <div className="relative flex h-full w-full flex-1 flex-col">
      {/* OHLC Legend overlay */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
        <span className="font-semibold text-foreground">
          {symbol.toUpperCase()}
        </span>
        {legend && (
          <>
            <span className="text-muted-foreground">
              O{" "}
              <span className={legend.isUp ? "text-[#26a69a]" : "text-[#ef5350]"}>
                {formatNumber(legend.open)}
              </span>
            </span>
            <span className="text-muted-foreground">
              H{" "}
              <span className={legend.isUp ? "text-[#26a69a]" : "text-[#ef5350]"}>
                {formatNumber(legend.high)}
              </span>
            </span>
            <span className="text-muted-foreground">
              L{" "}
              <span className={legend.isUp ? "text-[#26a69a]" : "text-[#ef5350]"}>
                {formatNumber(legend.low)}
              </span>
            </span>
            <span className="text-muted-foreground">
              C{" "}
              <span className={legend.isUp ? "text-[#26a69a]" : "text-[#ef5350]"}>
                {formatNumber(legend.close)}
              </span>
            </span>
            <span
              className={
                legend.change >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
              }
            >
              {legend.change >= 0 ? "+" : ""}
              {formatNumber(legend.change)} ({formatNumber(legend.changePercent)}%)
            </span>
            <span className="text-muted-foreground">
              Vol{" "}
              <span className="text-foreground">
                {formatVolume(legend.volume)}
              </span>
            </span>
          </>
        )}
      </div>

      {/* Chart container - fills remaining space */}
      <div ref={containerRef} className="w-full flex-1" />
    </div>
  )
}
