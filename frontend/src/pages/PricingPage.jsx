import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'
import { getPlans } from '../services/subscriptionService'
import useSubscription from '../hooks/useSubscription'
import { rememberPendingPlan } from '../utils/plans'
import { getStoredToken } from '../utils/authStorage'
import { formatRupiah } from '../utils/format'
import { useFeedback } from '../components/feedback/feedbackContext'
import logo from '../assets/images/logo.png'
import '../styles/pricing.css'

// Local fallback so the pricing page still renders cards when the backend
// /api/subscription/plans endpoint is unavailable (e.g. demo mode, cold start,
// or backend not yet redeployed). Mirrors backend/src/config/plans.js.
const FALLBACK_PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Mulai gratis untuk dapur rumah tangga',
    monthly_price: 0,
    yearly_price: 0,
    cta: 'Mulai Gratis',
    is_popular: false,
    features: [
      'Sampai dengan 25 inventaris bahan',
      'Notifikasi kedaluwarsa dasar',
      'Pemindai AI 5x/bulan',
      'Akses Marketplace surplus (lihat saja)',
      'Dasbor ringkasan harian',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Untuk rumah tangga serius dan pelaku UMKM kuliner',
    monthly_price: 99000,
    yearly_price: 990000,
    cta: 'Naik ke Pro',
    is_popular: true,
    features: [
      'Inventaris bahan tanpa batas',
      'Prediksi risiko pemborosan pangan berbasis AI',
      'Rekomendasi resep & aksi otomatis',
      'Pemindai AI tanpa batas',
      'Marketplace surplus (jual & beli)',
      'Donasi dengan penjemputan terjadwal',
      'Laporan dampak keberlanjutan',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Untuk restoran, kafe, hotel, dan jaringan kuliner',
    monthly_price: 299000,
    yearly_price: 2990000,
    cta: 'Naik ke Business',
    is_popular: false,
    features: [
      'Semua fitur Pro',
      'Multi-cabang / multi-toko',
      'Dasbor analitik lanjutan',
      'Manajemen tim & akses berbasis peran',
      'Laporan keberlanjutan bisnis',
      'Kuota prediksi AI lebih besar',
      'Dukungan prioritas 7 hari/minggu',
    ],
  },
]

const FAQS = [
  {
    q: 'Apakah saya benar-benar dipotong uang saat naik paket?',
    a:
      'Belum. Saat ini F.R.E.S.H masih dalam fase demo, jadi semua pembayaran menggunakan simulasi. Tidak ada transaksi nyata, tidak ada data kartu yang dikumpulkan.',
  },
  {
    q: 'Apa yang terjadi setelah saya "membayar" simulasi?',
    a:
      'Langganan akun Anda langsung dinaikkan dan disimpan di basis data. Anda bisa keluar/masuk lagi atau bersihkan cache, paket tetap aktif karena disimpan di server.',
  },
  {
    q: 'Bisakah saya turun dari Pro/Business ke Free?',
    a:
      'Bisa, lewat halaman Pengaturan Langganan. Pembatalan langsung mengembalikan akun ke paket Free dan mempertahankan riwayat aktivitas Anda.',
  },
  {
    q: 'Apakah data inventaris saya hilang saat ganti paket?',
    a:
      'Tidak. Data inventaris, donasi, dan transaksi tersimpan di server tanpa terikat ke paket. Yang berubah hanya akses fitur seperti pemindai AI dan analitik.',
  },
]

export default function PricingPage() {
  const navigate = useNavigate()
  const feedback = useFeedback()
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [billingCycle, setBillingCycle] = useState('monthly')

  const isAuthenticated = Boolean(getStoredToken())
  const { plan: currentPlan } = useSubscription({ enabled: isAuthenticated })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoadingPlans(true)
        const data = await getPlans()
        if (mounted) {
          const list = Array.isArray(data) && data.length > 0 ? data : FALLBACK_PLANS
          setPlans(list)
        }
      } catch (error) {
        // Endpoint belum di-deploy atau cold start. Tetap render harga lokal
        // supaya pengguna bisa melihat paket dan mulai checkout.
        if (mounted) setPlans(FALLBACK_PLANS)
        // eslint-disable-next-line no-console
        console.warn('[PricingPage] Falling back to local plans:', error?.message)
      } finally {
        if (mounted) setLoadingPlans(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [feedback])

  function handleSelectPlan(planId) {
    if (planId === 'free') {
      // Free doesn't need checkout. If logged in, go to dashboard.
      if (isAuthenticated) {
        navigate('/dashboard')
      } else {
        navigate('/register')
      }
      return
    }
    if (!isAuthenticated) {
      // Remember the plan so we can resume after login.
      rememberPendingPlan({ plan: planId, billing_cycle: billingCycle })
      feedback.info('Silakan masuk untuk melanjutkan pembayaran.', { duration: 4000 })
      navigate('/login', {
        state: { from: '/checkout' },
      })
      return
    }
    navigate('/checkout', {
      state: { plan: planId, billing_cycle: billingCycle },
    })
  }

  function getPriceFor(plan) {
    if (!plan) return 0
    return billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price
  }

  function getCtaLabel(plan) {
    if (currentPlan === plan.id) return 'Paket Aktif Anda'
    if (plan.id === 'free') return 'Mulai Gratis'
    return plan.cta || `Naik ke ${plan.name}`
  }

  return (
    <div className="pricing-page">
      <header className="pricing-nav">
        <div className="pricing-nav__inner">
          <Link to="/" className="pricing-nav__brand">
            <img src={logo} alt="" />
            <strong>F.R.E.S.H</strong>
          </Link>
          <div className="pricing-nav__actions">
            <Link
              to="/"
              className="checkout-back"
              style={{ background: '#ffffff' }}
            >
              <ArrowLeft size={16} strokeWidth={2.4} />
              Kembali
            </Link>
          </div>
        </div>
      </header>

      <section className="pricing-hero">
        <span className="pricing-hero__tag">
          <Sparkles size={12} strokeWidth={2.6} />
          Paket Langganan
        </span>
        <h1>
          Pilih paket yang sesuai dengan <span>skala kebutuhan</span> Anda
        </h1>
        <p>
          Mulai gratis untuk dapur rumah tangga, naik ke Pro untuk fitur AI
          lengkap, atau pilih Business untuk skalabilitas multi-cabang dengan
          analitik mendalam.
        </p>
        <div className="pricing-toggle" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={billingCycle === 'monthly'}
            className={billingCycle === 'monthly' ? 'is-active' : ''}
            onClick={() => setBillingCycle('monthly')}
          >
            Per Bulan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={billingCycle === 'yearly'}
            className={billingCycle === 'yearly' ? 'is-active' : ''}
            onClick={() => setBillingCycle('yearly')}
          >
            Per Tahun
            <span className="pricing-toggle__save">Hemat 17%</span>
          </button>
        </div>
      </section>

      <section className="pricing-grid">
        {(loadingPlans ? [] : plans).map((plan) => {
          const isCurrent = currentPlan === plan.id
          const price = getPriceFor(plan)
          return (
            <article
              key={plan.id}
              className={`pricing-card ${plan.is_popular ? 'is-popular' : ''} ${
                isCurrent ? 'is-current' : ''
              }`}
            >
              {plan.is_popular && (
                <span className="pricing-card__popular-badge">
                  Paling Populer
                </span>
              )}
              {isCurrent && (
                <span className="pricing-card__current-badge">Paket Anda</span>
              )}
              <div className="pricing-card__head">
                <h3>{plan.name}</h3>
                <p className="pricing-card__tagline">{plan.tagline}</p>
              </div>
              <div className="pricing-card__price">
                <strong>
                  {price === 0 ? 'Gratis' : formatRupiah(price)}
                </strong>
                {price > 0 && (
                  <span className="pricing-card__price-period">
                    /{billingCycle === 'yearly' ? 'tahun' : 'bulan'}
                  </span>
                )}
              </div>
              {plan.id !== 'free' && billingCycle === 'yearly' && (
                <span className="pricing-card__price-note">
                  ≈ {formatRupiah(Math.round(price / 12))} per bulan
                </span>
              )}
              <button
                type="button"
                className={`pricing-card__cta ${
                  plan.is_popular || isCurrent
                    ? 'pricing-card__cta--primary'
                    : 'pricing-card__cta--secondary'
                }`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent}
              >
                {getCtaLabel(plan)}
                {!isCurrent && <ArrowRight size={14} strokeWidth={2.6} />}
              </button>
              <ul className="pricing-card__features">
                {plan.features?.map((feature, idx) => (
                  <li key={idx}>
                    <Check size={16} strokeWidth={2.6} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
        {loadingPlans &&
          [0, 1, 2].map((i) => (
            <article key={i} className="pricing-card" aria-busy="true">
              <div style={{ height: 22, background: '#eef2ef', borderRadius: 8 }} />
              <div style={{ height: 36, background: '#eef2ef', borderRadius: 8 }} />
              <div style={{ height: 48, background: '#eef2ef', borderRadius: 12 }} />
            </article>
          ))}
      </section>

      <p className="pricing-disclaimer">
        <strong>Catatan demo:</strong> sistem pembayaran saat ini masih
        simulasi. Tidak ada uang nyata yang dipotong. Gerbang pembayaran resmi
        (Midtrans / Stripe / Xendit) akan dipasang di rilis berikutnya.
      </p>

      <section className="pricing-faq">
        <h2>Pertanyaan yang Sering Ditanyakan</h2>
        <div className="pricing-faq__list">
          {FAQS.map((faq) => (
            <div key={faq.q} className="pricing-faq__item">
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
