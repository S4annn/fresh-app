import { Link } from 'react-router-dom'
import { Sparkles, ArrowUpRight, Crown } from 'lucide-react'
import useSubscription from '../../hooks/useSubscription'
import { getPlanLabel } from '../../utils/plans'
import { formatDateTime } from '../../utils/format'

/**
 * Lightweight plan badge to embed inside the dashboard hero.
 * Uses the canonical server-side subscription, never localStorage.
 */
export default function PlanCard() {
  const { plan, planDetails, subscription, isLoading } = useSubscription()
  const isFree = plan === 'free'

  return (
    <article className={`plan-card ${isFree ? 'is-free' : ''}`}>
      <header className="plan-card__head">
        <div>
          <h3>Paket saat ini</h3>
          <span className="plan-card__tier">
            <Crown size={11} strokeWidth={2.6} />
            {getPlanLabel(plan)}
          </span>
        </div>
      </header>
      <div className="plan-card__body">
        {isLoading ? (
          <p>Memuat detail langganan...</p>
        ) : isFree ? (
          <p>
            Anda menggunakan paket <strong>Free</strong>. Naik paket untuk
            membuka prediksi AI, marketplace surplus, dan laporan keberlanjutan.
          </p>
        ) : (
          <p>
            {planDetails?.tagline || 'Paket premium aktif.'} Berikutnya akan
            ditagih pada{' '}
            <strong>{formatDateTime(subscription?.ends_at)}</strong>.
          </p>
        )}
      </div>
      {isFree ? (
        <Link to="/pricing" className="plan-card__cta">
          <Sparkles size={14} strokeWidth={2.6} />
          Naik Paket Sekarang
        </Link>
      ) : (
        <Link to="/pricing" className="plan-card__cta">
          Lihat detail paket
          <ArrowUpRight size={14} strokeWidth={2.6} />
        </Link>
      )}
    </article>
  )
}
