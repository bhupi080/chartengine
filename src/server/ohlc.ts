import { createServerFn } from "@tanstack/react-start"

export type OHLCRow = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const fetchSymbols = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getSqlClient } = await import("@/lib/db")
    const sql = getSqlClient()

    const rows = await sql<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name like 'ohlc_%'
      order by table_name
    `

    return rows.map((r) => r.table_name.replace(/^ohlc_/, ""))
  },
)

export const validateSymbol = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data: symbol }) => {
    const { getSqlClient } = await import("@/lib/db")
    const sql = getSqlClient()

    const rows = await sql<{ exists: boolean }[]>`
      select exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = ${"ohlc_" + symbol}
      )
    `

    return rows[0].exists
  })

export const fetchOHLCData = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data: symbol }) => {
    const { getSqlClient } = await import("@/lib/db")
    const sql = getSqlClient()

    const tableExists = await sql<{ exists: boolean }[]>`
      select exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = ${"ohlc_" + symbol}
      )
    `

    if (!tableExists[0].exists) {
      throw new Error(`Table ohlc_${symbol} does not exist`)
    }

    const safeName = symbol.replaceAll('"', '""')

    const rows = await sql<
      {
        ts: string
        open: string
        high: string
        low: string
        close: string
        volume: string
      }[]
    >`
      select ts, open, high, low, close, volume
      from ${sql.unsafe(`"public"."ohlc_${safeName}"`)}
      order by ts asc
    `

    return rows.map((r) => ({
      time: Math.floor(new Date(r.ts).getTime() / 1000) as number,
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
      volume: Number(r.volume),
    })) satisfies OHLCRow[]
  })
