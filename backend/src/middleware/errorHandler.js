// Map low-level driver errors to friendlier user-facing messages so the
// frontend doesn't just see "Internal Server Error" for every backend issue.
function mapKnownError(err) {
  if (!err) return null

  // Postgres / network connectivity issues.
  const code = err.code || err.errno
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    return {
      statusCode: 503,
      message:
        'Database belum terhubung. Cek konfigurasi DATABASE_URL pada server.',
    }
  }
  if (code === '28P01' || code === '28000') {
    return {
      statusCode: 503,
      message: 'Kredensial database salah. Hubungi admin untuk memperbaiki.',
    }
  }
  if (code === '3D000') {
    return {
      statusCode: 503,
      message: 'Database tujuan tidak ditemukan. Jalankan migrasi terlebih dahulu.',
    }
  }
  if (code === '42P01') {
    return {
      statusCode: 503,
      message:
        'Tabel database belum tersedia. Jalankan `npm run migrate:up` di backend.',
    }
  }

  // JWT misconfiguration (e.g. JWT_SECRET kosong).
  if (err.message === 'secretOrPrivateKey must have a value') {
    return {
      statusCode: 503,
      message: 'JWT_SECRET belum di-set di server. Hubungi admin.',
    }
  }

  return null
}

export const errorHandler = (err, req, res, next) => {
  // Always log the raw error server-side for debugging.
  // eslint-disable-next-line no-console
  console.error('[errorHandler]', err)

  // Business errors thrown by services already carry an explicit statusCode,
  // pass them through verbatim.
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    })
  }

  // Recognise common infra failures and return a useful message.
  const mapped = mapKnownError(err)
  if (mapped) {
    return res.status(mapped.statusCode).json({
      status: 'fail',
      message: mapped.message,
    })
  }

  // Outside production, surface the real message so devs can debug fast.
  const isProd = process.env.NODE_ENV === 'production'
  const message =
    !isProd && err.message ? err.message : 'Internal Server Error'

  return res.status(500).json({
    status: 'fail',
    message,
  })
}
