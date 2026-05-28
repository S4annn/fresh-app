/**
 * Single source of truth for F.R.E.S.H subscription plans.
 *
 * The same shape is consumed by:
 *   - Backend: pricing endpoint, server-side plan validation, payment simulation
 *   - Frontend: pricing page, checkout, dashboard plan badge
 *
 * If you add/rename a plan, do it here first so the UI and API stay in sync.
 */

export const PLAN_IDS = ['free', 'pro', 'business']

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Mulai gratis untuk dapur rumah tangga',
    monthly_price: 0,
    yearly_price: 0,
    currency: 'IDR',
    cta: 'Mulai Gratis',
    is_popular: false,
    is_default: true,
    features: [
      'Sampai dengan 25 inventaris bahan',
      'Notifikasi kedaluwarsa dasar',
      'Pemindai AI 5x/bulan',
      'Akses Marketplace surplus (lihat saja)',
      'Dashboard ringkasan harian',
    ],
    limits: {
      inventory_items: 25,
      ai_scans_monthly: 5,
      can_sell_surplus: false,
      can_create_donations: true,
      can_access_analytics: false,
      can_business_features: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Untuk household serius dan pelaku UMKM kuliner',
    monthly_price: 99000,
    yearly_price: 990000, // 2 bulan gratis
    currency: 'IDR',
    cta: 'Upgrade ke Pro',
    is_popular: true,
    is_default: false,
    features: [
      'Inventaris bahan tanpa batas',
      'Prediksi risiko food waste berbasis AI',
      'Rekomendasi resep & aksi otomatis',
      'Pemindai AI tanpa batas',
      'Marketplace surplus (jual & beli)',
      'Donasi dengan pickup terjadwal',
      'Sustainability impact report',
    ],
    limits: {
      inventory_items: null, // unlimited
      ai_scans_monthly: null,
      can_sell_surplus: true,
      can_create_donations: true,
      can_access_analytics: true,
      can_business_features: false,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    tagline: 'Untuk restoran, kafe, hotel, dan jaringan F&B',
    monthly_price: 299000,
    yearly_price: 2990000,
    currency: 'IDR',
    cta: 'Upgrade ke Business',
    is_popular: false,
    is_default: false,
    features: [
      'Semua fitur Pro',
      'Multi-cabang / multi-toko',
      'Advanced analytics dashboard',
      'Manajemen tim & role-based access',
      'Business sustainability report',
      'Quota prediksi AI lebih besar',
      'Priority support 7 hari/minggu',
    ],
    limits: {
      inventory_items: null,
      ai_scans_monthly: null,
      can_sell_surplus: true,
      can_create_donations: true,
      can_access_analytics: true,
      can_business_features: true,
    },
  },
}

export function getPlanById(planId) {
  if (!planId) return null
  const normalized = String(planId).toLowerCase()
  return PLANS[normalized] || null
}

export function isValidPlan(planId) {
  return PLAN_IDS.includes(String(planId).toLowerCase())
}

export function isValidBillingCycle(cycle) {
  return cycle === 'monthly' || cycle === 'yearly'
}

export function getPlanPrice(planId, billingCycle = 'monthly') {
  const plan = getPlanById(planId)
  if (!plan) return 0
  return billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price
}

export function getDefaultPlan() {
  return PLANS.free
}
