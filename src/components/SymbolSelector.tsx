import { useEffect, useRef, useState } from "react"
import { CaretDown, Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type SymbolSelectorProps = {
  symbols: string[]
  selected: string | null
  onSelect: (symbol: string) => void
}

export function SymbolSelector({
  symbols,
  selected,
  onSelect,
}: SymbolSelectorProps) {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-9 min-w-[180px] items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium",
          "outline-none transition-colors",
          "hover:bg-muted focus:border-ring focus:ring-[3px] focus:ring-ring/50",
        )}
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.toUpperCase() : "Select a symbol\u2026"}
        </span>
        <CaretDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-64 min-w-[180px] overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
          {symbols.map((symbol) => (
            <button
              key={symbol}
              onClick={() => {
                onSelect(symbol)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                "hover:bg-muted",
                selected === symbol
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Check
                size={14}
                className={cn(
                  "shrink-0",
                  selected === symbol ? "opacity-100" : "opacity-0",
                )}
              />
              {symbol.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
