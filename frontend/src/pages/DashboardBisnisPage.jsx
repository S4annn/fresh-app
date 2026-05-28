import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ShoppingBag,
  ChevronRight,
  Leaf,
  Sparkles,
  ArrowRight,
  Store,
  Receipt,
  Plus,
} from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout'
import PlanCard from '../components/dashboard/PlanCard'
import { getBusinessDashboard } from '../services/dashboardService'
import { useFeedback } from '../components/feedback/feedbackContext'
import '../styles/dashboardBisnis.css'
import '../styles/pricing.css'

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

function formatRupiah(value) {
  const number = Number(value || 0)
  return `Rp ${number.toLocaleString('id-ID')}`
}

function getProductIcon(product) {
  const name = String(product.product_name || '').toLowerCase()
  if (
    name.includes('sayur') ||
    name.includes('kangkung') ||
    name.includes('bayam') ||
    name.includes('vegetable') ||
    name.includes('leaf')
  ) {
    return <Leaf size={22} strokeWidth={2.2} />
  }
  return <Package size={22} strokeWidth={2.2} />
}

function getProductBadge(product) {
  const value = String(product.status || '').toLowerCase()
  if (
    value === 'habis' ||
    value === 'soldout' ||
    value === 'sold out' ||
    value === 'tidak tersedia' ||
    Number(product.stock || 0) <= 0
  ) {
    return { label: 'Habis', className: 'bdash-badge bdash-badge--soldout' }
  }
  return { label: 'Tersedia', className: 'bdash-badge bdash-badge--available' }
}

function getOrderBadge(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'selesai' || value === 'completed' || value === 'success') {
    return { label: 'Selesai', className: 'bdash-badge bdash-badge--done' }
  }
  if (value === 'dibatalkan' || value === 'cancelled' || value === 'canceled') {
    return { label: 'Dibatalkan', className: 'bdash-badge bdash-badge--cancelled' }
  }
  return { label: status || 'Diproses', className: 'bdash-badge bdash-badge--process' }
}

export default function DashboardBisnisPage() {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
  })
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const user = readStoredUser() || { name: 'Mitra Bisnis' }
  const userName = user.fullname || user.name || 'Mitra Bisnis'

  const feedback = useFeedback()

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('fresh:login_success')
      if (msg) {
        sessionStorage.removeItem('fresh:login_success')
        feedback.success(msg)
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadDashboardData() {
      try {
        setLoading(true)
        const data = await getBusinessDashboard()
        if (!mounted) return
        setSummary(data?.summary || {
          total_products: 0,
          total_orders: 0,
          total_revenue: 0,
        })
        setProducts(data?.products || [])
        setOrders(data?.orders || [])
      } catch (error) {
        console.error(error)
        if (mounted) {
          setSummary({ total_products: 0, total_orders: 0, total_revenue: 0 })
          setProducts([])
          setOrders([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadDashboardData()
    return () => {
      mounted = false
    }
  }, [])

  const totalProducts = Number(summary.total_products || 0)
  const totalOrders = Number(summary.total_orders || 0)

  return (
    <BusinessLayout title="DASHBOARD">
      <div className="bdash">
        {/* HERO */}
        <section className="bdash-hero">
          <div className="bdash-hero__inner">
            <div className="bdash-hero__copy">
              <span className="bdash-hero__eyebrow">
                <Sparkles size={12} strokeWidth={2.6} />
                Dasbor Bisnis
              </span>
              <h1 className="bdash-hero__greeting">
                Halo, <span>{userName}</span>
              </h1>
              <p className="bdash-hero__sub">
                Pantau produk, pesanan, dan dampak bisnis Anda dalam satu tampilan.
                Hari yang baik untuk meningkatkan penjualan surplus pangan.
              </p>
              <Link to="/produk" className="bdash-hero__cta">
                <Plus strokeWidth={2.6} />
                Kelola produk
              </Link>
            </div>
          </div>
        </section>

        {/* PLAN BADGE */}
        <PlanCard />

        {/* STATS */}
        <section className="bdash-stats">
          <Link to="/produk" className="bdash-stat">
            <span className="bdash-stat__icon bdash-stat__icon--primary">
              <Store size={26} strokeWidth={2.2} />
            </span>
            <div className="bdash-stat__body">
              <span className="bdash-stat__label">Total produk</span>
              <span className="bdash-stat__value">
                {loading ? '—' : totalProducts}
              </span>
              <span className="bdash-stat__hint">
                Produk yang sedang Anda jual
              </span>
            </div>
            <ArrowRight className="bdash-stat__arrow" strokeWidth={2.6} />
          </Link>

          <Link to="/pesanan-bisnis" className="bdash-stat">
            <span className="bdash-stat__icon bdash-stat__icon--accent">
              <Receipt size={26} strokeWidth={2.2} />
            </span>
            <div className="bdash-stat__body">
              <span className="bdash-stat__label">Total pesanan</span>
              <span className="bdash-stat__value">
                {loading ? '—' : totalOrders}
              </span>
              <span className="bdash-stat__hint">
                Pesanan masuk dari pembeli
              </span>
            </div>
            <ArrowRight className="bdash-stat__arrow" strokeWidth={2.6} />
          </Link>
        </section>

        {/* GRID */}
        <section className="bdash-grid">
          {/* Produk */}
          <div className="bdash-card">
            <header className="bdash-card__head">
              <div className="bdash-card__title">
                <span className="bdash-card__title-icon">
                  <Package size={18} strokeWidth={2.4} />
                </span>
                <div>
                  <h3>Produk terbaru</h3>
                  <small>Status stok & kategori produk Anda</small>
                </div>
              </div>
              <Link to="/produk" className="bdash-link">
                Lihat semua
                <ArrowRight strokeWidth={2.6} />
              </Link>
            </header>

            {loading ? (
              <div className="bdash-list">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bdash-skel" style={{ height: 68 }} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="bdash-list">
                {products.slice(0, 5).map((product) => {
                  const badge = getProductBadge(product)
                  return (
                    <Link
                      to="/produk"
                      className="bdash-row"
                      key={product.id}
                    >
                      <span className="bdash-row__icon">
                        {getProductIcon(product)}
                      </span>
                      <div className="bdash-row__info">
                        <h4>{product.product_name || 'Produk'}</h4>
                        <p>
                          {product.stock || 0} stok
                          {product.category ? ` • ${product.category}` : ''}
                        </p>
                      </div>
                      <span className={badge.className}>{badge.label}</span>
                      <ChevronRight className="bdash-row__chevron" strokeWidth={2.4} />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="bdash-empty">
                <span className="bdash-empty__icon">
                  <Package size={22} strokeWidth={2.2} />
                </span>
                <span className="bdash-empty__title">Belum ada produk</span>
                <span className="bdash-empty__text">
                  Tambah produk pertama Anda agar bisa dipasarkan ke pengguna
                  lain di marketplace F.R.E.S.H.
                </span>
                <Link to="/produk" className="bdash-link" style={{ marginTop: 12 }}>
                  Tambah produk
                  <ArrowRight strokeWidth={2.6} />
                </Link>
              </div>
            )}
          </div>

          {/* Pesanan */}
          <div className="bdash-card">
            <header className="bdash-card__head">
              <div className="bdash-card__title">
                <span className="bdash-card__title-icon">
                  <ShoppingBag size={18} strokeWidth={2.4} />
                </span>
                <div>
                  <h3>Pesanan terbaru</h3>
                  <small>Pesanan terbaru dari pembeli Anda</small>
                </div>
              </div>
              <Link to="/pesanan-bisnis" className="bdash-link">
                Lihat semua
                <ArrowRight strokeWidth={2.6} />
              </Link>
            </header>

            {loading ? (
              <div className="bdash-list">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bdash-skel" style={{ height: 68 }} />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="bdash-list">
                {orders.slice(0, 5).map((order) => {
                  const badge = getOrderBadge(order.status)
                  return (
                    <Link
                      to="/pesanan-bisnis"
                      className="bdash-row"
                      key={order.id}
                    >
                      <span className="bdash-row__icon">
                        <Receipt size={22} strokeWidth={2.2} />
                      </span>
                      <div className="bdash-row__info">
                        <h4>{order.buyer_name || 'Pembeli'}</h4>
                        <p>
                          {order.transaction_code || `TRX-${order.id}`}
                          {order.total_items ? ` • ${order.total_items} item` : ''}
                        </p>
                      </div>
                      <div className="bdash-row__meta">
                        <span className={badge.className}>{badge.label}</span>
                        <span className="bdash-row__price">
                          {formatRupiah(order.total_price)}
                        </span>
                      </div>
                      <ChevronRight className="bdash-row__chevron" strokeWidth={2.4} />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="bdash-empty">
                <span className="bdash-empty__icon">
                  <ShoppingBag size={22} strokeWidth={2.2} />
                </span>
                <span className="bdash-empty__title">Belum ada pesanan</span>
                <span className="bdash-empty__text">
                  Pesanan dari pembeli akan muncul di sini setelah produk Anda
                  tampil di marketplace.
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </BusinessLayout>
  )
}
