/**
 * Heuristic shelf-life and risk predictor used as a graceful fallback when
 * the AI microservice is unavailable. Mirrors AI/services/risk_predictor.py
 * so the user-facing experience stays consistent.
 */

const DEFAULT_SHELF_LIFE = {
  buah:    { kulkas: 7,  freezer: 30, 'suhu ruang': 4 },
  sayur:   { kulkas: 5,  freezer: 30, 'suhu ruang': 2 },
  protein: { kulkas: 3,  freezer: 90, 'suhu ruang': 1 },
  daging:  { kulkas: 3,  freezer: 90, 'suhu ruang': 1 },
  ikan:    { kulkas: 2,  freezer: 90, 'suhu ruang': 1 },
  susu:    { kulkas: 7,  freezer: 30, 'suhu ruang': 1 },
  olahan:  { kulkas: 5,  freezer: 60, 'suhu ruang': 3 },
  roti:    { kulkas: 7,  freezer: 30, 'suhu ruang': 3 },
  minuman: { kulkas: 14, freezer: 60, 'suhu ruang': 7 },
  lainnya: { kulkas: 7,  freezer: 30, 'suhu ruang': 5 },
}

const FOOD_ADJUSTMENT = {
  apel: 2,
  pisang: -1,
  tomat: -1,
  alpukat: -1,
  bayam: -2,
  kangkung: -1,
  tahu: -1,
  tempe: 0,
  telur: 14,
  yogurt: -2,
  ikan: -1,
  ayam: -1,
  'daging sapi': -1,
}

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function resolveStorageKey(value) {
  const v = normalize(value)
  if (v.includes('freezer') || v.includes('beku')) return 'freezer'
  if (v.includes('kulkas') || v.includes('fridge') || v.includes('chiller')) {
    return 'kulkas'
  }
  return 'suhu ruang'
}

function resolveCategoryKey(category) {
  const c = normalize(category)
  if (DEFAULT_SHELF_LIFE[c]) return c
  if (c === 'sayuran' || c === 'vegetable' || c === 'vegetables') return 'sayur'
  if (c === 'fruit' || c === 'fruits') return 'buah'
  if (c === 'meat') return 'protein'
  if (c === 'dairy') return 'susu'
  return 'lainnya'
}

function calculateExpiryDate(purchaseDate, shelfLife) {
  const date = purchaseDate ? new Date(purchaseDate) : new Date()
  date.setDate(date.getDate() + Number(shelfLife))
  return date
}

function calculateStatus(expiryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(expiryDate)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  if (diffDays <= 2) return 'high'
  if (diffDays <= 5) return 'warning'
  return 'fresh'
}

export function predictShelfLifeFallback({
  food_name,
  category,
  purchase_date,
  storage_location,
} = {}) {
  const storageKey = resolveStorageKey(storage_location)
  const categoryKey = resolveCategoryKey(category)
  const baseShelf = DEFAULT_SHELF_LIFE[categoryKey][storageKey]
  const adjustment = FOOD_ADJUSTMENT[normalize(food_name)] || 0
  const shelfLife = Math.max(Number(baseShelf) + adjustment, 1)
  const expiryDate = calculateExpiryDate(purchase_date, shelfLife)
  const status = calculateStatus(expiryDate)
  return {
    shelf_life: shelfLife,
    expiry_date: expiryDate,
    status,
    source: 'fallback',
  }
}
