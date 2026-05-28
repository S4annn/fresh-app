import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set. The API will fail to start.')
}

// Most managed Postgres providers (Railway, Neon, Supabase, Render) require
// SSL with self-signed certificates. Local Postgres usually doesn't.
function resolveSslOption() {
  const explicit = process.env.PGSSL || process.env.DATABASE_SSL
  if (explicit === 'false' || explicit === 'disable') return false
  if (explicit === 'true' || explicit === 'require') {
    return { rejectUnauthorized: false }
  }
  const url = process.env.DATABASE_URL || ''
  const isLocal = /localhost|127\.0\.0\.1/.test(url)
  return isLocal ? false : { rejectUnauthorized: false }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: resolveSslOption(),
  max: Number(process.env.DATABASE_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message)
})

export default pool
