import { Link } from 'react-router-dom'
import { Sparkles, ArrowUpRight } from 'lucide-react'
import useSubscription from '../../hooks/useSubscription'
import { userHasAccess } from '../../utils/plans'

/**
 * Inline banner shown when the user tries to access a premium feature on a
 * lower plan. Render this at the top of pages that require Pro/Business.
 */
export default function UpgradeBanner({ requiredPlan = 'pro', feature }) {
  const { plan, isLoading } = useSubscription()
  if (isLoading) return null
  if (userHasAccess(plan, requiredPlan)) return null

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ecfdf3, #d1fadf)',
        border: '1px solid rgba(18, 183, 106, 0.28)',
        borderRadius: 16,
        padding: '16px 20px',
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #12b76a, #054f31)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Sparkles size={18} strokeWidth={2.4} />
      </span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <strong
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 800,
            color: '#054f31',
            letterSpacing: '-0.01em',
          }}
        >
          Fitur ini eksklusif untuk paket {requiredPlan === 'business' ? 'Business' : 'Pro'}
        </strong>
        <span style={{ fontSize: 13, color: '#11221a', lineHeight: 1.55 }}>
          {feature
            ? `Akses ${feature} dengan menaikkan paket Anda.`
            : 'Naikkan paket Anda untuk membuka fitur premium.'}
        </span>
      </div>
      <Link
        to="/pricing"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #12b76a, #054f31)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 8px 18px rgba(18, 183, 106, 0.25)',
        }}
      >
        Lihat Harga
        <ArrowUpRight size={14} strokeWidth={2.6} />
      </Link>
    </div>
  )
}
