import { useRef, useState } from 'react'
import { Upload, Camera, CalendarDays, CircleAlert, Archive, ShieldCheck, ImageIcon, RotateCcw, ScanSearch } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import BusinessLayout from '../components/BusinessLayout'
import { scanFoodImage } from '../services/scanService'
import '../styles/pemindaiAI.css'

export default function PemindaiAIPage() {
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  )

  const Layout =
    user.role === 'bisnis'
      ? BusinessLayout
      : AppLayout

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5 MB')
      e.target.value = ''
      return
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setPrediction(null)
    e.target.value = ''
  }

  function handleChooseImage() {
    fileInputRef.current?.click()
  }

  async function handleOpenCamera() {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
          audio: false,
        })
      setCameraStream(stream)
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (error) {
      alert(
        'Kamera tidak bisa dibuka. Pastikan izin kamera sudah diaktifkan.'
      )
      console.error(error)
    }
  }

  function handleCloseCamera() {
    if (cameraStream) {
      cameraStream
        .getTracks()
        .forEach((track) => track.stop())
    }
    setCameraStream(null)
    setShowCamera(false)
  }

  function handleCapturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File(
          [blob],
          'camera-photo.jpg',
          {
            type: 'image/jpeg',
          }
        )
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setSelectedImage(file)
        setPreviewUrl(URL.createObjectURL(file))
        setPrediction(null)
        handleCloseCamera()
      },
      'image/jpeg',
      0.9
    )
  }

  function handleReset() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedImage(null)
    setPreviewUrl('')
    setPrediction(null)
    setLoading(false)
  }

  async function handleScan() {
    if (!selectedImage) {
      alert('Unggah foto terlebih dahulu')
      return
    }
    try {
      setLoading(true)
      setPrediction(null)
      const data = await scanFoodImage(selectedImage)
      setPrediction(data)
    } catch (error) {
      alert(error.message || 'Gagal memindai makanan')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function getRiskClass(risk) {
    const value = String(risk || '').toLowerCase()
    if (value === 'high' || value === 'tinggi') {
      return 'risk-high'
    }
    if (
      value === 'warning' ||
      value === 'medium' ||
      value === 'sedang'
    ) {
      return 'risk-medium'
    }
    return 'risk-low'
  }

  const detectedFood =
    prediction?.detected_food ||
    prediction?.food_name ||
    '-'

  const category =
    prediction?.category ||
    '-'

  const shelfLife =
    prediction?.estimated_shelf_life_days ||
    prediction?.shelf_life ||
    null

  const riskLabel =
    prediction?.risk_label ||
    prediction?.risk ||
    '-'

  const topPredictions =
    Array.isArray(prediction?.top_predictions)
      ? prediction.top_predictions
      : Array.isArray(prediction?.predictions)
        ? prediction.predictions
        : []

  const recommendations =
    Array.isArray(prediction?.recommendations)
      ? prediction.recommendations
      : []

  return (
    <Layout title="PEMINDAI AI" pageTitle="PEMINDAI AI">
      <section className="ai-content">
        <div className="ai-card">
          <div className="ai-left">
            <div className="upload-box">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="upload-input"
                onChange={handleImageChange}
              />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pratinjau makanan"
                  className="preview-image"
                />
              ) : (
                <>
                  <div className="upload-icon">
                    <Camera size={54} />
                  </div>
                  <p>
                    Seret & lepas foto makanan di sini,
                    <br />
                    atau pilih tombol unggah/kamera
                  </p>
                  <span>
                    Format: JPG, PNG Maks. 5MB
                  </span>
                </>
              )}
            </div>
            <div className="image-actions">
              <button
                type="button"
                className="change-image-btn"
                onClick={handleChooseImage}
              >
                <Upload size={20} />
                Unggah Foto
              </button>
              <button
                type="button"
                className="camera-btn"
                onClick={handleOpenCamera}
              >
                <Camera size={20} />
                Buka Kamera
              </button>
            </div>
            {selectedImage && (
              <button
                type="button"
                className="reset-image-btn"
                onClick={handleReset}
              >
                <RotateCcw size={20} />
                Reset
              </button>
            )}
            <button
              className="scan-btn"
              type="button"
              onClick={handleScan}
              disabled={loading}
            >
              <ScanSearch size={26} />
              {loading
                ? 'Memindai...'
                : 'Pindai Makanan'}
            </button>
            <div className="security-note">
              <ShieldCheck size={22} />
              <p>
                Foto Anda aman dan hanya digunakan
                <br />
                untuk analisis makanan.
              </p>
            </div>
          </div>
          <div className="ai-right">
            {!prediction && !loading && (
              <div className="result-card empty-result">
                <div className="empty-icon">
                  <ImageIcon size={42} />
                </div>
                <h2>Belum Ada Hasil Prediksi</h2>
                <p>
                  Unggah foto makanan terlebih dahulu,
                  lalu klik tombol Pindai Makanan.
                </p>
              </div>
            )}
            {loading && (
              <div className="result-card empty-result">
                <div className="loading-spinner"></div>
                <h2>Menganalisis Foto...</h2>
                <p>
                  Sistem sedang memproses gambar makanan.
                </p>
              </div>
            )}
            {prediction && (
              <div className="prediction-scroll">
                <div className="result-card">
                  <h2>Hasil Prediksi</h2>
                  <div
                    className={`prediction-main ${getRiskClass(
                      riskLabel
                    )}`}
                  >
                    <div>
                      <h3>{detectedFood}</h3>
                      <p>{category}</p>
                    </div>
                    <div className="prediction-info">
                      <div className="info-box">
                        <CalendarDays size={24} />
                        <div>
                          <p>Umur simpan</p>
                          <b>
                            {shelfLife
                              ? `${shelfLife} hari`
                              : '-'}
                          </b>
                        </div>
                      </div>
                      <div className="info-box warning">
                        <CircleAlert size={24} />
                        <div>
                          <p>Risiko</p>
                          <b>{riskLabel}</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="result-card">
                  <h2>Prediksi Teratas</h2>
                  <div className="prediction-list">
                    {topPredictions.length > 0 ? (
                      topPredictions.map(
                        (item, index) => {
                          const percent =
                            item.percent ??
                            ((item.confidence || 0) *
                              100)
                          return (
                            <div
                              className="prediction-item"
                              key={index}
                            >
                              <span>{index + 1}</span>
                              <p>
                                {item.label ||
                                  item.name ||
                                  '-'}
                              </p>
                              <div className="bar">
                                <div
                                  style={{
                                    width: `${Number(
                                      percent
                                    ).toFixed(2)}%`,
                                  }}
                                ></div>
                              </div>
                              <b>
                                {Number(percent).toFixed(0)}
                                %
                              </b>
                            </div>
                          )
                        }
                      )
                    ) : (
                      <p>Tidak ada data prediksi.</p>
                    )}
                  </div>
                </div>
                <div className="result-card">
                  <h2>Saran Penyimpanan</h2>
                  <div className="storage-box">
                    <div className="storage-icon">
                      <Archive size={32} />
                    </div>
                    <p>
                      {prediction.storage_advice ||
                        'Belum ada saran penyimpanan.'}
                    </p>
                  </div>
                </div>
                <div className="result-card">
                  <h2>Rekomendasi</h2>
                  <div className="recommendation-list">
                    {recommendations.length > 0 ? (
                        recommendations.map((item, index) => (
                      <div
                        className="recommendation-item"
                        key={index}
                      >
                      <span>{index + 1}</span>
                      <p>{item}</p>
                    </div>
                  ))
                    ) : (
                    <p>Belum ada rekomendasi.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {showCamera && (
        <div className="camera-overlay">
          <div className="camera-modal">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-preview"
            />
            <canvas
              ref={canvasRef}
              className="camera-canvas"
            />
            <div className="camera-actions">
              <button
                type="button"
                className="camera-cancel-btn"
                onClick={handleCloseCamera}
              >
                Batalkan
              </button>
              <button
                type="button"
                className="camera-capture-btn"
                onClick={handleCapturePhoto}
              >
                Ambil Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}