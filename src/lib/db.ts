import postgres from "postgres"

export function getSqlClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  return postgres(connectionString, {
    ssl: "require",
  })
}
