import { useEffect, useState } from 'react'
import { MapPin, Plus, X, Trash2, CheckCircle, XCircle, Navigation } from 'lucide-react'
import Layout from '../components/AppLayout'
import DonationMap from '../components/DonationMap'
import LocationPicker from '../components/LocationPicker'
import { useFeedback } from '../components/feedback/feedbackContext'
import {
  getDonations,
  addDonation,
  deleteDonation,
  addDonationRequest,
  getDonationRequests,
  getMyDonationRequests,
  updateDonationRequestStatus,
} from '../services/donationService'
import { loadUserLocation } from '../utils/geo'
import '../styles/donasi.css'

export default function DonasiPage() {
  const feedback = useFeedback()
  const [donations, setDonations] = useState([])
  const [requests, setRequests] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('others')
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAllDistance, setShowAllDistance] = useState(false)
  const [requestForm, setRequestForm] = useState({ quantity: 1, pickup_time: '', notes: '' })
  const [newDonation, setNewDonation] = useState({
    food_name: '', quantity: '', unit: '', pickup_location: '',
    pickup_location_obj: null, // {location_name, latitude, longitude}
    expiry_date: '', notes: '',
  })

  async function loadIncomingRequests(donationData) {
    const myDonationItems = donationData.filter((item) => item.is_my_donation === true)
    const requestResults = await Promise.all(
      myDonationItems.map(async (donation) => {
        try {
          const requestData = await getDonationRequests(donation.id)
          return requestData.map((request) => ({
            ...request,
            donation_food_name: donation.food_name,
            donation_unit: donation.unit,
            donation_pickup_location: donation.pickup_location,
          }))
        } catch (error) {
          console.error(error.message)
          return []
        }
      })
    )
    setRequests(requestResults.flat())
  }

  async function fetchData() {
    try {
      setLoading(true)
      const [donationData, myRequestData] = await Promise.all([
        getDonations(),
        getMyDonationRequests(),
      ])
      setDonations(donationData || [])
      setMyRequests(myRequestData || [])
      await loadIncomingRequests(donationData || [])
    } catch (error) {
      feedback.error(error.message || 'Gagal mengambil data donasi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshData() {
    try {
      setActionLoading(true)
      const [donationData, myRequestData] = await Promise.all([
        getDonations(),
        getMyDonationRequests(),
      ])
      setDonations(donationData || [])
      setMyRequests(myRequestData || [])
      await loadIncomingRequests(donationData || [])
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  async function silentRefreshData() {
    try {
      const [donationData, myRequestData] = await Promise.all([
        getDonations(),
        getMyDonationRequests(),
      ])
      setDonations(donationData || [])
      setMyRequests(myRequestData || [])
      await loadIncomingRequests(donationData || [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeTab !== 'mine') return
    const interval = setInterval(() => {
      silentRefreshData()
    }, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const availableOtherDonations = donations.filter(
    (item) =>
      !item.is_my_donation &&
      item.status === 'available' &&
      Number(item.remaining_quantity) > 0
  )

  const nearDonations = availableOtherDonations.filter((item) => {
    const distance = Number(item.donation_distance)
    if (Number.isNaN(distance)) return true
    return distance <= 10
  })

  const farDonations = availableOtherDonations.filter((item) => {
    const distance = Number(item.donation_distance)
    return !Number.isNaN(distance) && distance > 10
  })

  const otherDonations = showAllDistance ? availableOtherDonations : nearDonations
  const farDonationCount = farDonations.length
  const myDonations = donations.filter((item) => item.is_my_donation === true)

  function openRequestModal(item) {
    setSelectedDonation(item)
    setRequestForm({ quantity: 1, pickup_time: '', notes: '' })
  }

  function closeRequestModal() {
    setSelectedDonation(null)
  }

  async function handleSubmitRequest(e) {
    e.preventDefault()
    if (!selectedDonation) return
    const requestedQuantity = Number(requestForm.quantity)
    const availableQuantity = Number(selectedDonation.remaining_quantity)
    if (requestedQuantity < 1) {
      feedback.warning('Jumlah minimal 1')
      return
    }
    if (requestedQuantity > availableQuantity) {
      feedback.warning('Jumlah permintaan melebihi stok donasi')
      return
    }
    try {
      setActionLoading(true)
      await addDonationRequest(selectedDonation.id, {
        quantity: requestedQuantity,
        pickup_time: requestForm.pickup_time || null,
        notes: requestForm.notes || null,
      })
      closeRequestModal()
      setActiveTab('myRequests')
      await refreshData()
      feedback.success('Permintaan donasi berhasil dikirim')
    } catch (error) {
      feedback.error(error.message || 'Gagal mengirim permintaan donasi')
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRequestStatus(request, status) {
    try {
      setActionLoading(true)
      await updateDonationRequestStatus(request.id, status)
      setRequests((prev) =>
        prev.map((item) => item.id === request.id ? { ...item, status } : item)
      )
      await refreshData()
      feedback.success(
        status === 'approved'
          ? 'Permintaan berhasil diterima'
          : 'Permintaan berhasil ditolak'
      )
    } catch (error) {
      feedback.error(error.message || 'Gagal memperbarui status permintaan')
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAddDonation(e) {
    e.preventDefault()
    try {
      setActionLoading(true)
      await addDonation({
        food_name: newDonation.food_name.trim(),
        quantity: Number(newDonation.quantity),
        unit: newDonation.unit.trim(),
        pickup_location: newDonation.pickup_location_obj?.location_name || newDonation.pickup_location.trim(),
        latitude: newDonation.pickup_location_obj?.latitude || null,
        longitude: newDonation.pickup_location_obj?.longitude || null,
        expiry_date: newDonation.expiry_date,
        notes: newDonation.notes || null,
      })
      setNewDonation({ food_name: '', quantity: '', unit: '', pickup_location: '', pickup_location_obj: null, expiry_date: '', notes: '' })
      setShowAddModal(false)
      setActiveTab('mine')
      await refreshData()
      feedback.success('Donasi berhasil ditambahkan')
    } catch (error) {
      feedback.error(error.message || 'Gagal menambahkan donasi')
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteDonation(id) {
    const confirmed = await feedback.confirm({
      title: 'Hapus Donasi',
      message: 'Yakin ingin menghapus donasi ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    })
    if (!confirmed) return
    try {
      setActionLoading(true)
      await deleteDonation(id)
      setDonations((prev) => prev.filter((item) => item.id !== id))
      await refreshData()
      feedback.success('Donasi berhasil dihapus')
    } catch (error) {
      feedback.error(error.message || 'Gagal menghapus donasi')
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  function formatDistance(distance) {
    if (distance === null || distance === undefined) return '-'
    return `${distance} km`
  }

  function getStatusText(status) {
    if (status === 'approved') return 'Diterima'
    if (status === 'rejected') return 'Ditolak'
    return 'Menunggu'
  }

  function formatPickupTime(dateString) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '-'
    const tanggal = date.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
    })
    const jam = date.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
    })
    return `${tanggal} • ${jam} WIB`
  }

  return (
    <Layout pageTitle="DONASI">
      <section className="donation-content">
        <div className="donation-card">
          {actionLoading && (
            <div className="donation-action-loading">Memperbarui data...</div>
          )}

          {/* Banner lokasi belum diatur */}
          {(() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const savedLoc = loadUserLocation()
            const hasLocation = (user.latitude && user.longitude) || (savedLoc?.latitude && savedLoc?.longitude)
            if (hasLocation) return null
            return (
              <div className="location-banner" style={{ marginBottom: 16 }}>
                <div className="location-banner__icon">
                  <Navigation size={20} strokeWidth={2.5} />
                </div>
                <div className="location-banner__text">
                  <strong>Lokasi belum diatur</strong>
                  <span>Atur lokasi agar bisa melihat donasi terdekat dan jarak ke donatur.</span>
                </div>
                <a href="/profile" className="location-banner__btn">
                  <MapPin size={14} strokeWidth={2.5} />
                  Atur Lokasi
                </a>
              </div>
            )
          })()}
          <div className="donation-top-actions">
            <button
              type="button"
              className={activeTab === 'others' ? 'donation-filter-btn active' : 'donation-filter-btn'}
              onClick={() => setActiveTab('others')}
            >
              Donasi Orang Lain
            </button>
            <button
              type="button"
              className={activeTab === 'myRequests' ? 'donation-filter-btn active' : 'donation-filter-btn'}
              onClick={() => setActiveTab('myRequests')}
            >
              Permintaan Saya
            </button>
            <button
              type="button"
              className={activeTab === 'mine' ? 'donation-filter-btn active' : 'donation-filter-btn'}
              onClick={() => setActiveTab('mine')}
            >
              Donasi Saya
            </button>
          </div>

          {loading ? (
            <div className="donation-body-loading">Memuat donasi...</div>
          ) : activeTab === 'myRequests' ? (
            <div className="request-list">
              {myRequests.length > 0 ? (
                myRequests.map((request) => (
                  <div className="request-item" key={request.id}>
                    <div>
                      <h3>{request.food_name || request.donation_food_name || 'Donasi'}</h3>
                      <p>Donatur: {request.donor_name || '-'}</p>
                      <p>Alamat: {request.pickup_location || request.donor_address || request.address || '-'}</p>
                      <p>Jumlah: {request.quantity} {request.unit || request.donation_unit || ''}</p>
                      <p>Waktu Ambil: {formatPickupTime(request.pickup_time)}</p>
                      <p>Catatan: {request.notes || '-'}</p>
                      <span className={`request-status ${request.status}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="donation-empty">Belum ada permintaan donasi yang kamu kirim.</div>
              )}
            </div>
          ) : activeTab === 'others' ? (
            <>
              <div className="donation-map-card">
                <DonationMap items={otherDonations} />
              </div>
              <div className="donation-distance-filter">
                <p>
                  {showAllDistance
                    ? 'Semua donasi ditampilkan.'
                    : 'Menampilkan donasi dalam jarak 10 km.'}
                </p>
                <button
                  type="button"
                  className="show-distance-btn"
                  onClick={() => setShowAllDistance((prev) => !prev)}
                >
                  {showAllDistance
                    ? 'Tampilkan ≤ 10 km'
                    : `Tampilkan Semua${farDonationCount > 0 ? ` (${farDonationCount} jauh)` : ''}`}
                </button>
              </div>
              <div className="donation-list">
                {otherDonations.length > 0 ? (
                  otherDonations.map((item) => (
                    <div className="donation-item" key={item.id}>
                      <div className="donation-left">
                        <h2>{item.food_name}</h2>
                        <h3>{item.remaining_quantity} {item.unit}</h3>
                        <p>Donatur: {item.donor_name || '-'}</p>
                        <p>Lokasi: {item.pickup_location || '-'}</p>
                      </div>
                      <div className="donation-middle">
                        <div className="donation-distance">
                          <MapPin size={30} strokeWidth={2.2} />
                          <span>{formatDistance(item.donation_distance)}</span>
                        </div>
                        <p>Kedaluwarsa: {item.expiry_date || '-'}</p>
                      </div>
                      <div className="donation-right">
                        <button
                          type="button"
                          className="take-donation-btn"
                          onClick={() => openRequestModal(item)}
                          disabled={actionLoading}
                        >
                          Minta Donasi
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="donation-empty">
                    {showAllDistance
                      ? 'Belum ada donasi orang lain.'
                      : 'Belum ada donasi dalam jarak 10 km.'}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="my-donation-layout">
              <div className="my-donation-column">
                <div className="column-header">
                  <h2>Item Donasi Saya</h2>
                  <button
                    type="button"
                    className="add-donation-btn"
                    onClick={() => setShowAddModal(true)}
                    disabled={actionLoading}
                  >
                    <Plus size={18} />
                    Tambah
                  </button>
                </div>
                <div className="my-donation-list">
                  {myDonations.length > 0 ? (
                    myDonations.map((item) => {
                      const itemRequests = requests.filter(
                        (request) => Number(request.donation_id) === Number(item.id)
                      )
                      return (
                        <div className="my-donation-item" key={item.id}>
                          <div>
                            <h3>{item.food_name}</h3>
                            <p>Sisa: {item.remaining_quantity} {item.unit}</p>
                            <p className="donation-location">{item.pickup_location || '-'}</p>
                            <p>Status: {item.status}</p>
                            <p>Permintaan Masuk: {itemRequests.length}</p>
                          </div>
                          <button
                            type="button"
                            className="reject-btn"
                            onClick={() => handleDeleteDonation(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <div className="donation-empty">Belum ada item donasi saya.</div>
                  )}
                </div>
              </div>
              <div className="request-column">
                <div className="column-header">
                  <h2>Permintaan Masuk</h2>
                </div>
                <div className="request-list">
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <div className="request-item" key={request.id}>
                        <div>
                          <h3>{request.donation_food_name || 'Donasi'}</h3>
                          <p>Pemohon: {request.requester_name || '-'}</p>
                          <p>Alamat: {request.requester_address || request.address || '-'}</p>
                          <p>Jumlah: {request.quantity} {request.donation_unit || ''}</p>
                          <p>Waktu Ambil: {formatPickupTime(request.pickup_time)}</p>
                          <p>Catatan: {request.notes || '-'}</p>
                          <span className={`request-status ${request.status}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                        {request.status === 'pending' && (
                          <div className="request-actions">
                            <button
                              type="button"
                              className="accept-btn"
                              onClick={() => handleRequestStatus(request, 'approved')}
                              disabled={actionLoading}
                            >
                              <CheckCircle size={16} />
                              Terima
                            </button>
                            <button
                              type="button"
                              className="reject-btn"
                              onClick={() => handleRequestStatus(request, 'rejected')}
                              disabled={actionLoading}
                            >
                              <XCircle size={16} />
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="donation-empty">Belum ada permintaan masuk.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal permintaan donasi */}
      {selectedDonation && (
        <div className="modal-overlay">
          <form className="donation-modal" onSubmit={handleSubmitRequest}>
            <button type="button" className="modal-close" onClick={closeRequestModal}>
              <X size={22} />
            </button>
            <h2>Minta Donasi</h2>
            <p className="modal-food-name">{selectedDonation.food_name}</p>
            <p className="modal-stock-info">
              Tersedia: {selectedDonation.remaining_quantity} {selectedDonation.unit}
            </p>
            <p className="modal-stock-info">
              Alamat Penjemputan: {selectedDonation.pickup_location || '-'}
            </p>
            <label>Jumlah</label>
            <input
              type="number"
              min="1"
              max={selectedDonation.remaining_quantity}
              value={requestForm.quantity}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, quantity: e.target.value }))}
              required
            />
            <label>Waktu Penjemputan</label>
            <input
              type="datetime-local"
              value={requestForm.pickup_time}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, pickup_time: e.target.value }))}
            />
            <label>Catatan</label>
            <textarea
              placeholder="Tulis catatan untuk donatur..."
              value={requestForm.notes}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
            <button type="submit" className="modal-submit-btn" disabled={actionLoading}>
              Kirim Permintaan
            </button>
          </form>
        </div>
      )}

      {/* Modal tambah donasi */}
      {showAddModal && (
        <div className="modal-overlay">
          <form className="donation-modal" onSubmit={handleAddDonation}>
            <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>
              <X size={22} />
            </button>
            <h2>Tambah Donasi</h2>
            <label>Nama Makanan</label>
            <input
              type="text"
              value={newDonation.food_name}
              onChange={(e) => setNewDonation((prev) => ({ ...prev, food_name: e.target.value }))}
              required
            />
            <label>Jumlah</label>
            <input
              type="number"
              min="1"
              value={newDonation.quantity}
              onChange={(e) => setNewDonation((prev) => ({ ...prev, quantity: e.target.value }))}
              required
            />
            <label>Satuan</label>
            <input
              type="text"
              placeholder="Bungkus / Ikat / Box"
              value={newDonation.unit}
              onChange={(e) => setNewDonation((prev) => ({ ...prev, unit: e.target.value }))}
              required
            />

            {/* LocationPicker untuk lokasi penjemputan */}
            <LocationPicker
              value={newDonation.pickup_location_obj}
              onChange={(loc) => setNewDonation((prev) => ({
                ...prev,
                pickup_location_obj: loc,
                pickup_location: loc?.location_name || '',
              }))}
              label="Lokasi Penjemputan"
              placeholder="Cari atau gunakan lokasi saat ini"
              countryCode="id"
              required
            />

            <label>Kedaluwarsa</label>
            <input
              type="date"
              value={newDonation.expiry_date}
              onChange={(e) => setNewDonation((prev) => ({ ...prev, expiry_date: e.target.value }))}
              required
            />
            <label>Catatan</label>
            <textarea
              placeholder="Opsional"
              value={newDonation.notes}
              onChange={(e) => setNewDonation((prev) => ({ ...prev, notes: e.target.value }))}
            />
            <button type="submit" className="modal-submit-btn" disabled={actionLoading}>
              Simpan Donasi
            </button>
          </form>
        </div>
      )}
    </Layout>
  )
}
