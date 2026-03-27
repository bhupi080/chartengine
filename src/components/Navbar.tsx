import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { Sun, Moon } from "@phosphor-icons/react"

const NAV_ITEMS = [
  { label: "Charts", href: "/" },
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

export function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme)

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
    <nav className="flex h-12 items-center justify-between border-b border-border bg-card px-5">
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold tracking-tight">Chart Engine</span>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </nav>
  )
}
