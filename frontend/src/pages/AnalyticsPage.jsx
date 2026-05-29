import { useEffect, useState } from 'react'
import {
  Leaf,
  Droplets,
  Recycle,
  BarChart3,
  Package,
  Heart,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  UtensilsCrossed,
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import BusinessLayout from '../components/BusinessLayout'
import { getPersonalImpact, getBusinessImpact } from '../services/impactService'
import '../styles/analytics.css'

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function SkeletonBlock({ height = 20, width = '100%', style = {} }) {
  return (
    <div
      className="analytics-skel"
      style={{ height, width, ...style }}
    />
  )
}

function PersonalAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const result = await getPersonalImpact()
        if (mounted) setData(result)
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const summary = data?.summary || {}
  const saved = data?.saved || {}
  const env = data?.environment || {}
  const categories = data?.category_breakdown || []
  const maxCategoryCount = Math.max(...categories.map((c) => Number(c.count || 0)), 1)

  return (
    <div className="analytics">
      {/* HERO */}
      <section className="analytics-hero">
        <div className="analytics-hero__inner">
          <div>
            <span className="analytics-hero__eyebrow">
              <Sparkles size={12} strokeWidth={2.6} />
              Laporan Dampak
            </span>
            <h1 className="analytics-hero__title">
              Dampak <span>Keberlanjutan</span> Anda
            </h1>
            <p className="analytics-hero__sub">
              Setiap bahan yang Anda selamatkan berkontribusi nyata pada pengurangan emisi karbon
              dan penghematan air. Berikut ringkasan dampak Anda.
            </p>
          </div>
          <div className="analytics-hero__chips">
            <div className="analytics-hero__chip">
              <span className="analytics-hero__chip-icon">
                <Recycle size={20} strokeWidth={2.4} />
              </span>
              <div className="analytics-hero__chip-text">
                <strong>
                  {loading ? '—' : `${saved.total_kg ?? 0} kg`}
                </strong>
                <span>Total diselamatkan</span>
              </div>
            </div>
            <div className="analytics-hero__chip">
              <span className="analytics-hero__chip-icon">
                <Leaf size={20} strokeWidth={2.4} />
              </span>
              <div className="analytics-hero__chip-text">
                <strong>
                  {loading ? '—' : `${env.co2_avoided_kg ?? 0} kg`}
                </strong>
                <span>CO₂ dihindari</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="analytics-stats">
        {loading ? (
          [0,1,2,3].map((i) => (
            <div key={i} className="analytics-stat">
              <SkeletonBlock height={42} width={42} style={{ borderRadius: 10 }} />
              <SkeletonBlock height={30} width="60%" />
              <SkeletonBlock height={14} width="80%" />
            </div>
          ))
        ) : (
          <>
            <div className="analytics-stat">
              <span className="analytics-stat__icon analytics-stat__icon--green">
                <Package size={20} strokeWidth={2.2} />
              </span>
              <span className="analytics-stat__value">{summary.total_inventory ?? 0}</span>
              <span className="analytics-stat__label">Total inventaris</span>
              <span className="analytics-stat__hint">Bahan yang sedang dicatat</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__icon analytics-stat__icon--red">
                <AlertTriangle size={20} strokeWidth={2.2} />
              </span>
              <span className="analytics-stat__value">{summary.total_high ?? 0}</span>
              <span className="analytics-stat__label">Risiko tinggi</span>
              <span className="analytics-stat__hint">Perlu tindakan segera</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__icon analytics-stat__icon--orange">
                <TrendingUp size={20} strokeWidth={2.2} />
              </span>
              <span className="analytics-stat__value">{summary.total_warning ?? 0}</span>
              <span className="analytics-stat__label">Peringatan</span>
              <span className="analytics-stat__hint">Hampir kedaluwarsa</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__icon analytics-stat__icon--green">
                <Heart size={20} strokeWidth={2.2} />
              </span>
              <span className="analytics-stat__value">{saved.donation_count ?? 0}</span>
              <span className="analytics-stat__label">Total donasi</span>
              <span className="analytics-stat__hint">Donasi yang pernah dibuat</span>
            </div>
          </>
        )}
      </section>

      {/* GRID */}
      <section className="analytics-grid">
        {/* Dampak lingkungan */}
        <div className="analytics-card">
          <div className="analytics-card__head">
            <span className="analytics-card__head-icon">
              <Leaf size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h3>Dampak Lingkungan</h3>
              <small>Estimasi berdasarkan metodologi FAO</small>
            </div>
          </div>
          {loading ? (
            <div className="analytics-env">
              {[0,1,2].map((i) => (
                <div key={i} className="analytics-env__item">
                  <SkeletonBlock height={44} width={44} style={{ borderRadius: '50%' }} />
                  <SkeletonBlock height={24} width="70%" />
                  <SkeletonBlock height={14} width="90%" />
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-env">
              <div className="analytics-env__item">
                <span className="analytics-env__item-icon analytics-env__item-icon--green">
                  <Leaf size={22} strokeWidth={2.2} />
                </span>
                <span className="analytics-env__value">
                  {env.co2_avoided_kg ?? 0} kg
                </span>
                <span className="analytics-env__label">CO₂ berhasil dihindari</span>
              </div>
              <div className="analytics-env__item">
                <span className="analytics-env__item-icon analytics-env__item-icon--blue">
                  <Droplets size={22} strokeWidth={2.2} />
                </span>
                <span className="analytics-env__value">
                  {(env.water_saved_liters ?? 0).toLocaleString('id-ID')} L
                </span>
                <span className="analytics-env__label">Air dihemat dari produksi pangan</span>
              </div>
              <div className="analytics-env__item">
                <span className="analytics-env__item-icon analytics-env__item-icon--orange">
                  <UtensilsCrossed size={22} strokeWidth={2.2} />
                </span>
                <span className="analytics-env__value">
                  {env.meals_equivalent ?? 0}
                </span>
                <span className="analytics-env__label">Setara porsi makanan diselamatkan</span>
              </div>
            </div>
          )}
        </div>

        {/* Ringkasan penyelamatan */}
        <div className="analytics-card">
          <div className="analytics-card__head">
            <span className="analytics-card__head-icon">
              <Recycle size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h3>Ringkasan Penyelamatan</h3>
              <small>Bahan yang berhasil digunakan & didonasikan</small>
            </div>
          </div>
          {loading ? (
            <div className="analytics-saved">
              {[0,1,2].map((i) => (
                <div key={i} className="analytics-saved__item">
                  <SkeletonBlock height={26} width="60%" style={{ margin: '0 auto 6px' }} />
                  <SkeletonBlock height={14} width="80%" style={{ margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-saved">
              <div className="analytics-saved__item">
                <span className="analytics-saved__value">{saved.used_kg ?? 0} kg</span>
                <span className="analytics-saved__label">Digunakan sendiri</span>
              </div>
              <div className="analytics-saved__item">
                <span className="analytics-saved__value">{saved.donated_kg ?? 0} kg</span>
                <span className="analytics-saved__label">Didonasikan</span>
              </div>
              <div className="analytics-saved__item">
                <span className="analytics-saved__value">{saved.total_kg ?? 0} kg</span>
                <span className="analytics-saved__label">Total diselamatkan</span>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown kategori */}
        <div className="analytics-card analytics-card--full">
          <div className="analytics-card__head">
            <span className="analytics-card__head-icon">
              <BarChart3 size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h3>Distribusi Kategori Inventaris</h3>
              <small>Jumlah bahan per kategori yang sedang dicatat</small>
            </div>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0,1,2,3].map((i) => (
                <SkeletonBlock key={i} height={18} />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="analytics-breakdown">
              {categories.map((cat) => {
                const count = Number(cat.count || 0)
                const pct = Math.round((count / maxCategoryCount) * 100)
                return (
                  <div className="analytics-breakdown__row" key={cat.category}>
                    <span className="analytics-breakdown__label">
                      {cat.category || 'Lainnya'}
                    </span>
                    <div className="analytics-breakdown__bar-wrap">
                      <div
                        className="analytics-breakdown__bar"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="analytics-breakdown__count">{count} item</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="analytics-empty">
              <span className="analytics-empty__icon">
                <BarChart3 size={24} strokeWidth={2.2} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
                Belum ada data kategori
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Tambahkan inventaris dengan kategori untuk melihat distribusinya.
              </span>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div style={{
          padding: '14px 18px',
          background: 'var(--color-danger-soft)',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-danger)',
          fontSize: 13,
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

function BusinessAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const result = await getBusinessImpact()
        if (mounted) setData(result)
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const summary = data?.summary || {}
  const revenue = data?.revenue || {}
  const env = data?.environment || {}

  return (
    <div className="analytics">
      {/* HERO */}
      <section className="analytics-hero">
        <div className="analytics-hero__inner">
          <div>
            <span className="analytics-hero__eyebrow">
              <Sparkles size={12} strokeWidth={2.6} />
              Laporan Bisnis
            </span>
            <h1 className="analytics-hero__title">
              Analitik <span>Bisnis</span> Anda
            </h1>
            <p className="analytics-hero__sub">
              Pantau performa produk, pesanan, dan dampak lingkungan dari operasional bisnis Anda.
            </p>
          </div>
          <div className="analytics-hero__chips">
            <div className="analytics-hero__chip">
              <span className="analytics-hero__chip-icon">
                <ShoppingBag size={20} strokeWidth={2.4} />
              </span>
              <div className="analytics-hero__chip-text">
                <strong>{loading ? '—' : (summary.total_orders ?? 0)}</strong>
                <span>Total pesanan</span>
              </div>
            </div>
            <div className="analytics-hero__chip">
              <span className="analytics-hero__chip-icon">
                <TrendingUp size={20} strokeWidth={2.4} />
              </span>
              <div className="analytics-hero__chip-text">
                <strong>
                  {loading ? '—' : `Rp ${Number(revenue.total_revenue ?? 0).toLocaleString('id-ID')}`}
                </strong>
                <span>Total pendapatan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="analytics-stats">
        {loading ? (
          [0,1,2,3].map((i) => (
            <div key={i} className="analytics-stat">
              <SkeletonBlock height={42} width={42} style={{ borderRadius: 10 }} />
              <SkeletonBlock height={30} width="60%" />
              <SkeletonBlock height={14} width="80%" />
            </div>
          ))
        ) : (
          <>
            <div className="analytics-stat">
              <span className="analytics-stat__icon analytics-stat__icon--green">
                <Package size={20} strokeWidth={2.2} />
              </span>
              <span className="analytics-stat__value">{summary.total_products ?? 0}</span>
              <span className="analytics-stat__label">Total produk</span>
              <span className="analytics-stat__hint">Semua produk terdaftar</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__icon analytics-stat__icon--green">
                <TrendingUp size={20} strokeWidth={2.2} />
              </span>
              <span className="analytics-stat__value">{summary.available_products ?? 0}</span>
              <span className="analytics-stat__label">Produk tersedia</span>
              <span className="analytics-stat__hint">Masih ada stok</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__icon analytics-stat__icon--red">
                <AlertTriangle size={20} strokeWidth={2.2} />
              </span>
              <span className="analytics-stat__value">{summary.expiring_count ?? 0}</span>
              <span className="analytics-stat__label">Hampir kedaluwarsa</span>
              <span className="analytics-stat__hint">Perlu perhatian segera</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__icon analytics-stat__icon--blue">
                <ShoppingBag size={20} strokeWidth={2.2} />
              </span>
              <span className="analytics-stat__value">{summary.total_orders ?? 0}</span>
              <span className="analytics-stat__label">Total pesanan</span>
              <span className="analytics-stat__hint">Pesanan dari pembeli</span>
            </div>
          </>
        )}
      </section>

      {/* GRID */}
      <section className="analytics-grid">
        {/* Pendapatan */}
        <div className="analytics-card">
          <div className="analytics-card__head">
            <span className="analytics-card__head-icon">
              <TrendingUp size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h3>Ringkasan Penjualan</h3>
              <small>Total unit terjual dan pendapatan</small>
            </div>
          </div>
          {loading ? (
            <div className="analytics-saved">
              {[0,1].map((i) => (
                <div key={i} className="analytics-saved__item">
                  <SkeletonBlock height={26} width="60%" style={{ margin: '0 auto 6px' }} />
                  <SkeletonBlock height={14} width="80%" style={{ margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-saved">
              <div className="analytics-saved__item">
                <span className="analytics-saved__value">{revenue.total_units_sold ?? 0}</span>
                <span className="analytics-saved__label">Unit terjual</span>
              </div>
              <div className="analytics-saved__item">
                <span className="analytics-saved__value" style={{ fontSize: 18 }}>
                  Rp {Number(revenue.total_revenue ?? 0).toLocaleString('id-ID')}
                </span>
                <span className="analytics-saved__label">Total pendapatan</span>
              </div>
            </div>
          )}
        </div>

        {/* Dampak lingkungan */}
        <div className="analytics-card">
          <div className="analytics-card__head">
            <span className="analytics-card__head-icon">
              <Leaf size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h3>Dampak Lingkungan</h3>
              <small>Estimasi dari produk yang terjual</small>
            </div>
          </div>
          {loading ? (
            <div className="analytics-env">
              {[0,1,2].map((i) => (
                <div key={i} className="analytics-env__item">
                  <SkeletonBlock height={44} width={44} style={{ borderRadius: '50%' }} />
                  <SkeletonBlock height={24} width="70%" />
                  <SkeletonBlock height={14} width="90%" />
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-env">
              <div className="analytics-env__item">
                <span className="analytics-env__item-icon analytics-env__item-icon--green">
                  <Leaf size={22} strokeWidth={2.2} />
                </span>
                <span className="analytics-env__value">{env.co2_avoided_kg ?? 0} kg</span>
                <span className="analytics-env__label">CO₂ dihindari</span>
              </div>
              <div className="analytics-env__item">
                <span className="analytics-env__item-icon analytics-env__item-icon--blue">
                  <Droplets size={22} strokeWidth={2.2} />
                </span>
                <span className="analytics-env__value">
                  {(env.water_saved_liters ?? 0).toLocaleString('id-ID')} L
                </span>
                <span className="analytics-env__label">Air dihemat</span>
              </div>
              <div className="analytics-env__item">
                <span className="analytics-env__item-icon analytics-env__item-icon--orange">
                  <UtensilsCrossed size={22} strokeWidth={2.2} />
                </span>
                <span className="analytics-env__value">{env.meals_equivalent ?? 0}</span>
                <span className="analytics-env__label">Setara porsi makanan</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div style={{
          padding: '14px 18px',
          background: 'var(--color-danger-soft)',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-danger)',
          fontSize: 13,
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const user = readStoredUser()
  const isBusiness = String(user?.role || '').toLowerCase() === 'bisnis'

  if (isBusiness) {
    return (
      <BusinessLayout title="ANALITIK">
        <BusinessAnalytics />
      </BusinessLayout>
    )
  }

  return (
    <AppLayout title="ANALITIK">
      <PersonalAnalytics />
    </AppLayout>
  )
}
