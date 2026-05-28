import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Home } from 'lucide-react'
import { formatRupiah, formatDateTime } from '../utils/format'
import { getPlanLabel } from '../utils/plans'
import { getStoredUser, isBusinessRole } from '../utils/authStorage'
import '../styles/pricing.css'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getStoredUser() || {}
  const dashboardPath = isBusinessRole(user.role)
    ? '/dashboard-bisnis'
    : '/dashboard'

  const result = location.state?.result
  const plan = location.state?.plan
  const billingCycle = location.state?.billing_cycle

  // If user landed here without state (refresh), still show generic success.
  const payment = result?.payment
  const subscription = result?.subscription

  return (
    <div className="success-page">
      <div className="success-card">
        <span className="success-card__icon">
          <CheckCircle2 size={36} strokeWidth={2.4} />
        </span>
        <h1>Pembayaran simulasi berhasil 🎉</h1>
        <p>
          Paket <strong>{getPlanLabel(subscription?.plan || plan)}</strong> kini
          aktif di akun Anda. Langganan tersimpan di server, jadi tidak
          akan hilang walau Anda keluar, muat ulang, atau membersihkan cache.
        </p>

        <div className="success-card__details">
          <div className="success-card__details-row">
            <span>Paket</span>
            <strong>{getPlanLabel(subscription?.plan || plan)}</strong>
          </div>
          <div className="success-card__details-row">
            <span>Periode</span>
            <strong>
              {(payment?.billing_cycle || billingCycle) === 'yearly'
                ? 'Tahunan'
                : 'Bulanan'}
            </strong>
          </div>
          {payment?.amount !== undefined && (
            <div className="success-card__details-row">
              <span>Total dibayar</span>
              <strong>{formatRupiah(payment.amount)}</strong>
            </div>
          )}
          {payment?.reference && (
            <div className="success-card__details-row">
              <span>Referensi</span>
              <strong>{payment.reference}</strong>
            </div>
          )}
          {payment?.paid_at && (
            <div className="success-card__details-row">
              <span>Waktu</span>
              <strong>{formatDateTime(payment.paid_at)}</strong>
            </div>
          )}
        </div>

        <div className="success-card__actions">
          <button
            type="button"
            className="is-primary"
            onClick={() => navigate(dashboardPath, { replace: true })}
          >
            Buka Dasbor
            <ArrowRight size={16} strokeWidth={2.6} />
          </button>
          <Link to="/" className="is-secondary">
            <Home size={16} strokeWidth={2.4} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
