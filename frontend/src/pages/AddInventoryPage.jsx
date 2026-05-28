import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Sparkles } from 'lucide-react'
import Layout from '../components/AppLayout'
import { addInventory } from '../services/inventoryService'
import '../styles/addInventory.css'

export default function AddInventoryPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    food_name: '',
    category: '',
    purchase_date: '',
    quantity: '',
    unit: '',
    storage_location: '',
  })
  const [loading, setLoading] = useState(false)
  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.food_name.trim()) {
      alert('Nama makanan wajib diisi')
      return
    }
    if (!formData.category) {
      alert('Pilih kategori terlebih dahulu')
      return
    }
    if (!formData.purchase_date) {
      alert('Tanggal beli wajib diisi')
      return
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      alert('Jumlah harus lebih dari 0')
      return
    }
    if (!formData.unit) {
      alert('Pilih satuan terlebih dahulu')
      return
    }
    if (!formData.storage_location) {
      alert('Pilih tempat penyimpanan terlebih dahulu')
      return
    }
    try {
      setLoading(true)
      const payload = {
        food_name: formData.food_name.trim(),
        category: formData.category,
        purchase_date: formData.purchase_date,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        storage_location: formData.storage_location,
      }
      await addInventory(payload)
      navigate('/inventory', {
        replace: true,
      })
    } catch (error) {
      alert(error.message || 'Gagal menambahkan inventory')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  function handleCancel() {
    navigate('/inventory')
  }
  return (
    <Layout title="Tambah Inventaris" activeMenu="inventory">
      <section className="add-content">
        <form className="add-form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Makanan</label>
              <input
                type="text"
                name="food_name"
                placeholder="Masukkan nama makanan"
                value={formData.food_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Pilih kategori</option>
                <option value="buah">Buah</option>
                <option value="sayur">Sayur</option>
                <option value="protein">Protein</option>
                <option value="susu">Susu</option>
                <option value="roti">Roti</option>
                <option value="minuman">Minuman</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="form-group date-field">
              <label>Tanggal Beli</label>
              <div className="date-wrapper">
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  required
                />
                <CalendarDays size={22} strokeWidth={2.2} />
              </div>
            </div>
            <div className="form-group">
              <label>Jumlah</label>
              <input
                type="number"
                name="quantity"
                placeholder="Masukkan jumlah"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Satuan</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="">Pilih satuan</option>
                <option value="gr">gr</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="liter">liter</option>
                <option value="pcs">pcs</option>
                <option value="ikat">ikat</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Tempat Penyimpanan</label>
              <select
                name="storage_location"
                value={formData.storage_location}
                onChange={handleChange}
                required
              >
                <option value="">Pilih tempat penyimpanan</option>
                <option value="Kulkas">Kulkas</option>
                <option value="Freezer">Freezer</option>
                <option value="Suhu ruang">Suhu ruang</option>
              </select>
            </div>
          </div>
          <div className="prediction-box">
            <div className="prediction-icon">
              <Sparkles size={38} strokeWidth={2.2} />
            </div>
            <div>
              <h3>Prediksi AI</h3>
              <p>
                Sistem AI akan memprediksi tanggal kedaluwarsa, masa simpan,
                dan status risiko berdasarkan data bahan makanan yang Anda
                masukkan.
              </p>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  )
}