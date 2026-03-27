import postgres from "postgres"

let sql: ReturnType<typeof postgres> | null = null

export function getSqlClient() {
  if (sql) return sql

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  sql = postgres(connectionString, {
    ssl: "require",
    max: 5,
  })

  return sql
}
