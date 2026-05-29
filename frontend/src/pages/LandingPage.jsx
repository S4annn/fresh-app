import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Star,
  CheckCircle2,
  Menu,
  X,
  Leaf,
  Sparkles,
  Recycle,
  Heart,
  ScanSearch,
  Bell,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ChefHat,
  Package,
  Lightbulb,
  Users,
  Zap,
  Mail,
  AlertTriangle,
  PackageOpen,
  ClipboardList,
  Brain,
  ShoppingBag,
  BarChart3,
  Building2,
  Home,
  Cake,
  Soup,
  CookingPot,
  Hotel,
  Droplets,
  ArrowDownToLine,
  PlayCircle,
} from 'lucide-react'
import logo from '../assets/images/logo.png'
import '../styles/landing.css'

const NAV_LINKS = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#masalah', label: 'Mengapa F.R.E.S.H' },
  { href: '#fitur', label: 'Fitur' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#dampak', label: 'Dampak' },
  { href: '/pricing', label: 'Harga', external: true },
]

const PROBLEMS = [
  {
    icon: TrendingDown,
    title: 'Stok pangan tidak terpantau',
    desc: 'Bahan menumpuk tanpa visibilitas masa simpan, akhirnya terbuang sebelum sempat dipakai.',
  },
  {
    icon: AlertTriangle,
    title: 'Bahan kedaluwarsa diam-diam',
    desc: 'Tidak ada peringatan otomatis, kerugian baru terlihat saat kulkas atau gudang dibersihkan.',
  },
  {
    icon: PackageOpen,
    title: 'Surplus pangan sulit didistribusikan',
    desc: 'Bisnis butuh saluran cepat untuk menjual diskon atau mendonasikan stok berlebih.',
  },
  {
    icon: Droplets,
    title: 'Dampak lingkungan terabaikan',
    desc: 'Setiap kg makanan terbuang setara dengan emisi 2,5 kg CO₂ dan 1.000 liter air terbuang.',
  },
]

const FEATURES = [
  {
    icon: Package,
    badge: 'Inventaris',
    title: 'Manajemen Inventaris Cerdas',
    desc: 'Catat stok, kategori, dan lokasi penyimpanan. AI otomatis hitung masa simpan dan urgensi pemakaian.',
  },
  {
    icon: Brain,
    badge: 'Prediksi AI',
    title: 'Prediksi Risiko Pangan dengan AI',
    desc: 'Prediksi risiko pemborosan pangan berbasis pola konsumsi, kategori bahan, dan kondisi penyimpanan.',
  },
  {
    icon: ScanSearch,
    badge: 'Pemindai AI',
    title: 'Pemindai Bahan AI',
    desc: 'Foto bahan dari kamera, sistem mengenali kategori dan memberi estimasi masa simpan dalam hitungan detik.',
  },
  {
    icon: Lightbulb,
    badge: 'Rekomendasi',
    title: 'Rekomendasi Cerdas',
    desc: 'Dapatkan saran resep, harga diskon marketplace, atau aksi donasi untuk setiap bahan berisiko.',
  },
  {
    icon: ShoppingBag,
    badge: 'Marketplace',
    title: 'Marketplace Surplus',
    desc: 'Jual surplus pangan dengan harga terbaik atau temukan bahan diskon dari bisnis kuliner terdekat.',
  },
  {
    icon: Heart,
    badge: 'Donasi',
    title: 'Pusat Donasi',
    desc: 'Salurkan makanan layak konsumsi ke komunitas terdekat dengan jadwal penjemputan yang jelas.',
  },
  {
    icon: BarChart3,
    badge: 'Analitik',
    title: 'Dampak Keberlanjutan',
    desc: 'Lihat dampak nyata: kg pangan diselamatkan, CO₂ dihindari, dan air dihemat dari bulan ke bulan.',
  },
  {
    icon: Bell,
    badge: 'Real-time',
    title: 'Notifikasi & Pengingat',
    desc: 'Peringatan otomatis sebelum bahan kedaluwarsa langsung ke dasbor dan email Anda.',
  },
]

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Catat atau pindai stok',
    desc: 'Tambah bahan secara manual atau gunakan pemindai AI untuk identifikasi otomatis.',
  },
  {
    icon: Brain,
    title: 'AI menganalisis risiko',
    desc: 'Sistem hitung masa simpan, level risiko, dan urgensi tindakan untuk setiap bahan.',
  },
  {
    icon: Lightbulb,
    title: 'Terima rekomendasi',
    desc: 'Resep cepat, daftar diskon marketplace, atau saran donasi langsung ke dasbor.',
  },
  {
    icon: Recycle,
    title: 'Ambil aksi cepat',
    desc: 'Olah jadi menu, jual surplus di marketplace, atau donasikan ke komunitas terdekat.',
  },
  {
    icon: BarChart3,
    title: 'Pantau dampak',
    desc: 'Lihat laporan dampak bulanan: kg pangan diselamatkan dan emisi yang berhasil dihindari.',
  },
]

const TARGET_USERS = [
  { icon: CookingPot, label: 'Restoran', desc: 'Atur stok dapur dan resep harian.' },
  { icon: Cake, label: 'Toko Roti', desc: 'Kelola pastri dengan masa simpan singkat.' },
  { icon: Soup, label: 'Katering', desc: 'Sinkronkan stok dengan jadwal acara.' },
  { icon: Hotel, label: 'Hotel & Kafe', desc: 'Operasi makanan dan minuman lebih efisien.' },
  { icon: Building2, label: 'UMKM Kuliner', desc: 'Skala usaha kecil dengan tools enterprise.' },
  { icon: Home, label: 'Rumah Tangga', desc: 'Kurangi pemborosan pangan di dapur sehari-hari.' },
]

const IMPACT_STATS = [
  { value: '60%', label: 'Pengurangan pemborosan pangan rata-rata' },
  { value: '12.4K+', label: 'Bahan diselamatkan dari pembuangan' },
  { value: '38.846 kg', label: 'Surplus didistribusikan ke komunitas' },
  { value: '24%', label: 'Penghematan biaya bahan baku' },
]

const TESTIMONIALS = [
  {
    name: 'Putri Wulandari',
    role: 'Pemilik, Dapur Hijau Catering',
    initial: 'PW',
    rating: 5,
    quote:
      'Sebelum F.R.E.S.H, kami buang sekitar 15 kg bahan tiap minggu. Sekarang AI memberi peringatan lebih awal dan kami bisa menjual surplus lewat marketplace.',
  },
  {
    name: 'Rian Pratama',
    role: 'Koki, Kafe Sayur Segar',
    initial: 'RP',
    rating: 5,
    quote:
      'Fitur pemindai AI menghemat waktu input. Notifikasi risiko membantu kami lebih disiplin merotasi stok dan membuat menu spesial dari bahan hampir habis.',
  },
  {
    name: 'Komunitas Berbagi Makan',
    role: 'Mitra Donasi',
    initial: 'KB',
    rating: 5,
    quote:
      'Penjemputan, persetujuan, dan pelacakan donasi sekarang berjalan dalam satu platform. Jauh lebih cepat dari proses manual sebelumnya.',
  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('beranda')

  // Parallax mouse tracking untuk hero visual
  const visualRef = useRef(null)
  const rafRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = visualRef.current
    if (!el) return

    function onMouseMove(e) {
      const rect = el.getBoundingClientRect()
      // Normalise ke -1..1 relatif ke tengah elemen
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      }
    }

    function onMouseLeave() {
      mouseRef.current = { x: 0, y: 0 }
    }

    function animate() {
      // Lerp (smooth follow)
      currentRef.current.x += (mouseRef.current.x - currentRef.current.x) * 0.08
      currentRef.current.y += (mouseRef.current.y - currentRef.current.y) * 0.08

      const { x, y } = currentRef.current

      // Panel utama — tilt 3D ringan
      const panel = el.querySelector('.lp-hero__panel')
      if (panel) {
        panel.style.transform = `
          perspective(900px)
          rotateY(${x * 5}deg)
          rotateX(${-y * 4}deg)
          translateZ(0)
        `
      }

      // Chip atas — bergerak lebih cepat (parallax layer 2)
      const chipTop = el.querySelector('.lp-hero__chip--top')
      if (chipTop) {
        chipTop.style.transform = `translate(${x * -18}px, ${y * -14}px)`
      }

      // Chip bawah — bergerak berlawanan arah (parallax layer 3)
      const chipBot = el.querySelector('.lp-hero__chip--bottom')
      if (chipBot) {
        chipBot.style.transform = `translate(${x * 14}px, ${y * 12}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    el.addEventListener('mousemove', onMouseMove, { passive: true })
    el.addEventListener('mouseleave', onMouseLeave, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll spy — deteksi section yang sedang aktif
  useEffect(() => {
    const sectionIds = ['beranda', 'masalah', 'fitur', 'cara-kerja', 'dampak']

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="lp">
      {/* ===== NAVBAR ===== */}
      <header className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="lp-container lp-nav__inner">
          <Link to="/" className="lp-brand" aria-label="F.R.E.S.H beranda">
            <img src={logo} alt="" />
            <div>
              <strong>F.R.E.S.H</strong>
              <span>Platform AI Pengelolaan Pangan</span>
            </div>
          </Link>

          <nav
            className={`lp-nav__menu ${mobileOpen ? 'is-open' : ''}`}
            aria-label="Navigasi utama"
          >
            {NAV_LINKS.map((link) =>
              link.external ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={activeSection === link.href.replace('#', '') ? 'is-active' : ''}
                >
                  {link.label}
                </a>
              )
            )}
            <div className="lp-nav__menu-cta">
              <Link to="/login" className="lp-btn lp-btn--text">
                Masuk
              </Link>
              <Link to="/register" className="lp-btn lp-btn--primary lp-btn--sm">
                Mulai Sekarang
                <ArrowRight size={14} strokeWidth={2.4} />
              </Link>
            </div>
          </nav>

          <div className="lp-nav__cta">
            <Link to="/login" className="lp-btn lp-btn--text">
              Masuk
            </Link>
            <Link to="/register" className="lp-btn lp-btn--primary lp-btn--sm">
              Mulai Sekarang
              <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>

          <button
            type="button"
            className="lp-nav__toggle"
            aria-label="Buka menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        {/* ===== HERO ===== */}
        <section className="lp-hero" id="beranda">
          <div className="lp-container lp-hero__grid">
            <div className="lp-hero__copy">
              <span className="lp-eyebrow">
                <Sparkles size={12} strokeWidth={2.6} />
                Pengelolaan pangan berbasis AI
              </span>
              <h1>
                Cegah pemborosan pangan <span>sebelum terjadi.</span>
              </h1>
              <p>
                F.R.E.S.H membantu rumah tangga dan bisnis kuliner memantau stok,
                memprediksi risiko kedaluwarsa, dan mengubah surplus pangan menjadi
                peluang lewat marketplace dan donasi — semua dalam satu dasbor
                berbasis AI.
              </p>
              <div className="lp-hero__cta">
                <Link to="/register" className="lp-btn lp-btn--primary lp-btn--lg">
                  Mulai Kelola Pangan
                  <ArrowRight size={18} strokeWidth={2.4} />
                </Link>
                <a href="#cara-kerja" className="lp-btn lp-btn--ghost lp-btn--lg">
                  <PlayCircle size={18} strokeWidth={2.2} />
                  Lihat Cara Kerjanya
                </a>
              </div>
              <div className="lp-hero__trust">
                <div className="lp-hero__avatars" aria-hidden="true">
                  <span style={{ background: '#fde2e4' }}>PW</span>
                  <span style={{ background: '#dcfce7' }}>RP</span>
                  <span style={{ background: '#dbeafe' }}>KB</span>
                  <span style={{ background: '#ffe4c4' }}>MA</span>
                </div>
                <div>
                  <div className="lp-hero__rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="#f6b100" stroke="none" />
                    ))}
                  </div>
                  <span>Dipercaya 1.200+ pelaku bisnis kuliner</span>
                </div>
              </div>
            </div>

            <div className="lp-hero__visual" ref={visualRef}>
              <div className="lp-hero__panel">
                <div className="lp-hero__panel-head">
                  <div className="lp-hero__panel-dots" aria-hidden="true">
                    <span /><span /><span />
                  </div>
                  <strong>Dasbor F.R.E.S.H</strong>
                  <span className="lp-hero__panel-status">
                    <span /> Aktif
                  </span>
                </div>

                <div className="lp-hero__panel-stats">
                  <article className="lp-hero__stat">
                    <span><ClipboardList size={14} strokeWidth={2.4} /> Total Stok</span>
                    <strong>248</strong>
                    <small>+12 sejak kemarin</small>
                  </article>
                  <article className="lp-hero__stat lp-hero__stat--warn">
                    <span><AlertTriangle size={14} strokeWidth={2.4} /> Risiko Tinggi</span>
                    <strong>14</strong>
                    <small>Perlu aksi hari ini</small>
                  </article>
                  <article className="lp-hero__stat lp-hero__stat--ok">
                    <span><Recycle size={14} strokeWidth={2.4} /> Diselamatkan</span>
                    <strong>62 kg</strong>
                    <small>Bulan ini</small>
                  </article>
                </div>

                <div className="lp-hero__panel-card">
                  <div>
                    <span className="lp-hero__panel-pill">
                      <Sparkles size={11} strokeWidth={2.6} />
                      Rekomendasi AI
                    </span>
                    <h4>Brokoli akan kedaluwarsa dalam 1 hari</h4>
                    <p>Buat sup krim brokoli atau jadikan tawaran diskon di marketplace.</p>
                  </div>
                  <button type="button" aria-label="Lihat rekomendasi">
                    <ArrowUpRight size={16} strokeWidth={2.4} />
                  </button>
                </div>

                <div className="lp-hero__panel-bars">
                  <div className="lp-hero__panel-bar">
                    <span>Sayur</span>
                    <div><div style={{ width: '78%' }} /></div>
                  </div>
                  <div className="lp-hero__panel-bar">
                    <span>Buah</span>
                    <div><div style={{ width: '54%' }} /></div>
                  </div>
                  <div className="lp-hero__panel-bar">
                    <span>Protein</span>
                    <div><div style={{ width: '40%' }} /></div>
                  </div>
                </div>
              </div>

              <div className="lp-hero__chip lp-hero__chip--top">
                <Leaf size={16} strokeWidth={2.4} />
                <div>
                  <strong>62 kg</strong>
                  <span>diselamatkan</span>
                </div>
              </div>
              <div className="lp-hero__chip lp-hero__chip--bottom">
                <ScanSearch size={16} strokeWidth={2.4} />
                <div>
                  <strong>Pemindai AI</strong>
                  <span>tersedia 24/7</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lp-container lp-stats-strip">
            {IMPACT_STATS.map((stat) => (
              <div key={stat.label} className="lp-stats-strip__item">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== PROBLEM ===== */}
        <section className="lp-section" id="masalah">
          <div className="lp-container">
            <div className="lp-section__head">
              <span className="lp-eyebrow lp-eyebrow--soft">
                <AlertTriangle size={12} strokeWidth={2.6} />
                Masalah yang nyata
              </span>
              <h2>
                Sepertiga makanan dunia terbuang setiap tahun. Sebagian besar
                karena pengelolaan stok yang tidak presisi.
              </h2>
              <p>
                Bisnis kuliner dan rumah tangga kehilangan jutaan rupiah setiap
                bulan dari pemborosan pangan yang sebenarnya bisa dicegah dengan
                peringatan dini dan distribusi cepat.
              </p>
            </div>
            <div className="lp-grid lp-grid--4">
              {PROBLEMS.map((problem) => {
                const Icon = problem.icon
                return (
                  <article key={problem.title} className="lp-card lp-card--problem">
                    <span className="lp-card__icon">
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <h3>{problem.title}</h3>
                    <p>{problem.desc}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== SOLUTION SUMMARY ===== */}
        <section className="lp-section lp-section--solution">
          <div className="lp-container lp-solution__grid">
            <div>
              <span className="lp-eyebrow">
                <Sparkles size={12} strokeWidth={2.6} />
                Solusi terintegrasi
              </span>
              <h2>
                Satu platform untuk <span>memantau, memprediksi,</span> dan
                menyalurkan pangan Anda.
              </h2>
              <p>
                F.R.E.S.H menggabungkan inventaris, prediksi AI, marketplace,
                dan donasi dalam satu dasbor — sehingga setiap bahan punya
                jalur tindakan yang jelas sebelum berakhir di tempat sampah.
              </p>
              <ul className="lp-checklist">
                <li>
                  <CheckCircle2 size={18} strokeWidth={2.4} />
                  Peringatan dini sebelum bahan kedaluwarsa
                </li>
                <li>
                  <CheckCircle2 size={18} strokeWidth={2.4} />
                  Rekomendasi resep, jual, atau donasi otomatis
                </li>
                <li>
                  <CheckCircle2 size={18} strokeWidth={2.4} />
                  Marketplace surplus terhubung ke pembeli terdekat
                </li>
                <li>
                  <CheckCircle2 size={18} strokeWidth={2.4} />
                  Laporan dampak lingkungan dan finansial
                </li>
              </ul>
              <Link to="/register" className="lp-btn lp-btn--primary">
                Coba Dasbor Gratis
                <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
            <div className="lp-solution__visual">
              <div className="lp-solution__highlight">
                <span><Recycle size={20} strokeWidth={2.2} /></span>
                <strong>62 kg</strong>
                <p>Pangan diselamatkan bulan ini</p>
              </div>
              <div className="lp-solution__highlight lp-solution__highlight--alt">
                <span><Brain size={20} strokeWidth={2.2} /></span>
                <strong>Prediksi AI</strong>
                <p>Risiko pemborosan pangan dipantau secara real-time</p>
              </div>
              <div className="lp-solution__highlight">
                <span><Heart size={20} strokeWidth={2.2} /></span>
                <strong>Donasi</strong>
                <p>Tersalurkan ke komunitas terdekat</p>
              </div>
              <div className="lp-solution__highlight lp-solution__highlight--alt">
                <span><BarChart3 size={20} strokeWidth={2.2} /></span>
                <strong>+24%</strong>
                <p>Efisiensi biaya bahan baku</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="lp-section" id="fitur">
          <div className="lp-container">
            <div className="lp-section__head">
              <span className="lp-eyebrow lp-eyebrow--soft">
                <Brain size={12} strokeWidth={2.6} />
                Fitur unggulan
              </span>
              <h2>Dirancang seperti pusat kontrol pangan modern.</h2>
              <p>
                Dari pelacakan stok harian hingga laporan keberlanjutan bulanan,
                setiap fitur dibangun untuk membantu Anda mengubah data menjadi
                tindakan.
              </p>
            </div>
            <div className="lp-features-grid">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <article key={feature.title} className="lp-feature">
                    <span className="lp-feature__icon">
                      <Icon size={20} strokeWidth={2.2} />
                    </span>
                    <span className="lp-feature__badge">{feature.badge}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="lp-section lp-section--soft" id="cara-kerja">
          <div className="lp-container">
            <div className="lp-section__head">
              <span className="lp-eyebrow">
                <Recycle size={12} strokeWidth={2.6} />
                Cara kerja
              </span>
              <h2>Lima langkah untuk dapur dan bisnis tanpa pemborosan.</h2>
              <p>
                Mulai dari input bahan, sistem AI yang menganalisis, hingga
                tindakan nyata yang berdampak ke bisnis dan lingkungan Anda.
              </p>
            </div>
            <ol className="lp-steps">
              {STEPS.map((step, idx) => {
                const Icon = step.icon
                return (
                  <li key={step.title}>
                    <div className="lp-steps__num">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="lp-steps__icon">
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* ===== DASHBOARD PREVIEW ===== */}
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-section__head">
              <span className="lp-eyebrow lp-eyebrow--soft">
                <BarChart3 size={12} strokeWidth={2.6} />
                Pratinjau dasbor
              </span>
              <h2>Semua yang Anda butuhkan dalam satu tampilan.</h2>
              <p>
                Kartu ringkasan, daftar bahan berisiko, rekomendasi AI, dan
                aktivitas terbaru — semuanya bisa diakses dengan satu kali masuk.
              </p>
            </div>
            <div className="lp-preview">
              <header className="lp-preview__head">
                <div className="lp-preview__dots" aria-hidden="true">
                  <span /><span /><span />
                </div>
                <strong>app.fresh.com / dashboard</strong>
              </header>
              <div className="lp-preview__grid">
                <div className="lp-preview__welcome">
                  <span className="lp-eyebrow lp-eyebrow--invert">Hari ini</span>
                  <h3>Halo, Mitra F.R.E.S.H 👋</h3>
                  <p>14 bahan dengan risiko tinggi perlu aksi segera.</p>
                </div>

                <article className="lp-preview__metric">
                  <span><ClipboardList size={14} /> Total stok</span>
                  <strong>248</strong>
                </article>
                <article className="lp-preview__metric lp-preview__metric--danger">
                  <span><AlertTriangle size={14} /> Risiko tinggi</span>
                  <strong>14</strong>
                </article>
                <article className="lp-preview__metric lp-preview__metric--success">
                  <span><Recycle size={14} /> Diselamatkan</span>
                  <strong>62 kg</strong>
                </article>

                <article className="lp-preview__list">
                  <h4>Inventaris terbaru</h4>
                  <ul>
                    <li>
                      <span>Brokoli segar</span>
                      <em className="lp-tag lp-tag--danger">1 hari lagi</em>
                    </li>
                    <li>
                      <span>Susu UHT 1L</span>
                      <em className="lp-tag lp-tag--warning">3 hari lagi</em>
                    </li>
                    <li>
                      <span>Roti tawar gandum</span>
                      <em className="lp-tag lp-tag--success">7 hari lagi</em>
                    </li>
                    <li>
                      <span>Daging ayam fillet</span>
                      <em className="lp-tag lp-tag--warning">2 hari lagi</em>
                    </li>
                  </ul>
                </article>

                <article className="lp-preview__ai">
                  <span className="lp-preview__ai-pill">
                    <Sparkles size={12} strokeWidth={2.6} />
                    Rekomendasi AI
                  </span>
                  <h4>Sup krim brokoli</h4>
                  <p>
                    Olah brokoli segar hari ini, atau jadikan tawaran diskon di
                    marketplace surplus.
                  </p>
                  <span className="lp-preview__ai-cta">
                    Lihat semua rekomendasi
                    <ArrowUpRight size={14} strokeWidth={2.4} />
                  </span>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ===== IMPACT ===== */}
        <section className="lp-section lp-section--impact" id="dampak">
          <div className="lp-container lp-impact__grid">
            <div className="lp-impact__copy">
              <span className="lp-eyebrow lp-eyebrow--invert">
                <Leaf size={12} strokeWidth={2.6} />
                Dampak keberlanjutan
              </span>
              <h2>
                Tindakan kecil tiap hari, dampak besar bagi bumi dan bisnis.
              </h2>
              <p>
                Setiap kilogram pangan yang diselamatkan berarti emisi karbon
                berkurang dan biaya operasional ikut turun. Dasbor dampak
                kami menerjemahkan aksi Anda menjadi angka yang bisa dilaporkan.
              </p>
              <Link to="/register" className="lp-btn lp-btn--white">
                Mulai Hitung Dampak Anda
                <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
            <div className="lp-impact__cards">
              <article>
                <Recycle size={20} strokeWidth={2.2} />
                <strong>12.4K+</strong>
                <span>Bahan diselamatkan dari pembuangan</span>
              </article>
              <article>
                <Droplets size={20} strokeWidth={2.2} />
                <strong>32.000 L</strong>
                <span>Air dihemat dari produksi pangan</span>
              </article>
              <article>
                <Leaf size={20} strokeWidth={2.2} />
                <strong>−18 ton</strong>
                <span>Estimasi emisi CO₂ dihindari</span>
              </article>
              <article>
                <Users size={20} strokeWidth={2.2} />
                <strong>1.200+</strong>
                <span>Mitra bergabung mengurangi pemborosan pangan</span>
              </article>
            </div>
          </div>
        </section>

        {/* ===== TARGET USERS ===== */}
        <section className="lp-section" id="pengguna">
          <div className="lp-container">
            <div className="lp-section__head">
              <span className="lp-eyebrow lp-eyebrow--soft">
                <Users size={12} strokeWidth={2.6} />
                Untuk siapa
              </span>
              <h2>Cocok untuk berbagai pelaku ekosistem pangan.</h2>
              <p>
                Mulai dari rumah tangga sampai jaringan restoran — setiap orang
                yang berurusan dengan stok pangan butuh sistem yang lebih cerdas.
              </p>
            </div>
            <div className="lp-users-grid">
              {TARGET_USERS.map((user) => {
                const Icon = user.icon
                return (
                  <article key={user.label} className="lp-user-card">
                    <span className="lp-user-card__icon">
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <strong>{user.label}</strong>
                    <p>{user.desc}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="lp-section lp-section--soft">
          <div className="lp-container">
            <div className="lp-section__head">
              <span className="lp-eyebrow">
                <Star size={12} strokeWidth={2.6} />
                Cerita pengguna
              </span>
              <h2>Dipercaya pelaku kuliner dan komunitas donasi.</h2>
            </div>
            <div className="lp-grid lp-grid--3">
              {TESTIMONIALS.map((testimonial) => (
                <article key={testimonial.name} className="lp-testimonial">
                  <div className="lp-testimonial__rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#f6b100" stroke="none" />
                    ))}
                  </div>
                  <p>“{testimonial.quote}”</p>
                  <footer>
                    <span className="lp-testimonial__avatar">
                      {testimonial.initial}
                    </span>
                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="lp-cta">
          <div className="lp-container lp-cta__inner">
            <div className="lp-cta__content">
              <span className="lp-eyebrow lp-eyebrow--invert">
                <Zap size={12} strokeWidth={2.6} />
                Mulai gratis hari ini
              </span>
              <h2>Siap mengubah surplus pangan jadi peluang nyata?</h2>
              <p>
                Coba F.R.E.S.H tanpa biaya. Tidak perlu kartu kredit, hanya niat
                untuk dapur dan bisnis yang lebih efisien dan berkelanjutan.
              </p>
            </div>
            <div className="lp-cta__buttons">
              <Link to="/register" className="lp-btn lp-btn--white lp-btn--lg">
                Buat Akun Gratis
                <ArrowRight size={18} strokeWidth={2.4} />
              </Link>
              <Link to="/login" className="lp-btn lp-btn--outline-invert lp-btn--lg">
                Saya Sudah Punya Akun
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer__top">
          <div className="lp-footer__brand">
            <Link to="/" className="lp-brand">
              <img src={logo} alt="" />
              <div>
                <strong>F.R.E.S.H</strong>
                <span>Platform AI Pengelolaan Pangan</span>
              </div>
            </Link>
            <p>
              Platform pengelolaan pangan berbasis AI untuk rumah tangga dan
              bisnis kuliner yang peduli pada efisiensi dan keberlanjutan.
            </p>
            <form
              className="lp-footer__newsletter"
              onSubmit={(e) => e.preventDefault()}
            >
              <Mail size={16} strokeWidth={2.2} />
              <input type="email" placeholder="Email untuk update produk" />
              <button type="submit" aria-label="Berlangganan">
                <ArrowDownToLine size={16} strokeWidth={2.4} />
              </button>
            </form>
          </div>
          <div>
            <h4>Produk</h4>
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#dampak">Dampak</a>
            <Link to="/register">Mulai Sekarang</Link>
          </div>
          <div>
            <h4>Sumber Daya</h4>
            <a href="#masalah">Mengapa F.R.E.S.H</a>
            <a href="#pengguna">Untuk Bisnis</a>
            <a href="#pengguna">Untuk Rumah Tangga</a>
            <Link to="/login">Masuk</Link>
          </div>
          <div>
            <h4>Kontak</h4>
            <p>fresh@email.com</p>
            <p>Jambi, Indonesia</p>
            <p>Senin – Sabtu, 09.00 – 18.00 WIB</p>
            <span className="lp-footer__shield">
              <ShieldCheck size={14} strokeWidth={2.2} />
              Keamanan siap SOC2
            </span>
          </div>
        </div>
        <div className="lp-container lp-footer__bottom">
          <span>© {new Date().getFullYear()} F.R.E.S.H Solutions. Hak cipta dilindungi.</span>
          <span>Dibangun untuk mengurangi pemborosan pangan 🌱</span>
        </div>
      </footer>
    </div>
  )
}
