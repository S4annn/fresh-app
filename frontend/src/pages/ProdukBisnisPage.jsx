import { useEffect, useState } from 'react'
import { Search, Plus, CalendarDays, Pencil, Trash2, X, ChevronLeft, ChevronRight, Package, ShoppingBag, MapPin } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout'
import LocationPicker from '../components/LocationPicker'
import { useFeedback } from '../components/feedback/feedbackContext'
import { getMyProducts, addProduct, updateProduct, deleteProduct } from '../services/productService'
import { loadUserLocation } from '../utils/geo'
import '../styles/produkBisnis.css'

const UNIT_OPTIONS = [ 'gr', 'kg', 'gram', 'liter', 'ml', 'ikat', 'pcs']

export default function ProdukBisnisPage() {
  const feedback = useFeedback()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [form, setForm] = useState({
    product_name: '',
    category: '',
    description: '',
    expiry_date: '',
    price: '',
    stock: '',
    unit: 'pcs',
  })

  // Cek apakah user sudah set lokasi
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const savedLoc = loadUserLocation()
  const hasLocation = (user.latitude && user.longitude) || (savedLoc?.latitude && savedLoc?.longitude)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const data = await getMyProducts()
        setProducts(data || [])
      } catch (error) {
        console.error(error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  function resetForm() {
    setForm({
      product_name: '',
      category: '',
      description: '',
      expiry_date: '',
      price: '',
      stock: '',
      unit: 'pcs',
    })
  }

  function openAddModal() {
    setEditId(null)
    resetForm()
    setShowModal(true)
  }

  function openEditModal(product) {
    setEditId(product.id)
    setForm({
      product_name: product.product_name || '',
      category: product.category || '',
      description: product.description || '',
      expiry_date: product.expiry_date || '',
      price: product.price || '',
      stock: product.stock || '',
      unit: product.unit || 'pcs',
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditId(null)
    resetForm()
  }

  async function handleSubmitProduct(e) {
    e.preventDefault()
    const payload = {
      product_name: form.product_name,
      category: form.category,
      description: form.description,
      expiry_date: form.expiry_date,
      price: form.price,
      stock: form.stock,
      unit: form.unit,
    }
    try {
      if (editId) {
        const updated = await updateProduct(editId, payload)
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editId ? updated : item
          )
        )
        feedback.success('Produk berhasil diperbarui')
      } else {
        const created = await addProduct(payload)
        setProducts((prev) => [created, ...prev])
        setCurrentPage(1)
        feedback.success('Produk berhasil ditambahkan')
      }
      closeModal()
    } catch (error) {
      console.error(error)
      feedback.error(error.message || 'Gagal menyimpan produk')
    }
  }

  async function handleDelete(id) {
    const confirmed = await feedback.confirm({
      title: 'Hapus Produk',
      message: 'Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    })
    if (!confirmed) return
    try {
      await deleteProduct(id)
      const updatedProducts = products.filter((item) => item.id !== id)
      setProducts(updatedProducts)
      const newTotalPages = Math.ceil(updatedProducts.length / itemsPerPage) || 1
      setCurrentPage((prev) => Math.min(prev, newTotalPages))
      feedback.success('Produk berhasil dihapus')
    } catch (error) {
      console.error(error)
      feedback.error(error.message || 'Gagal menghapus produk')
    }
  }

  function handleSearchChange(e) {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  function formatPrice(price) {
    const number = Number(price || 0)
    return `Rp. ${number.toLocaleString('id-ID')}`
  }

  function formatDate(date) {
    if (!date) return '-'
    return date
  }

  function getStatusLabel(product) {
    const stock = Number(product.stock || 0)
    const status = String(product.status || 'tersedia').toLowerCase()
    if (stock <= 0 || status === 'habis') {
      return 'Habis'
    }
    return 'Tersedia'
  }

  function getStatusClass(product) {
    const stock = Number(product.stock || 0)
    const status = String(product.status || '').toLowerCase()
    if (
      stock <= 0 ||
      status === 'habis' ||
      status === 'soldout' ||
      status === 'tidak tersedia'
    ) {
      return 'soldout'
    }
    return 'available'
  }

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase()
    return (
      product.product_name?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword)
    )
  })

  const availableProducts = products.filter((product) => {
    const stock = Number(product.stock || 0)
    const status = String(product.status || '').toLowerCase()
    return stock > 0 && status !== 'habis'
  }).length

  const totalPages =
    Math.ceil(filteredProducts.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  )
  const startItem =
    filteredProducts.length === 0 ? 0 : startIndex + 1
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredProducts.length
  )

  return (
    <BusinessLayout title="PRODUK">
      <div className="product-title-section">
        <h2>Daftar Produk</h2>
      </div>

      {/* Banner lokasi belum diatur */}
      {!hasLocation && (
        <div className="location-banner" style={{ marginBottom: 16 }}>
          <div className="location-banner__icon">
            <MapPin size={20} strokeWidth={2.5} />
          </div>
          <div className="location-banner__text">
            <strong>Lokasi toko belum diatur</strong>
            <span>Atur lokasi agar produk Anda muncul di marketplace dengan jarak yang akurat.</span>
          </div>
          <a href="/profile" className="location-banner__btn">
            <MapPin size={14} strokeWidth={2.5} />
            Atur Lokasi
          </a>
        </div>
      )}
      <div className="product-summary-grid">
        <div className="product-summary-card">
          <div className="summary-icon green">
            <Package size={34} />
          </div>
          <div>
            <h3>Total Produk</h3>
            <strong>{products.length}</strong>
          </div>
        </div>
        <div className="product-summary-card">
          <div className="summary-icon orange">
            <ShoppingBag size={34} />
          </div>
          <div>
            <h3>Produk Tersedia</h3>
            <strong>{availableProducts}</strong>
          </div>
        </div>
      </div>
      <div className="product-toolbar">
        <div className="product-search-box">
          <Search size={24} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={handleSearchChange}
          />
          <button type="button">Cari</button>
        </div>
        <button
          type="button"
          className="add-product-btn"
          onClick={openAddModal}
        >
          <Plus size={24} />
          Tambah Produk
        </button>
      </div>
      <div className="product-table-card">
        <div className="product-table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Kedaluwarsa</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-product">
                    Memuat produk...
                  </td>
                </tr>
              ) : currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name-cell">
                        <h4>{product.product_name}</h4>
                        <p>{product.description || '-'}</p>
                      </div>
                    </td>
                    <td>{product.category || '-'}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      {product.stock || 0} {product.unit || 'pcs'}
                    </td>
                    <td>
                      <div className="expired-cell">
                        <CalendarDays size={20} />
                        {formatDate(product.expiry_date)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`business-product-status ${getStatusClass(
                          product
                        )}`}
                      >
                        {getStatusLabel(product)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => openEditModal(product)}
                        >
                          <Pencil size={22} />
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-product">
                    Belum ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="product-pagination">
          <p>
            Menampilkan {startItem}-{endItem} dari{' '}
            {filteredProducts.length} produk
          </p>
          <div className="pagination-actions">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>
            <span>{currentPage}</span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="product-modal-overlay">
          <div className="product-modal">
            <div className="product-modal-header">
              <h2>{editId ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button type="button" onClick={closeModal}>
                <X size={26} />
              </button>
            </div>
            <form
              onSubmit={handleSubmitProduct}
              className="product-modal-form"
            >
              <label>Nama Produk</label>
              <input
                type="text"
                value={form.product_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    product_name: e.target.value,
                  })
                }
                required
              />
              <label>Kategori</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                required
              />
              <label>Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                rows="3"
              />
              <label>Harga</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                required
              />
              <label>Stok</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value,
                  })
                }
                required
              />
              <label>Unit</label>
              <select
                className="product-modal-select"
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
                required
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <label>Kedaluwarsa</label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expiry_date: e.target.value,
                  })
                }
                required
              />
              <button type="submit">
                {editId ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </form>
          </div>
        </div>
      )}
    </BusinessLayout>
  )
}