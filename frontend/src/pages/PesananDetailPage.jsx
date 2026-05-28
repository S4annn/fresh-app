import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, CalendarDays, Package, CreditCard, Store, MapPin } from 'lucide-react'
import Layout from '../components/AppLayout'
import { getTransactionDetail } from '../services/transactionService'
import '../styles/pesananDetail.css'

export default function PesananDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true)
        const data = await getTransactionDetail(id)
        setOrder(data)
      } catch (error) {
        alert(error.message || 'Gagal mengambil detail pesanan')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadDetail()
  }, [id])

  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  function formatStatus(status) {
    if (status === 'pending') return 'Pending'
    if (status === 'diproses') return 'Diproses'
    if (status === 'selesai') return 'Selesai'
    if (status === 'dibatalkan') return 'Dibatalkan'
    return status || '-'
  }

  function getStatusClass(status) {
    if (status === 'pending') return 'status-pending'
    if (status === 'diproses') return 'status-process'
    if (status === 'selesai') return 'status-done'
    if (status === 'dibatalkan') return 'status-cancelled'
    return 'status-pending'
  }

  const items = order?.items || []
  const storeName =
    order?.store_name ||
    order?.seller_name ||
    order?.business_name ||
    order?.seller?.name ||
    order?.items?.[0]?.seller_name ||
    '-'

  const storeAddress =
    order?.store_address ||
    order?.seller_address ||
    order?.business_address ||
    order?.seller?.address ||
    order?.items?.[0]?.seller_address ||
    order?.address ||
    '-'

  if (loading) {
    return (
      <Layout title="DETAIL PESANAN">
        <div className="order-detail-empty">
          Memuat detail pesanan...
        </div>
      </Layout>
    )
  }
  if (!order) {
    return (
      <Layout title="DETAIL PESANAN">
        <div className="order-detail-empty">
          Detail pesanan tidak ditemukan.
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="DETAIL PESANAN">
      <div className="order-detail-page">
        <button
          type="button"
          className="order-back-btn"
          onClick={() => navigate('/pesanan')}
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <div className="order-detail-header">
          <div>
            <h1>Detail Pesanan</h1>
            <p>Informasi lengkap transaksi pembelian.</p>
          </div>
          <span className={getStatusClass(order.status)}>
            {formatStatus(order.status)}
          </span>
        </div>
        <div className="order-detail-grid">
          <div className="order-info-card">
            <div className="order-info-title">
              <FileText size={24} />
              <h2>Informasi Transaksi</h2>
            </div>
            <div className="order-info-row">
              <span>Kode Transaksi</span>
              <strong>
                {order.transaction_code || `TRX-${order.id}`}
              </strong>
            </div>
            <div className="order-info-row">
              <span>Tanggal</span>
              <strong>
                <CalendarDays size={16} />
                {order.created_at || '-'}
              </strong>
            </div>
            <div className="order-info-row">
              <span>Status</span>
              <strong>{formatStatus(order.status)}</strong>
            </div>
            <div className="order-info-row">
              <span>Nama Toko</span>
              <strong>
                <Store size={16} />
                {storeName}
              </strong>
            </div>
            <div className="order-info-row">
              <span>Alamat Toko</span>
              <strong>
                <MapPin size={16} />
                {storeAddress}
              </strong>
            </div>
          </div>
          <div className="order-info-card">
            <div className="order-info-title">
              <CreditCard size={24} />
              <h2>Pembayaran</h2>
            </div>
            <div className="order-total-box">
              <span>Total Harga</span>
              <h3>{formatRupiah(order.total_price)}</h3>
            </div>
          </div>
        </div>
        <div className="order-items-card">
          <div className="order-info-title">
            <Package size={24} />
            <h2>Item yang Dipesan</h2>
          </div>
          {items.length > 0 ? (
            <div className="order-items-list">
              {items.map((item, index) => (
                <div
                  className="order-item-row"
                  key={item.id || index}
                >
                  <div>
                    <h3>
                      {item.product_name ||
                        item.food_name ||
                        'Produk'}
                    </h3>
                    <p>
                      {item.quantity} {item.unit || 'pcs'}
                    </p>
                    <p>
                      Toko:{' '}
                      {item.seller_name ||
                        item.store_name ||
                        storeName}
                    </p>
                  </div>
                  <div className="order-item-price">
                    <span>
                      {formatRupiah(item.price)}
                    </span>
                    <strong>
                      {formatRupiah(
                        item.subtotal ||
                          Number(item.quantity || 0) *
                            Number(item.price || 0)
                      )}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="order-detail-empty">
              Item pesanan tidak tersedia.
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}