import nodemailer from 'nodemailer';

/**
 * sendEmail — kirim email via Nodemailer (Gmail)
 *
 * Env vars yang dibutuhkan:
 *   SMTP_EMAIL     — Email Gmail Anda (contoh: sandy@gmail.com)
 *   SMTP_PASSWORD  — App Password dari Google (bukan password login biasa)
 */
export const sendEmail = async ({ to, subject, html }) => {
  const user = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASSWORD;
  const isDev = process.env.NODE_ENV !== 'production';

  // Jika kredensial belum diatur
  if (!user || !pass) {
    if (isDev) {
      console.log('\n══════════════════════════════════════════');
      console.log('📧 [DEV MODE] Email di-skip — SMTP_EMAIL/SMTP_PASSWORD kosong');
      console.log(`   To      : ${to}`);
      console.log(`   Subject : ${subject}`);
      console.log('══════════════════════════════════════════\n');
      return { id: 'dev-mode-skip' };
    }
    const error = new Error('Layanan email belum dikonfigurasi. Hubungi admin.');
    error.statusCode = 503;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"FRESH App" <${user}>`, // Nama pengirim bebas, email asli tetap muncul
      to,
      subject,
      html,
    });
    
    console.log(`[sendEmail] Berhasil kirim ke ${to} (${info.messageId})`);
    return info;
  } catch (err) {
    console.error('[sendEmail] Nodemailer error:', err.message);
    const error = new Error('Gagal mengirim email lewat Gmail. Cek kredensial Anda.');
    error.statusCode = 502;
    throw error;
  }
};
