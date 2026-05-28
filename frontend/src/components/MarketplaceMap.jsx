import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function ResizeMap() 
{
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 300)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const productIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

function getUserFromStorage() 
{
  try {
    return JSON.parse(localStorage.getItem('user')) || {}
  } catch {
    return {}
  }
}

function formatRupiah(value) 
{
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

export default function MarketplaceMap({
  items = [],
}) {
  const user = getUserFromStorage()
  const userLat = Number(user.latitude)
  const userLng = Number(user.longitude)
  const hasUserLocation =
    user.latitude !== null &&
    user.latitude !== undefined &&
    user.longitude !== null &&
    user.longitude !== undefined &&
    !Number.isNaN(userLat) &&
    !Number.isNaN(userLng)
  const defaultPosition = [-1.6101, 103.6131]
  const userPosition = hasUserLocation
    ? [userLat, userLng]
    : defaultPosition
  const validItems = items.filter((item) => {
    const lat = Number(item.seller_latitude)
    const lng = Number(item.seller_longitude)
    return (
      item.seller_latitude !== null &&
      item.seller_latitude !== undefined &&
      item.seller_longitude !== null &&
      item.seller_longitude !== undefined &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng)
    )
  })

  return (
    <MapContainer
      center={userPosition}
      zoom={13}
      scrollWheelZoom={true}
      className="marketplace-map"
    >
      <ResizeMap />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hasUserLocation && (
        <Marker
          position={userPosition}
          icon={userIcon}
        >
          <Popup>
            <div className="marketplace-map-popup">
              <strong>Lokasi Saya</strong>
              <br />
              {user.address || 'Lokasi pembeli'}
            </div>
          </Popup>
        </Marker>
      )}
      {validItems.map((item) => 
      {
        const sellerLat = Number(item.seller_latitude)
        const sellerLng = Number(item.seller_longitude)
        return (
          <Marker
            key={item.id}
            position={[sellerLat, sellerLng]}
            icon={productIcon}
          >
            <Popup>
              <div className="marketplace-map-popup">
                <strong>
                  {item.seller_name || 'Nama toko belum ada'}
                </strong>
                <br />
                Produk: {item.product_name}
                <br />
                Harga: {formatRupiah(item.price)}
                <br />
                Stok: {item.stock} {item.unit || ''}
                <br />
                Jarak:{' '}
                {item.distance !== null &&
                item.distance !== undefined
                  ? `${item.distance} km`
                  : '-'}
                <br />
                Kadaluarsa: {item.expiry_date || '-'}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}