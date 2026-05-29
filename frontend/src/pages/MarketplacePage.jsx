import { useEffect, useMemo, useState } from 'react'
import { MapPin, ShoppingCart, Trash2, Plus, Minus, Search, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import BusinessLayout from '../components/BusinessLayout'
import MarketplaceMap from '../components/MarketplaceMap'
import { useFeedback } from '../components/feedback/feedbackContext'
import { getMarketplaceProducts } from '../services/marketplaceService'
import { createTransaction } from '../services/transactionService'
import { loadUserLocation } from '../utils/geo'
import '../styles/marketplace.css'

export default function MarketplacePage() {
  const feedback = useFeedback()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [showAllDistance, setShowAllDistance] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const savedLoc = loadUserLocation()
  const hasLocation = (user.latitude && user.longitude) || (savedLoc?.latitude && savedLoc?.longitude)

  const isBusiness =
    user.role === 'bisnis' ||
    user.role === 'business'
  const Layout = isBusiness
    ? BusinessLayout
    : AppLayout

  useEffect(() => {
    async function initializeMarketplace() {
      try {
        await loadMarketplace()
      } catch (error) {
        console.error(error)
      }
      if (isBusiness) {
        setCart([])
        return
      }
      try {
        const storedCart =
          localStorage.getItem('marketplace_cart')
        if (
          storedCart &&
          storedCart !== 'undefined' &&
          storedCart !== 'null'
        ) {
          const parsedCart = JSON.parse(storedCart)
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart)
          } else {
            setCart([])
          }
        } else {
          setCart([])
        }
      } catch (error) {
        console.error(error)
        setCart([])
      }
    }
    initializeMarketplace()
  }, [])

  useEffect(() => {
    if (!isBusiness) {
      localStorage.setItem(
        'marketplace_cart',
        JSON.stringify(cart)
      )
    }
  }, [cart, isBusiness])

  async function loadMarketplace(keyword = '') {
    try {
      setLoading(true)
      const data = await getMarketplaceProducts(keyword)
      setItems(data || [])
      setShowAllDistance(false)
    } catch (error) {
      console.error(error)
      feedback.error(error.message || 'Gagal mengambil produk marketplace')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    loadMarketplace(search)
  }

  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  function getDistance(product) {
    const distance = Number(product.distance)
    if (Number.isNaN(distance)) {
      return null
    }
    return distance
  }

  const filteredItems = useMemo(() => {
    if (showAllDistance) {
      return items
    }
    return items.filter((product) => {
      const distance = getDistance(product)
      if (distance === null) {
        return true
      }
      return distance <= 10
    })
  }, [items, showAllDistance])

  const farItemsCount = useMemo(() => {
    return items.filter((product) => {
      const distance = getDistance(product)
      return distance !== null && distance > 10
    }).length
  }, [items])

  function addToCart(product) {
    if (isBusiness) return
    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      if (existing.quantity >= Number(product.stock)) {
        feedback.warning('Jumlah melebihi stok produk')
        return
      }
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
      return
    }
    setCart([...cart, {
      id: product.id,
      product_name: product.product_name,
      seller_name: product.seller_name,
      price: Number(product.price),
      stock: Number(product.stock),
      unit: product.unit,
      quantity: 1,
    }])
  }

  function increaseQuantity(productId) {
    if (isBusiness) return
    setCart(cart.map((item) => {
      if (item.id !== productId) return item
      if (item.quantity >= item.stock) {
        feedback.warning('Jumlah melebihi stok produk')
        return item
      }
      return { ...item, quantity: item.quantity + 1 }
    }))
  }

  function decreaseQuantity(productId) {
    if (isBusiness) return
    setCart(
      cart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function removeFromCart(productId) {
    if (isBusiness) return
    setCart(
      cart.filter((item) => item.id !== productId)
    )
  }

  const totalPrice = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    )
  }, [cart])

  async function handleCreateOrder() {
    if (isBusiness) {
      feedback.warning('Akun bisnis tidak dapat melakukan transaksi.')
      return
    }
    if (cart.length === 0) {
      feedback.warning('Keranjang masih kosong')
      return
    }
    try {
      setOrdering(true)
      const payload = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }))
      await createTransaction(payload)
      feedback.success('Pesanan berhasil dibuat')
      setCart([])
      localStorage.removeItem('marketplace_cart')
      await loadMarketplace(search)
    } catch (error) {
      console.error(error)
      feedback.error(error.message || 'Gagal membuat pesanan')
    } finally {
      setOrdering(false)
    }
  }

  return (
    <Layout title="MARKETPLACE" pageTitle="MARKETPLACE">
      <div className="marketplace-page">
        <div className="marketplace-header">
          <div>
            <h1>Marketplace</h1>
            <p>
              Temukan bahan makanan dari pengguna bisnis
              terdekat.
            </p>
          </div>
        </div>

        {/* Banner lokasi belum diatur */}
        {!hasLocation && (
          <div className="location-banner">
            <div className="location-banner__icon">
              <Navigation size={20} strokeWidth={2.5} />
            </div>
            <div className="location-banner__text">
              <strong>Lokasi belum diatur</strong>
              <span>Atur lokasi Anda agar bisa melihat produk terdekat dan jarak ke penjual.</span>
            </div>
            <button
              type="button"
              className="location-banner__btn"
              onClick={() => navigate('/profile')}
            >
              <MapPin size={14} strokeWidth={2.5} />
              Atur Lokasi
            </button>
          </div>
        )}
        <form
          className="marketplace-search"
          onSubmit={handleSearchSubmit}
        >
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
          <button type="submit">
            Cari
          </button>
        </form>
        <div className="marketplace-map-card">
          <MarketplaceMap items={filteredItems} />
        </div>
        {isBusiness && (
          <div className="business-marketplace-note">
            Akun bisnis hanya dapat melihat produk
            marketplace dan lokasi seller.
          </div>
        )}
        <div
          className={
            isBusiness
              ? 'marketplace-content business-view'
              : 'marketplace-content'
          }
        >
          <section className="product-section">
            <div className="section-title marketplace-section-title">
              <div>
                <h2>Daftar Produk</h2>
                <span>
                  {filteredItems.length} produk ditampilkan
                </span>
              </div>
              {farItemsCount > 0 && (
                <button
                  type="button"
                  className="show-distance-btn"
                  onClick={() =>
                    setShowAllDistance(!showAllDistance)
                  }
                >
                  {showAllDistance
                    ? 'Tampilkan ≤ 10 km'
                    : `Tampilkan Semua (${farItemsCount} jauh)`}
                </button>
              )}
            </div>
            {!showAllDistance && farItemsCount > 0 && (
              <div className="distance-info">
                Menampilkan produk terdekat 10 km.
              </div>
            )}
            {loading ? (
              <div className="empty-state">
                Memuat produk...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                Belum ada produk dalam jarak 10 km.
              </div>
            ) : (
              <div className="product-grid">
                {filteredItems.map((product) => (
                  <div
                    className="product-card"
                    key={product.id}
                  >
                    <div className="product-info">
                      <h3>
                        {product.product_name}
                      </h3>
                      <p className="product-category">
                        {product.category ||
                          'Tanpa kategori'}
                      </p>
                      <p className="product-description">
                        {product.description ||
                          'Tidak ada deskripsi'}
                      </p>
                      <div className="seller-location">
                        <MapPin size={16} />
                        <span>
                          {product.seller_name ||
                            'Seller'}
                          {product.distance !== null &&
                            product.distance !==
                              undefined &&
                            ` • ${product.distance} km`}
                        </span>
                      </div>
                      <div className="product-meta">
                        <span>
                          Stok: {product.stock}{' '}
                          {product.unit}
                        </span>
                        <span>
                          Exp:{' '}
                          {product.expiry_date || '-'}
                        </span>
                      </div>
                    </div>
                    <div className="product-footer">
                      <strong>
                        {formatRupiah(product.price)}
                      </strong>
                      {!isBusiness && (
                        <button
                          type="button"
                          onClick={() =>
                            addToCart(product)
                          }
                        >
                          <ShoppingCart size={16} />
                          Beli
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          {!isBusiness && (
            <aside className="cart-section">
              <div className="section-title">
                <h2>Keranjang</h2>
                <span>{cart.length} item</span>
              </div>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  Keranjang masih kosong.
                </div>
              ) : (
                <>
                  <div className="cart-list">
                    {cart.map((item) => (
                      <div
                        className="cart-item"
                        key={item.id}
                      >
                        <div className="cart-item-info">
                          <h4>{item.product_name}</h4>
                          <p>{item.seller_name}</p>
                          <strong>
                            {formatRupiah(item.price)}
                          </strong>
                        </div>
                        <div className="cart-controls">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.id
                              )
                            }
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              removeFromCart(item.id)
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="cart-subtotal">
                          {formatRupiah(
                            item.price *
                              item.quantity
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-total">
                    <span>Total Harga</span>
                    <strong>
                      {formatRupiah(totalPrice)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="order-btn"
                    onClick={handleCreateOrder}
                    disabled={ordering}
                  >
                    {ordering
                      ? 'Memproses...'
                      : 'Pesan'}
                  </button>
                </>
              )}
            </aside>
          )}
        </div>
      </div>
    </Layout>
  )
}