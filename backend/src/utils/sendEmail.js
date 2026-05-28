/**
 * Email helper for F.R.E.S.H using Resend (https://resend.com).
 *
 * Usage:
 *   sendEmail({ to, subject, html })
 *
 * Required env:
 *   RESEND_API_KEY   API key from https://resend.com/api-keys
 *   EMAIL_FROM       Sender (e.g. "FRESH <onboarding@resend.dev>" or your verified domain)
 *
 * Behaviour:
 *   - If RESEND_API_KEY is not set, the email is logged to console instead
 *     of failing the whole flow (useful for local dev / demos without email).
 */

const RESEND_API_URL = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'FRESH <onboarding@resend.dev>'

export const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || DEFAULT_FROM

  if (!apiKey) {
    console.warn(
      `[sendEmail] RESEND_API_KEY missing — email to ${to} not sent. Subject: "${subject}"`
    )
    // Return a fake success so the auth/OTP flow continues. The OTP itself is
    // still stored in the DB and visible in the response, so demo users can
    // still proceed without a real email.
    return { id: 'noop', skipped: true }
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error?.message ||
      `Gagal mengirim email (status ${response.status})`
    const error = new Error(message)
    error.statusCode = 502
    throw error
  }

  return payload || { id: 'unknown' }
}
