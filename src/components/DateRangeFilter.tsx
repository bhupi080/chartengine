import { cn } from "@/lib/utils"

type DateRangeFilterProps = {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onReset: () => void
}

export function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onReset,
}: DateRangeFilterProps) {
  const inputClass = cn(
    "h-7 rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground",
    "outline-none transition-colors",
    "hover:bg-muted focus:border-ring focus:ring-[2px] focus:ring-ring/50",
    "[color-scheme:dark]",
  )

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">From</span>
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className={inputClass}
      />
      <span className="text-xs text-muted-foreground">To</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className={inputClass}
      />
      {(from || to) && (
        <button
          onClick={onReset}
          className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Reset
        </button>
      )}
    </div>
  )
}
