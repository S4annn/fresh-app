import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CalendarDays, Eye, Store, MapPin } from 'lucide-react'
import Layout from '../components/AppLayout'
import { getMyOrders } from '../services/transactionService'
import '../styles/pesanan.css'

export default function PesananPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        const data = await getMyOrders()
        setOrders(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        alert(
          error.message ||
          'Gagal mengambil data pesanan'
        )
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

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

  return (
    <Layout title="PESANAN">
      <div className="pesanan-page">
        <div className="pesanan-header">
          <div>
            <h1>Pesanan</h1>
            <p>
              Daftar transaksi pembelian dari marketplace.
            </p>
          </div>
        </div>
        <div className="pesanan-card">
          <div className="pesanan-card-header">
            <h2>Daftar Pesanan</h2>
            <span>{orders.length} pesanan</span>
          </div>
          {loading ? (
            <div className="pesanan-empty">
              Memuat pesanan...
            </div>
          ) : orders.length === 0 ? (
            <div className="pesanan-empty">
              Belum ada pesanan.
            </div>
          ) : (
            <div className="pesanan-list">
              {orders.map((order) => (
                <div
                  className="pesanan-item"
                  key={order.id}
                >
                  <div className="pesanan-code">
                    <div className="pesanan-icon">
                      <FileText size={26} />
                    </div>
                    <div>
                      <h3>
                        {order.transaction_code ||
                          `TRX-${order.id}`}
                      </h3>
                      <p>
                        <CalendarDays size={16} />
                        {order.created_at || '-'}
                      </p>
                      <p className="pesanan-seller">
                        <Store size={16} />
                        {order.seller_name || 'Nama toko tidak tersedia'}
                      </p>
                      <p className="pesanan-address">
                        <MapPin size={16} />
                        {order.seller_address || 'Alamat toko tidak tersedia'}
                      </p>
                    </div>
                  </div>
                  <div className="pesanan-status-box">
                    <p>Status</p>
                    <span
                      className={getStatusClass(order.status)}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="pesanan-total">
                    <p>Total Harga</p>
                    <h3>
                      {formatRupiah(order.total_price)}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="pesanan-detail-btn"
                    onClick={() =>
                      navigate(`/pesanan/${order.id}`)
                    }
                  >
                    <Eye size={16} />
                    Detail
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}