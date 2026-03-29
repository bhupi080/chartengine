import { useEffect, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { CaretDown, Moon, Sun } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Charts", href: "/chart" },
  { label: "Trade Data", href: "/" },
  { label: "Signals", href: "/" },
  { label: "Analytics", href: "/" },
  { label: "Settings", href: "/" },
]

function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem("theme")
  if (stored === "light" || stored === "dark") return stored
  return "dark"
}

export function AppMenu() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme)
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

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded px-2 text-sm font-semibold tracking-tight transition-colors",
          "hover:bg-muted text-foreground",
        )}
      >
        Chart Engine
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
        <div className="absolute left-0 top-full z-50 mt-1 min-w-48 rounded-lg border border-border bg-card py-1 shadow-xl">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={() => toggleTheme()}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun size={16} className="shrink-0" />
            ) : (
              <Moon size={16} className="shrink-0" />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      )}
    </div>
  )
}
