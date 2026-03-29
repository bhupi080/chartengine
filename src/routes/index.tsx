import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AppMenu } from "@/components/AppMenu"
import { SymbolSelector } from "@/components/SymbolSelector"
import { LandingPage } from "@/components/LandingPage"
import { fetchSymbols } from "@/server/ohlc"

export const Route = createFileRoute("/")({
  loader: () => fetchSymbols(),
  component: HomePage,
})

function HomePage() {
  const symbols = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 items-center border-b border-border px-2">
        <AppMenu />
        <div className="mx-1 h-5 w-px bg-border" />
        <SymbolSelector
          symbols={symbols}
          selected={null}
          onSelect={(symbol) =>
            navigate({ to: "/chart", search: { symbol } })
          }
        />
      </div>
      <LandingPage symbolCount={symbols.length} />
    </div>
  )
}
