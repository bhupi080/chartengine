import { useEffect, useRef, useState } from "react"
import { CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react"
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
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const filtered = search
    ? symbols.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
    : symbols

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded px-2 text-sm font-semibold transition-colors",
          "hover:bg-muted",
          selected ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {selected ? selected.toUpperCase() : "Symbol"}
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
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <MagnifyingGlass size={14} className="text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No symbols found
              </p>
            ) : (
              filtered.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => {
                    onSelect(symbol)
                    setOpen(false)
                    setSearch("")
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
                    weight="bold"
                    className={cn(
                      "shrink-0",
                      selected === symbol ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {symbol.toUpperCase()}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
