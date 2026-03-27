import { useEffect, useRef, useState } from "react"
import { CaretDown, Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export type ChartType = "candlestick" | "bar" | "line" | "area" | "baseline"

const CHART_TYPES: { value: ChartType; label: string; icon: string }[] = [
  { value: "candlestick", label: "Candles", icon: "🕯" },
  { value: "bar", label: "Bars", icon: "📊" },
  { value: "line", label: "Line", icon: "📈" },
  { value: "area", label: "Area", icon: "▦" },
  { value: "baseline", label: "Baseline", icon: "⊿" },
]

type ChartTypeSelectorProps = {
  selected: ChartType
  onSelect: (type: ChartType) => void
}

export function ChartTypeSelector({
  selected,
  onSelect,
}: ChartTypeSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const current = CHART_TYPES.find((t) => t.value === selected)!

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded px-2 text-sm font-medium transition-colors",
          "hover:bg-muted text-foreground",
        )}
      >
        {current.label}
        <CaretDown
          size={12}
          weight="bold"
          className={cn(
            "text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-xl">
          {CHART_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                onSelect(type.value)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                "hover:bg-muted",
                selected === type.value
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Check
                size={14}
                weight="bold"
                className={cn(
                  "shrink-0",
                  selected === type.value ? "opacity-100" : "opacity-0",
                )}
              />
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
