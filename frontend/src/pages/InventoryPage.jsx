import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock3, Pencil, Trash2, X, CheckCircle } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { getInventory, updateInventory, deleteInventory } from '../services/inventoryService'
import { createInventoryOut } from '../services/inventoryOutService'
import '../styles/inventory.css'

export default function InventoryPage() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [showEditModal, setShowEditModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showUseModal, setShowUseModal] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState(null)
  const [useForm, setUseForm] = useState({
    quantity: '',
    notes: '',
  })
  const [form, setForm] = useState({ food_name: '', quantity: '', unit: '', category: '', storage_location: '', purchase_date: '' })
  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true)
        const data = await getInventory()
        setInventory(data || [])
      } catch (error) {
        alert(error.message || 'Gagal mengambil data inventaris')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [])

  async function reloadInventory() {
    try {
      const data = await getInventory()
      setInventory(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  function handleSearch() {
    setSearchQuery(search.trim())
    setCurrentPage(1)
  }

  function getDaysLeftText(item) {
    if (item.status === 'empty') return 'Stok habis'
    const daysLeft = Number(item.days_left)
    if (Number.isNaN(daysLeft)) return '-'
    if (daysLeft < 0) return `Kadaluarsa ${Math.abs(daysLeft)} hari`
    if (daysLeft === 0) return 'Hari ini'
    if (daysLeft === 1) return '1 hari lagi'
    return `${daysLeft} hari lagi`
  }

  function getStatusClass(status) {
    const value = String(status || '').toLowerCase()
    if (value === 'expired') return 'expired'
    if (value === 'high') return 'high'
    if (value === 'warning') return 'medium'
    if (value === 'fresh') return 'low'
    if (value === 'empty') return 'empty'
    return 'unknown'
  }

  function getStatusLabel(status) {
    const value = String(status || '').toLowerCase()
    if (value === 'expired') return 'Kedaluwarsa'
    if (value === 'high') return 'Risiko Tinggi'
    if (value === 'warning') return 'Peringatan'
    if (value === 'fresh') return 'Segar'
    if (value === 'empty') return 'Stok Habis'
    return 'Tidak diketahui'
  }

  function openEditModal(item) {
    setEditId(item.id)
    setForm({
      food_name: item.food_name || '',
      quantity: item.quantity || '',
      unit: item.unit || '',
      category: item.category || '',
      storage_location: item.storage_location || '',
      purchase_date: item.purchase_date || '',
    })
    setShowEditModal(true)
  }

  function closeEditModal() {
    setShowEditModal(false)
    setEditId(null)
  }

  function openUseModal(item) {
    if (Number(item.quantity) <= 0 || item.status === 'empty') {
      alert('Stok inventaris sudah habis')
      return
    }

    setSelectedInventory(item)
    setUseForm({
      quantity: '',
      notes: '',
    })
    setShowUseModal(true)
  }

  function closeUseModal() {
    setShowUseModal(false)
    setSelectedInventory(null)
    setUseForm({
      quantity: '',
      notes: '',
    })
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    try {
      setSaving(true)
      await updateInventory(editId, {
        food_name: form.food_name,
        quantity: Number(form.quantity),
        unit: form.unit,
        category: form.category,
        storage_location: form.storage_location,
        purchase_date: form.purchase_date,
      })
      await reloadInventory()
      closeEditModal()
    } catch (error) {
      alert(error.message || 'Gagal mengedit item')
    } finally {
      setSaving(false)
    }
  }

  async function handleUseInventory(e) {
    e.preventDefault()
    if (!selectedInventory) return
    const quantity = Number(useForm.quantity)
    if (quantity <= 0) {
      alert('Jumlah harus lebih dari 0')
      return
    }
    if (quantity > Number(selectedInventory.quantity)) {
      alert('Jumlah melebihi stok inventaris')
      return
    }
    try {
      setSaving(true)
      await createInventoryOut(selectedInventory.id, {
        quantity,
        notes: useForm.notes || 'Digunakan dari inventaris',
      })
      await reloadInventory()
      closeUseModal()
      alert('Inventaris berhasil digunakan')
    } catch (error) {
      alert(error.message || 'Gagal menggunakan inventaris')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      'Yakin ingin menghapus item ini?'
    )
    if (!confirmDelete) return
    try {
      await deleteInventory(id)
      setInventory((prev) =>
        prev.filter((item) => item.id !== id)
      )
    } catch (error) {
      alert(error.message || 'Gagal menghapus item')
    }
  }

  const filteredInventory = inventory.filter((item) =>
    item.food_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredInventory.slice(
    startIndex,
    endIndex
  )

  return (
    <AppLayout title="INVENTARIS">
      <div className="inventory-card">
        <div className="inventory-card-header">
          <h2>Daftar Inventaris</h2>
          <button
            className="add-btn"
            type="button"
            onClick={() => navigate('/inventory/add')}
          >
            + Tambah
          </button>
        </div>
        <div className="inventory-toolbar">
          <div className="inventory-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Cari bahan makanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
            />
          </div>
          <button
            className="search-btn"
            type="button"
            onClick={handleSearch}
          >
            Cari
          </button>
        </div>
        <div className="inventory-table">
          <div className="inventory-table-head">
            <div><h4>Nama Bahan</h4></div>
            <div><h4>Jumlah</h4></div>
            <div><h4>Lokasi</h4></div>
            <div><h4>Tanggal Beli</h4></div>
            <div><h4>Sisa Waktu</h4></div>
            <div><h4>Status</h4></div>
            <div><h4>Aksi</h4></div>
          </div>
          <div className="inventory-table-body">
            {loading ? (
              <div className="inventory-empty">
                Memuat data inventaris...
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                <div className="inventory-row" key={item.id}>
                  <div className="inventory-name">
                    <h3>{item.food_name}</h3>
                    <small>{item.category}</small>
                  </div>
                  <div className="inventory-amount">
                    <p>{item.quantity} {item.unit}</p>
                  </div>
                  <div className="inventory-location">
                    <span>{item.storage_location || '-'}</span>
                  </div>
                  <div className="inventory-date">
                    <span>{item.purchase_date}</span>
                  </div>
                  <div
                    className={`inventory-remaining ${getStatusClass(
                      item.status
                    )}`}
                  >
                    <Clock3 size={22} />
                    {getDaysLeftText(item)}
                  </div>
                  <div>
                    <span
                      className={`inventory-priority ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="inventory-actions">
                    <button
                      type="button"
                      className="inventory-use-btn"
                      onClick={() => openUseModal(item)}
                      disabled={
                        Number(item.quantity) <= 0 ||
                        item.status === 'empty'
                      }
                      title="Gunakan inventaris"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      type="button"
                      className="inventory-edit-btn"
                      onClick={() => openEditModal(item)}
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      type="button"
                      className="inventory-delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="inventory-empty">
                Bahan makanan tidak ditemukan.
              </div>
            )}
          </div>
        </div>
        <div className="inventory-footer">
          <p>
            {filteredInventory.length > 0
              ? `Menampilkan ${startIndex + 1}–${Math.min(
                  endIndex,
                  filteredInventory.length
                )} dari ${filteredInventory.length} item`
              : 'Menampilkan 0 dari 0 item'}
          </p>
          <div className="pagination">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                type="button"
                key={index}
                className={
                  currentPage === index + 1 ? 'active-page' : ''
                }
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>
      {showUseModal && selectedInventory && (
        <div className="inventory-modal-overlay">
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <h2>Gunakan Inventaris</h2>
              <button type="button" onClick={closeUseModal}>
                <X size={24} />
              </button>
            </div>
            <form
              className="inventory-modal-form"
              onSubmit={handleUseInventory}
            >
              <label>Nama Bahan</label>
              <input
                type="text"
                value={selectedInventory.food_name}
                disabled
              />
              <label>Stok Tersedia</label>
              <input
                type="text"
                value={`${selectedInventory.quantity}`}
                disabled
              />
              <label>Jumlah Digunakan</label>
              <input
                type="number"
                min="1"
                max={selectedInventory.quantity}
                value={useForm.quantity}
                onChange={(e) =>
                  setUseForm({
                    ...useForm,
                    quantity: e.target.value,
                  })
                }
                required
              />
              <label>Catatan</label>
              <textarea
                placeholder="Contoh: Dipakai untuk masak hari ini"
                value={useForm.notes}
                onChange={(e) =>
                  setUseForm({
                    ...useForm,
                    notes: e.target.value,
                  })
                }
              />
              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="inventory-cancel-btn"
                  onClick={closeUseModal}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inventory-save-btn"
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Gunakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="inventory-modal-overlay">
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <h2>Edit Inventaris</h2>
              <button type="button" onClick={closeEditModal}>
                <X size={24} />
              </button>
            </div>
            <form
              className="inventory-modal-form"
              onSubmit={handleSaveEdit}
            >
              <label>Nama Bahan</label>
              <input
                type="text"
                value={form.food_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    food_name: e.target.value,
                  })
                }
                required
              />
              <label>Jumlah</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: e.target.value,
                  })
                }
                required
              />
              <label>Unit</label>
              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
                required
              >
                <option value="">Pilih unit</option>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="liter">liter</option>
                <option value="ml">ml</option>
                <option value="pack">pack</option>
                <option value="box">box</option>
              </select>
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
              <label>Lokasi Penyimpanan</label>
              <select
                value={form.storage_location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    storage_location: e.target.value,
                  })
                }
                required
              >
                <option value="">Pilih lokasi</option>
                <option value="Kulkas">Kulkas</option>
                <option value="Freezer">Freezer</option>
                <option value="Suhu ruang">Suhu ruang</option>
              </select>
              <label>Tanggal Beli</label>
              <input
                type="date"
                value={form.purchase_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purchase_date: e.target.value,
                  })
                }
                required
              />
              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="inventory-cancel-btn"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inventory-save-btn"
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}