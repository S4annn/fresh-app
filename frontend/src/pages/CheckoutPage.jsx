import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Wallet,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import {
  createCheckout,
  simulatePayment,
} from '../services/subscriptionService'
import { consumePendingPlan, peekPendingPlan } from '../utils/plans'
import { useFeedback } from '../components/feedback/feedbackContext'
import { formatRupiah } from '../utils/format'
import logo from '../assets/images/logo.png'
import '../styles/pricing.css'

const METHOD_ICONS = {
  simulation_card: CreditCard,
  simulation_bank: Building2,
  simulation_ewallet: Wallet,
}

const METHOD_DESC = {
  simulation_card: 'Demo Visa/Mastercard, tanpa data kartu nyata',
  simulation_bank: 'Demo virtual account, tanpa transfer asli',
  simulation_ewallet: 'Demo OVO/DANA/GoPay, tanpa saldo nyata',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const feedback = useFeedback()

  // Resolve which plan the user wants to buy.
  const initialPlan = useMemo(() => {
    if (location.state?.plan) return location.state
    const pending = consumePendingPlan() || peekPendingPlan()
    if (pending?.plan) return pending
    return { plan: 'pro', billing_cycle: 'monthly' }
  }, [location.state])

  const [checkout, setCheckout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('simulation_card')

  useEffect(() => {
    let mounted = true
    async function loadCheckout() {
      try {
        setLoading(true)
        const data = await createCheckout({
          plan: initialPlan.plan,
          billing_cycle: initialPlan.billing_cycle || 'monthly',
        })
        if (mounted) setCheckout(data)
      } catch (error) {
        feedback.error(error.message)
        navigate('/pricing', { replace: true })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadCheckout()
    return () => {
      mounted = false
    }
  }, [feedback, initialPlan.plan, initialPlan.billing_cycle, navigate])

  async function handlePay() {
    if (!checkout) return
    try {
      setPaying(true)
      // Simulate processing latency so the UX feels real.
      await new Promise((resolve) => setTimeout(resolve, 1200))
      const result = await simulatePayment({
        plan: checkout.plan,
        billing_cycle: checkout.billing_cycle,
        payment_method: paymentMethod,
      })
      navigate('/checkout/success', {
        replace: true,
        state: { result, plan: checkout.plan, billing_cycle: checkout.billing_cycle },
      })
    } catch (error) {
      feedback.error(error.message, { title: 'Pembayaran simulasi gagal', duration: 5000 })
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <p style={{ textAlign: 'center', padding: 80, color: '#5a6a62' }}>
            Menyiapkan pembayaran simulasi...
          </p>
        </div>
      </div>
    )
  }

  if (!checkout) return null

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <Link to="/" className="pricing-nav__brand" style={{ textDecoration: 'none' }}>
            <img src={logo} alt="" />
            <strong style={{ fontSize: 16, fontWeight: 800, letterSpacing: 3, color: '#054f31' }}>
              F.R.E.S.H
            </strong>
          </Link>
          <Link to="/pricing" className="checkout-back">
            <ArrowLeft size={16} strokeWidth={2.4} />
            Pilih paket lain
          </Link>
        </div>

        <h1 className="checkout-title">Selesaikan peningkatan paket Anda</h1>
        <p className="checkout-subtitle">
          Konfirmasi paket dan pilih metode pembayaran simulasi untuk
          mengaktifkan akses fitur premium F.R.E.S.H.
        </p>

        <div className="checkout-grid" style={{ marginTop: 28 }}>
          <section className="checkout-section">
            <h2>Metode Pembayaran (Simulasi)</h2>
            <div className="checkout-method">
              {(checkout.available_methods || []).map((method) => {
                const Icon = METHOD_ICONS[method.id] || CreditCard
                return (
                  <label
                    key={method.id}
                    className={`checkout-method__option ${
                      paymentMethod === method.id ? 'is-active' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                    />
                    <span className="checkout-method__option-dot" aria-hidden="true" />
                    <span className="checkout-method__option-icon">
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <span className="checkout-method__option-text">
                      <strong>{method.label}</strong>
                      <span>{METHOD_DESC[method.id] || 'Pembayaran simulasi'}</span>
                    </span>
                  </label>
                )
              })}
            </div>

            <div className="checkout-disclaimer" style={{ marginTop: 18 }}>
              <AlertTriangle size={16} strokeWidth={2.4} />
              <span>
                <strong>Mode simulasi.</strong> Tidak ada uang nyata yang
                dipotong dan tidak ada data kartu yang dikumpulkan. Klik
                tombol di bawah untuk menyelesaikan demo dan mengaktifkan
                paket Anda.
              </span>
            </div>
          </section>

          <aside className="checkout-summary">
            <h2>Ringkasan Pesanan</h2>
            <div className="checkout-summary__plan">
              <span className="checkout-summary__plan-tag">
                <Sparkles size={11} strokeWidth={2.6} />
                Paket dipilih
              </span>
              <h3>{checkout.plan_name}</h3>
              <p>
                {checkout.billing_cycle === 'yearly'
                  ? 'Tagihan setiap tahun, hemat 17%'
                  : 'Tagihan setiap bulan, fleksibel'}
              </p>
            </div>

            <div className="checkout-summary__row">
              <span>Paket</span>
              <strong>{checkout.plan_name}</strong>
            </div>
            <div className="checkout-summary__row">
              <span>Periode</span>
              <strong>
                {checkout.billing_cycle === 'yearly' ? 'Tahunan' : 'Bulanan'}
              </strong>
            </div>
            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <strong>{formatRupiah(checkout.amount)}</strong>
            </div>
            <div className="checkout-summary__row">
              <span>Diskon demo</span>
              <strong>—</strong>
            </div>

            <div className="checkout-summary__total">
              <span>Total dibayar</span>
              <strong>{formatRupiah(checkout.amount)}</strong>
            </div>

            <button
              type="button"
              className="checkout-cta"
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? (
                'Memproses simulasi...'
              ) : (
                <>
                  <CheckCircle2 size={18} strokeWidth={2.4} />
                  Selesaikan Pembayaran Demo
                </>
              )}
            </button>

            <p
              style={{
                marginTop: 14,
                fontSize: 12,
                color: '#5a6a62',
                display: 'inline-flex',
                gap: 6,
                alignItems: 'center',
                lineHeight: 1.55,
              }}
            >
              <ShieldCheck size={14} strokeWidth={2.4} color="#027a48" />
              <span>
                Langganan disimpan permanen di basis data. Tidak akan hilang
                walau cache atau browser dibersihkan.
              </span>
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
