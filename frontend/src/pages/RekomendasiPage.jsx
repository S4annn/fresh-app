import { useEffect, useState } from 'react'
import { AlertTriangle, Info, ChefHat, ArrowUp } from 'lucide-react'
import Layout from '../components/AppLayout'
import { getRecommendations } from '../services/recommendationService'
import '../styles/rekomendasi.css'

export default function RecommendationPage() {
  const [useTodayItems, setUseTodayItems] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true)
        const data = await getRecommendations()
        setUseTodayItems(data.use_today_items || [])
        setRecommendations(data.recommendations || [])
      } catch (error) {
        alert(
          error.message ||
            'Gagal mengambil rekomendasi'
        )
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  function getStatusClass(status) {
    if (status === 'high') return 'high'
    if (status === 'warning') return 'warning'
    return 'fresh'
  }

  function getStatusLabel(item) {
    return item.status_label || 'Aman'
  }

  function getAmount(item) {
    return `${item.quantity || 0} ${item.unit || ''}`
  }

  return (
    <Layout
      title="REKOMENDASI"
      activeMenu="rekomendasi"
    >
      <section className="recommendation-content">
        <div className="priority-box">
          <div className="priority-title">
            <AlertTriangle size={20} />
            <h2>Gunakan Ini Lebih Dulu</h2>
          </div>
          {loading ? (
            <div className="recommendation-loading">
              Memuat rekomendasi...
            </div>
          ) : useTodayItems.length > 0 ? (
            <div className="priority-list">
              {useTodayItems.map((item) => (
                <div
                  className="priority-item"
                  key={item.id}
                >
                  <span
                    className={`status-badge ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {getStatusLabel(item)}
                  </span>
                  <h3>{item.food_name}</h3>
                  <p>{getAmount(item)}</p>
                  <strong>
                    Kedaluwarsa:{' '}
                    {item.expiry_date}
                  </strong>
                  <p>
                    Sisa {item.days_left} hari
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="priority-empty">
              Belum ada bahan dengan status
              risiko tinggi atau hampir
              kedaluwarsa.
            </p>
          )}
        </div>
        <div className="recipe-grid">
          {loading ? (
            <div className="recommendation-loading"></div>
          ) : recommendations.length > 0 ? (
            recommendations.map(
              (item, index) => (
                <article
                  className="recipe-card"
                  key={
                    item.inventory_id ||
                    item.id ||
                    index
                  }
                >
                  <div className="recipe-card-top">
                    <span
                      className={`status-badge ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status ===
                        'high' && (
                        <ArrowUp size={14} />
                      )}
                      {item.status ===
                        'warning' && (
                        <AlertTriangle
                          size={14}
                        />
                      )}
                      {getStatusLabel(item)}
                    </span>
                    <strong>
                      {item.expiry_date || '-'}
                    </strong>
                  </div>
                  <h3>{item.food_name}</h3>
                  <div className="recipe-title">
                    <ChefHat size={18} />
                    <span>
                      {item.title ||
                        'Rekomendasi Cerdas'}
                    </span>
                  </div>
                  <p>
                    {item.recommendation ||
                      item.ai_recommendation ||
                      item.recipe_description ||
                      item.tips ||
                      'Belum ada rekomendasi untuk bahan ini.'}
                  </p>
                  <div className="recipe-info">
                    <Info size={16} />
                    <span>
                      Jumlah:{' '}
                      {getAmount(item)}
                      {' • '}Lokasi:{' '}
                      {item.storage_location ||
                        '-'}
                    </span>
                  </div>
                </article>
              )
            )
          ) : (
            <div className="recommendation-empty">
              Belum ada rekomendasi AI.
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}