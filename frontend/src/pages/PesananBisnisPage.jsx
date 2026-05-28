import { useEffect, useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout'
import { getSales, updateTransactionStatus } from '../services/transactionService'
import '../styles/pesananBisnis.css'

export default function PesananBisnisPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

useEffect(() => {
  async function loadOrders() {
    try {
      setLoading(true)
      const data = await getSales()
      setOrders(data || [])
    } catch (error) {
      console.error(error)
      alert(
        error.message ||
          'Gagal mengambil data pesanan'
      )
    } finally {
      setLoading(false)
    }
  }
  loadOrders()
}, [])

  async function handleChangeStatus(id, status) {
    try {
      await updateTransactionStatus(id, status)
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                status,
              }
            : order
        )
      )
    } catch (error) {
      alert(
        error.message ||
          'Gagal mengubah status'
      )
    }
  }

  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  function formatItems(order) {
    const items = order.items || []
    if (!items.length) {
      return '-'
    }
    return items
      .map((item) => {
        const productName =
          item.product_name ||
          item.food_name ||
          item.name ||
          'Produk'
        const quantity =
          item.quantity || 0
        const unit =
          item.unit || 'pcs'
        return `${productName} (${quantity} ${unit})`
      })
      .join(', ')
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.toLowerCase()
      const itemsText =
        formatItems(order).toLowerCase()
      return (
        order.transaction_code
          ?.toLowerCase()
          .includes(keyword) ||
        order.buyer_name
          ?.toLowerCase()
          .includes(keyword) ||
        order.status
          ?.toLowerCase()
          .includes(keyword) ||
        itemsText.includes(keyword)
      )
    })
  }, [orders, search])

  const totalPages =
    Math.ceil(
      filteredOrders.length / itemsPerPage
    ) || 1

  const startIndex =
    (currentPage - 1) * itemsPerPage

  const currentOrders =
    filteredOrders.slice(
      startIndex,
      startIndex + itemsPerPage
    )

  return (
    <BusinessLayout title="PESANAN">
      <div className="business-order-page">
        <div className="business-order-header">
          <h2>Daftar Pesanan</h2>
        </div>
        <div className="business-order-toolbar">
          <div className="business-order-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Cari pesanan atau item..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
        <div className="business-order-card">
          <div className="business-order-table-wrapper">
            <table className="business-order-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Pembeli</th>
                  <th>Item Dibeli</th>
                  <th>Total Item</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-order"
                    >
                      Memuat pesanan...
                    </td>
                  </tr>
                ) : currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        {order.transaction_code}
                      </td>
                      <td>
                        {order.buyer_name || '-'}
                      </td>
                      <td className="order-items-cell">
                        {formatItems(order)}
                      </td>
                      <td>
                        {order.total_items || 0} item
                      </td>
                      <td>
                        {formatRupiah(
                          order.total_price
                        )}
                      </td>
                      <td>
                        <select
                          className={`status-select ${order.status}`}
                          value={order.status}
                          onChange={(e) =>
                            handleChangeStatus(
                              order.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="pending">
                            Pending
                          </option>
                          <option value="diproses">
                            Diproses
                          </option>
                          <option value="selesai">
                            Selesai
                          </option>
                          <option value="dibatalkan">
                            Dibatalkan
                          </option>
                        </select>
                      </td>
                      <td>
                        {order.created_at || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-order"
                    >
                      Belum ada pesanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="business-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(
                  (prev) => prev - 1
                )
              }
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (prev) => prev + 1
                )
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </BusinessLayout>
  )
}