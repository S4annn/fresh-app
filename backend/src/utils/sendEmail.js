export const sendEmail = async ({ to, subject, html }) => {
  const response = await fetch(process.env.BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: 'FRESH App',
        email: process.env.EMAIL_USER,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    console.error('BREVO EMAIL ERROR:', result)
    const error = new Error(result.message || 'Gagal mengirim email')
    error.statusCode = 502
    throw error
  }

  return result
}