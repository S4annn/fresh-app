export function getInventoryBadgeVariant(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'high' || value === 'expired') return 'danger'
  if (value === 'warning') return 'warning'
  if (value === 'fresh' || value === 'safe') return 'success'
  if (value === 'empty') return 'neutral'
  return 'neutral'
}

export function getOrderBadgeVariant(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'pending') return 'warning'
  if (value === 'diproses' || value === 'process' || value === 'processing') return 'info'
  if (value === 'selesai' || value === 'completed' || value === 'done') return 'success'
  if (value === 'dibatalkan' || value === 'cancelled' || value === 'canceled') return 'danger'
  return 'neutral'
}
