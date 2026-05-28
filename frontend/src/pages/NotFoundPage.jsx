import { Link } from 'react-router-dom'
import '../styles/notfound.css'

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <h1>404</h1>
        <h2>Halaman Tidak Ditemukan</h2>
        <p>Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.</p>

        <Link to="/" className="notfound-btn">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}