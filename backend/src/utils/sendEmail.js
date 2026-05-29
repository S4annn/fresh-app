/**
 * sendEmail — kirim email via Resend API
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 *
 * Env vars yang dibutuhkan:
 *   RESEND_API_KEY  — API key dari dashboard Resend
 *   EMAIL_FROM      — Alamat pengirim, contoh: "FRESH App <noreply@yourdomain.com>"
 *                     Domain harus sudah diverifikasi di Resend.
 *                     Untuk testing pakai: "onboarding@resend.dev" (hanya bisa kirim ke email sendiri)
 */
export const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'FRESH App <onboarding@resend.dev>'
  const isDev = process.env.NODE_ENV !== 'production'

  // Jika API key tidak dikonfigurasi
  if (!apiKey) {
    if (isDev) {
      // Di development: log ke console agar bisa test flow tanpa email
      console.log('\n══════════════════════════════════════════')
      console.log('📧 [DEV MODE] Email tidak terkirim — RESEND_API_KEY kosong')
      console.log(`   To      : ${to}`)
      console.log(`   Subject : ${subject}`)
      console.log('══════════════════════════════════════════\n')
      return { id: 'dev-mode-skip' }
    }
    const error = new Error('Layanan email belum dikonfigurasi. Hubungi admin.')
    error.statusCode = 503
    throw error
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      // Log error tanpa expose API key
      console.error('[sendEmail] Resend error:', {
        status: response.status,
        name: result.name,
        message: result.message,
      })
      const error = new Error(
        result.message || 'Gagal mengirim email. Coba lagi nanti.'
      )
      error.statusCode = 502
      throw error
    }

    return result
  } catch (err) {
    if (err.statusCode) throw err
    console.error('[sendEmail] Network error:', err.message)
    const error = new Error('Gagal terhubung ke layanan email. Coba lagi nanti.')
    error.statusCode = 503
    throw error
  }
}
