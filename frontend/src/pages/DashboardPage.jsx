import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  ClipboardList,
  Clock,
  TriangleAlert,
  Sparkles,
  ChefHat,
  ArrowRight,
  Salad,
  Leaf,
  Recycle,
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import PlanCard from '../components/dashboard/PlanCard'
import { getPersonalDashboard } from '../services/dashboardService'
import { useFeedback } from '../components/feedback/feedbackContext'
import '../styles/dashboard.css'
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

function getDaysLeftText(item) {
  const daysLeft = Number(item.days_left)
  if (Number.isNaN(daysLeft)) return '-'
  if (daysLeft <= 0) return 'Hari ini'
  if (daysLeft === 1) return '1 hari lagi'
  return `${daysLeft} hari lagi`
}

function getBadgeClass(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'high') return 'dash-badge dash-badge--high'
  if (value === 'warning') return 'dash-badge dash-badge--warning'
  if (value === 'fresh' || value === 'safe' || value === 'low') {
    return 'dash-badge dash-badge--low'
  }
  return 'dash-badge dash-badge--unknown'
}

function getRecommendationStatus(rec) {
  return rec?.urgency || rec?.status || 'fresh'
}

function getAiPillClass(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'high') return 'dash-ai__pill dash-ai__pill--danger'
  if (value === 'warning') return 'dash-ai__pill dash-ai__pill--warning'
  return 'dash-ai__pill dash-ai__pill--primary'
}

function getRecommendationLabel(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'high') return 'Risiko Tinggi'
  if (value === 'warning') return 'Peringatan'
  return 'Aman'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = readStoredUser() || { name: 'Pengguna', fullname: 'Pengguna' }
  const userName = user.fullname || user.name || 'Pengguna'

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
    let isMounted = true
    async function loadDashboardData() {
      try {
        setLoading(true)
        const dashboard = await getPersonalDashboard()
        if (isMounted) {
          setDashboardData(dashboard?.data || dashboard || null)
        }
      } catch (error) {
        console.error('Gagal mengambil dasbor:', error)
        if (isMounted) setDashboardData(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadDashboardData()
    return () => {
      isMounted = false
    }
  }, [])

  const summary = dashboardData?.summary || {}
  const warning = dashboardData?.warning || {
    type: 'safe',
    title: 'Tidak ada bahan prioritas',
    message: loading
      ? 'Sedang memuat data dasbor...'
      : 'Semua bahan makanan masih dalam kondisi aman.',
  }
  const latestInventories = dashboardData?.latest_inventories || []
  const topRecommendation = dashboardData?.top_recommendation || null
  const totalFood = Number(summary.total_inventory || 0)
  const highCount = Number(summary.total_high || 0)
  const warningCount = Number(summary.total_warning || 0)
  const savedCount = Number(summary.total_saved || summary.saved || 0)

  const heroSubtitle = loading
    ? 'Sedang menyiapkan ringkasan dasbor Anda...'
    : warning.message || 'Semua bahan makanan masih dalam kondisi aman.'

  return (
    <AppLayout title="DASHBOARD">
      <div className="dash">
        {/* HERO */}
        <section className="dash-hero">
          <div className="dash-hero__inner">
            <div className="dash-hero__copy">
              <span className="dash-hero__eyebrow">
                <Sparkles size={12} strokeWidth={2.6} />
                Dasbor Pribadi
              </span>
              <h1 className="dash-hero__greeting">
                Halo, <span>{userName}</span>
              </h1>
              <p className="dash-hero__sub">{heroSubtitle}</p>
            </div>
            <div className="dash-hero__highlight">
              <span className="dash-hero__highlight-icon">
                <Leaf size={22} strokeWidth={2.4} />
              </span>
              <div className="dash-hero__highlight-text">
                <strong>{savedCount > 0 ? `${savedCount} bahan` : 'Aman'}</strong>
                <span>
                  {savedCount > 0
                    ? 'diselamatkan bulan ini'
                    : 'Belum ada bahan yang berisiko'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PLAN BADGE */}
        <PlanCard />

        {/* STATS */}
        <section className="dash-stats">
          <button
            type="button"
            className="dash-stat"
            onClick={() => navigate('/inventory')}
          >
            <div className="dash-stat__head">
              <span className="dash-stat__icon dash-stat__icon--primary">
                <ClipboardList size={22} strokeWidth={2.2} />
              </span>
              <span className="dash-stat__pill dash-stat__pill--primary">
                Total
              </span>
            </div>
            <span className="dash-stat__value">{loading ? '—' : totalFood}</span>
            <span className="dash-stat__label">Total bahan</span>
            <span className="dash-stat__hint">Bahan yang sedang Anda simpan</span>
            <span className="dash-stat__cta">
              Lihat inventaris
              <ArrowRight strokeWidth={2.6} />
            </span>
          </button>

          <button
            type="button"
            className="dash-stat"
            onClick={() => navigate('/inventory?status=high')}
          >
            <div className="dash-stat__head">
              <span className="dash-stat__icon dash-stat__icon--danger">
                <TriangleAlert size={22} strokeWidth={2.2} />
              </span>
              <span className="dash-stat__pill dash-stat__pill--danger">
                Mendesak
              </span>
            </div>
            <span className="dash-stat__value">{loading ? '—' : highCount}</span>
            <span className="dash-stat__label">Risiko tinggi</span>
            <span className="dash-stat__hint">Perlu tindakan secepatnya</span>
            <span className="dash-stat__cta">
              Lihat detail
              <ArrowRight strokeWidth={2.6} />
            </span>
          </button>

          <button
            type="button"
            className="dash-stat"
            onClick={() => navigate('/inventory?status=warning')}
          >
            <div className="dash-stat__head">
              <span className="dash-stat__icon dash-stat__icon--warning">
                <Clock size={22} strokeWidth={2.2} />
              </span>
              <span className="dash-stat__pill dash-stat__pill--warning">
                Peringatan
              </span>
            </div>
            <span className="dash-stat__value">{loading ? '—' : warningCount}</span>
            <span className="dash-stat__label">Hampir kedaluwarsa</span>
            <span className="dash-stat__hint">Pantau dalam beberapa hari ke depan</span>
            <span className="dash-stat__cta">
              Lihat detail
              <ArrowRight strokeWidth={2.6} />
            </span>
          </button>
        </section>

        {/* ALERT */}
        {!loading && warning.type && warning.type !== 'safe' && (
          <div className="dash-alert">
            <span className="dash-alert__icon">
              <TriangleAlert size={20} strokeWidth={2.4} />
            </span>
            <div>
              <div className="dash-alert__title">{warning.title}</div>
              <div className="dash-alert__text">{warning.message}</div>
            </div>
          </div>
        )}

        {/* GRID — INVENTORY + AI */}
        <section className="dash-grid">
          {/* Inventory list */}
          <div className="dash-card">
            <header className="dash-card__head">
              <div className="dash-card__title">
                <span className="dash-card__title-icon">
                  <Package size={18} strokeWidth={2.4} />
                </span>
                <div>
                  <h3>Inventaris terbaru</h3>
                  <small>Bahan terbaru yang Anda tambahkan</small>
                </div>
              </div>
              <Link to="/inventory" className="dash-link">
                Lihat semua
                <ArrowRight strokeWidth={2.6} />
              </Link>
            </header>

            {loading ? (
              <div className="dash-inv-list">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="dash-skel" style={{ height: 60 }} />
                ))}
              </div>
            ) : latestInventories.length > 0 ? (
              <div className="dash-inv-list">
                {latestInventories.slice(0, 5).map((item) => (
                  <div className="dash-inv-item" key={item.id}>
                    <span className="dash-inv-item__icon">
                      <Salad size={18} strokeWidth={2.2} />
                    </span>
                    <div className="dash-inv-item__info">
                      <h4>{item.food_name || 'Bahan tanpa nama'}</h4>
                      <p>
                        {item.quantity || 0} {item.unit || 'pcs'}
                        {item.category ? ` • ${item.category}` : ''}
                      </p>
                    </div>
                    <span className={getBadgeClass(item.status)}>
                      {getDaysLeftText(item)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <span className="dash-empty__icon">
                  <Package size={22} strokeWidth={2.2} />
                </span>
                <span className="dash-empty__title">Belum ada inventaris</span>
                <span className="dash-empty__text">
                  Tambah bahan pertama Anda untuk mulai melacak masa simpan dan
                  dapatkan rekomendasi AI.
                </span>
                <Link to="/inventory/add" className="dash-link" style={{ marginTop: 12 }}>
                  Tambah bahan
                  <ArrowRight strokeWidth={2.6} />
                </Link>
              </div>
            )}
          </div>

          {/* AI recommendation */}
          <div className="dash-card">
            <header className="dash-card__head">
              <div className="dash-card__title">
                <span className="dash-card__title-icon">
                  <Sparkles size={18} strokeWidth={2.4} />
                </span>
                <div>
                  <h3>Rekomendasi AI</h3>
                  <small>Aksi cerdas untuk bahan Anda hari ini</small>
                </div>
              </div>
            </header>

            {loading ? (
              <div className="dash-ai">
                <div
                  className="dash-skel"
                  style={{ height: 22, width: 110, borderRadius: 999 }}
                />
                <div className="dash-skel" style={{ height: 22, width: '70%' }} />
                <div className="dash-skel" style={{ height: 14, width: '50%' }} />
                <div className="dash-skel" style={{ height: 14, width: '90%' }} />
                <div className="dash-skel" style={{ height: 14, width: '60%' }} />
              </div>
            ) : topRecommendation ? (
              <Link to="/rekomendasi" className="dash-ai">
                <span className={getAiPillClass(getRecommendationStatus(topRecommendation))}>
                  <Sparkles strokeWidth={2.8} />
                  {getRecommendationLabel(getRecommendationStatus(topRecommendation))}
                </span>
                <h4 className="dash-ai__title">
                  {topRecommendation.food_name ||
                    topRecommendation.recipe ||
                    topRecommendation.title ||
                    'Rekomendasi AI'}
                </h4>
                <div className="dash-ai__meta">
                  <ChefHat strokeWidth={2.4} />
                  <span>
                    {topRecommendation.recipe ||
                      topRecommendation.title ||
                      'Ide masakan cepat'}
                  </span>
                </div>
                <p className="dash-ai__desc">
                  {topRecommendation.recipe_description ||
                    topRecommendation.recommendation ||
                    topRecommendation.tips ||
                    'Gunakan bahan makanan dengan bijak agar tidak terbuang.'}
                </p>
                <span className="dash-ai__cta">
                  Lihat rekomendasi lain
                  <ArrowRight strokeWidth={2.6} />
                </span>
              </Link>
            ) : (
              <div className="dash-empty">
                <span className="dash-empty__icon">
                  <Recycle size={22} strokeWidth={2.2} />
                </span>
                <span className="dash-empty__title">Belum ada rekomendasi</span>
                <span className="dash-empty__text">
                  Tambahkan inventaris Anda terlebih dahulu agar sistem dapat
                  memberikan rekomendasi resep dan aksi.
                </span>
                <Link to="/inventory/add" className="dash-link" style={{ marginTop: 12 }}>
                  Tambah bahan
                  <ArrowRight strokeWidth={2.6} />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
