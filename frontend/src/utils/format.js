const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
})

export function formatRupiah(value) {
  const number = Number(value || 0)
  if (Number.isNaN(number)) return rupiahFormatter.format(0)
  return rupiahFormatter.format(number)
}

export function formatNumber(value) {
  const number = Number(value || 0)
  if (Number.isNaN(number)) return '0'
  return number.toLocaleString('id-ID')
}

export function formatDate(value, options) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const tanggal = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
  const jam = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
  return `${tanggal} • ${jam} WIB`
}

export function getStatusLabel(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'expired') return 'Kadaluarsa'
  if (value === 'high') return 'Risiko Tinggi'
  if (value === 'warning') return 'Hampir Habis'
  if (value === 'fresh') return 'Aman'
  if (value === 'safe') return 'Aman'
  if (value === 'empty') return 'Stok Habis'
  return 'Belum diketahui'
}

export function getOrderStatusLabel(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'pending') return 'Menunggu'
  if (value === 'diproses' || value === 'process' || value === 'processing') {
    return 'Diproses'
  }
  if (value === 'selesai' || value === 'completed' || value === 'done') {
    return 'Selesai'
  }
  if (value === 'dibatalkan' || value === 'cancelled' || value === 'canceled') {
    return 'Dibatalkan'
  }
  return status || '-'
}
